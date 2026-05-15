import mongoose from "mongoose";
import { Blog } from "../models/blog.model.js";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/apiError.js";

const commentAuthorSelect = "name username avatar";

export async function getBlogCommentsService({ blogId, query, userId = null }) {
  assertValidObjectId(blogId, "Invalid blog id.");

  const { limit, skip } = parsePagination(query);
  const rootFilter = { blog: blogId, parentComment: null };

  const [rootComments, total] = await Promise.all([
    Comment.find(rootFilter)
      .select("+likedBy")
      .populate("author", commentAuthorSelect)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Comment.countDocuments(rootFilter),
  ]);
  const rootIds = rootComments.map((comment) => comment._id);
  const replies = rootIds.length
    ? await Comment.find({ blog: blogId, rootComment: { $in: rootIds }, parentComment: { $ne: null } })
        .select("+likedBy")
        .populate("author", commentAuthorSelect)
        .sort({ createdAt: -1 })
        .lean()
    : [];

  return {
    comments: buildCommentTree(addViewerState([...rootComments, ...replies], userId)),
    pagination: {
      limit,
      skip,
      nextSkip: skip + limit < total ? skip + limit : null,
      total,
      hasNextPage: skip + limit < total,
    },
  };
}

export async function createBlogCommentService({ blogId, body, userId }) {
  assertValidObjectId(blogId, "Invalid blog id.");

  const text = String(body.body || body.comment || "").trim().replace(/\s+/g, " ");
  const parentCommentId = body.parentCommentId || body.parentComment || null;

  if (parentCommentId) {
    assertValidObjectId(parentCommentId, "Invalid parent comment id.");
  }

  if (!text) {
    throw new ApiError(400, "Comment cannot be empty.");
  }

  if (text.length > 1000) {
    throw new ApiError(400, "Comment must be 1000 characters or fewer.");
  }

  const blog = await Blog.findOne({ _id: blogId, status: "published" }).select("_id").lean();

  if (!blog) {
    throw new ApiError(404, "Blog not found.");
  }

  const parentComment = parentCommentId
    ? await Comment.findOne({ _id: parentCommentId, blog: blogId }).select("_id rootComment depth").lean()
    : null;

  if (parentCommentId && !parentComment) {
    throw new ApiError(404, "Parent comment not found.");
  }

  const parentDepth = parentComment ? normalizeCommentDepth(parentComment.depth) : null;
  const commentDepth = parentComment ? parentDepth + 1 : 0;

  if (commentDepth > 3) {
    throw new ApiError(400, "Reply thread is too deep.");
  }

  const comment = await Comment.create({
    blog: blogId,
    author: userId,
    body: text,
    parentComment: parentComment?._id || null,
    rootComment: parentComment?.rootComment || parentComment?._id || null,
    depth: commentDepth,
  });

  if (!comment.rootComment) {
    comment.rootComment = comment._id;
    await comment.save();
  }

  await Promise.all([
    Blog.updateOne({ _id: blogId }, { $inc: { commentsCount: 1 } }),
    parentComment ? Comment.updateOne({ _id: parentComment._id }, { $inc: { repliesCount: 1 } }) : null,
  ]);

  const savedComment = await Comment.findById(comment._id)
    .populate("author", commentAuthorSelect)
    .lean();

  return { comment: { ...savedComment, replies: [] } };
}

export async function updateBlogCommentLikeService({ blogId, commentId, liked, userId }) {
  assertValidObjectId(blogId, "Invalid blog id.");
  assertValidObjectId(commentId, "Invalid comment id.");
  assertValidObjectId(userId, "Invalid user id.");

  const comment = liked
    ? await Comment.findOneAndUpdate(
        { _id: commentId, blog: blogId, likedBy: { $ne: userId } },
        { $addToSet: { likedBy: userId }, $inc: { likesCount: 1 } },
        { projection: { likesCount: 1, likedBy: 1 }, returnDocument: "after" },
      )
        .select("+likedBy")
        .lean()
    : await unlikeComment({ blogId, commentId, userId });

  const nextComment = comment || await Comment.findOne({ _id: commentId, blog: blogId })
    .select("+likedBy likesCount")
    .lean();

  if (!nextComment) {
    throw new ApiError(404, "Comment not found.");
  }

  return {
    isLiked: isIdInList(nextComment.likedBy, userId),
    likesCount: nextComment.likesCount || 0,
  };
}

function buildCommentTree(comments) {
  const commentsById = new Map();
  const roots = [];

  for (const comment of comments) {
    commentsById.set(String(comment._id), { ...comment, replies: [] });
  }

  for (const comment of commentsById.values()) {
    if (comment.parentComment) {
      const parent = commentsById.get(String(comment.parentComment));

      if (parent) {
        parent.replies.push(comment);
        continue;
      }
    }

    roots.push(comment);
  }

  for (const comment of commentsById.values()) {
    comment.replies.sort(sortNewestFirst);
  }

  return roots.sort(sortNewestFirst);
}

function sortNewestFirst(first, second) {
  return new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime();
}

function parsePagination(query) {
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 20, 1), 50);
  const skip = Math.max(Number.parseInt(query.skip, 10) || 0, 0);

  return { limit, skip };
}

function normalizeCommentDepth(depth) {
  const parsedDepth = Number(depth);

  return Number.isFinite(parsedDepth) && parsedDepth >= 0 ? parsedDepth : 0;
}

async function unlikeComment({ blogId, commentId, userId }) {
  const updatedComment = await Comment.findOneAndUpdate(
    { _id: commentId, blog: blogId, likedBy: userId, likesCount: { $gt: 0 } },
    { $pull: { likedBy: userId }, $inc: { likesCount: -1 } },
    { projection: { likesCount: 1, likedBy: 1 }, returnDocument: "after" },
  )
    .select("+likedBy")
    .lean();

  if (updatedComment) {
    return updatedComment;
  }

  return Comment.findOne({ _id: commentId, blog: blogId })
    .select("+likedBy likesCount")
    .lean();
}

function addViewerState(comments, userId) {
  return comments.map((comment) => {
    const { likedBy, ...publicComment } = comment;

    return {
      ...publicComment,
      isLiked: userId ? isIdInList(likedBy, userId) : false,
    };
  });
}

function isIdInList(list = [], id) {
  return list.some((item) => String(item) === String(id));
}

function assertValidObjectId(id, message) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, message);
  }
}
