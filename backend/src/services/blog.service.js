import mongoose from "mongoose";
import { Blog } from "../models/blog.model.js";
import { Comment } from "../models/comment.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { slugify } from "../utils/slugify.js";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "./upload.service.js";

const blogListSelect = "title slug heading subheading excerpt coverImage tags category contentType author status readTime views likesCount commentsCount isFeatured createdAt updatedAt";
const blogDetailSelect = `${blogListSelect} content`;
const authorListSelect = "name username avatar bio skills socialLinks";
const userProfileSelect = "name username avatar banner bio skills socialLinks portfolio followers following";
const authorDetailSelect = "name username avatar banner bio skills socialLinks portfolio";

export async function createBlogService({ body, contentType = "blog", file, userId }) {
  const slug = await generateUniqueBlogSlug(body.title);
  const coverImage = file ? await uploadBlogCover(file, slug) : undefined;
  const normalizedContentType = normalizeContentType(contentType);

  const blog = await Blog.create({
    ...body,
    contentType: normalizedContentType,
    slug,
    author: userId,
    status: body.status || "published",
    excerpt: body.excerpt || generateExcerpt(body.content),
    readTime: calculateReadTime(body.content),
    coverImage,
  });

  const savedBlog = await Blog.findById(blog._id)
    .select(blogDetailSelect)
    .populate("author", authorListSelect)
    .lean();

  return savedBlog;
}

export async function getAllBlogsService(query, viewer) {
  const { page, limit, skip } = parsePagination(query, 10);
  const filter = buildBlogFilter(query);
  const sort = buildBlogSort(query.sort);

  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .select(blogListSelect)
      .populate("author", authorListSelect)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments(filter),
  ]);

  return {
    blogs: await addViewerState(blogs, viewer?.id),
    pagination: buildPagination({ page, limit, skip, total }),
  };
}

export async function getBlogBySlugService(identifier, viewer, query = {}) {
  const contentTypeFilter = buildContentTypeFilter(query.contentType);
  const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
  const filter = isObjectId
    ? { _id: identifier, ...contentTypeFilter }
    : { slug: identifier, ...contentTypeFilter };

  let blog = await Blog.findOne(filter)
    .select(blogDetailSelect)
    .populate("author", authorDetailSelect)
    .lean();

  if (!blog && isObjectId && normalizeContentType(query.contentType) === "project") {
    blog = await Blog.findById(identifier)
      .select(blogDetailSelect)
      .populate("author", authorDetailSelect)
      .lean();
  }

  if (!blog) {
    throw new ApiError(404, normalizeContentType(query.contentType) === "project" ? "Project not found." : "Blog not found.");
  }

  return addViewerState(blog, viewer?.id);
}

export async function getMyBlogByIdService({ blogId, contentType = "blog", userId }) {
  assertValidObjectId(blogId, "Invalid blog id.");

  const blog = await Blog.findOne({ _id: blogId, author: userId, ...buildContentTypeFilter(contentType) })
    .select(blogDetailSelect)
    .populate("author", authorDetailSelect)
    .lean();

  if (!blog) {
    throw new ApiError(404, "Blog not found.");
  }

  return blog;
}

export async function getBlogsByUserService({ userId, query, viewer }) {
  assertValidObjectId(userId, "Invalid user id.");

  const { page, limit, skip } = parsePagination(query, 10);
  const filter = {
    ...buildBlogFilter(query),
    author: userId,
  };
  const sort = buildBlogSort(query.sort);

  const [blogs, total, stats, user] = await Promise.all([
    Blog.find(filter)
      .select(blogListSelect)
      .populate("author", authorListSelect)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments(filter),
    getBlogStats({ author: userId, status: "published", ...buildContentTypeFilter(query.contentType) }),
    User.findById(userId).select(userProfileSelect).lean(),
  ]);

  return {
    blogs: await addViewerState(blogs, viewer?.id),
    pagination: buildPagination({ page, limit, skip, total }),
    stats: withFollowStats(stats, user),
    user: toPublicUser(user || blogs[0]?.author),
  };
}

export async function getMyBlogsService({ userId, query }) {
  assertValidObjectId(userId, "Invalid user id.");

  const { page, limit, skip } = parsePagination(query, 10);
  const filter = {
    ...buildBlogFilter(query, { includeDrafts: true }),
    author: userId,
  };
  const sort = buildBlogSort(query.sort);

  const [blogs, total, stats] = await Promise.all([
    Blog.find(filter)
      .select(blogListSelect)
      .populate("author", authorListSelect)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments(filter),
    getBlogStats({ author: userId, ...buildContentTypeFilter(query.contentType) }),
  ]);

  return {
    blogs: await addViewerState(blogs, userId),
    pagination: buildPagination({ page, limit, skip, total }),
    stats: withFollowStats(stats),
  };
}

export async function updateBlogService({ blogId, body, contentType = "blog", file, userId }) {
  assertValidObjectId(blogId, "Invalid blog id.");

  const blog = await Blog.findOne({ _id: blogId, ...buildContentTypeFilter(contentType) });

  if (!blog) {
    throw new ApiError(404, "Blog not found.");
  }

  assertBlogOwner(blog, userId);

  const update = { ...body };
  const nextTitle = body.title || blog.title;

  if (body.title && body.title !== blog.title) {
    update.slug = await generateUniqueBlogSlug(body.title, blog._id);
  }

  if (body.content) {
    update.readTime = calculateReadTime(body.content);
    update.excerpt = body.excerpt || generateExcerpt(body.content);
  }

  if (file) {
    const publicIdBase = update.slug || blog.slug || slugify(nextTitle);
    const coverImage = await uploadBlogCover(file, publicIdBase);

    if (blog.coverImage?.publicId) {
      await deleteImageFromCloudinary(blog.coverImage.publicId);
    }

    update.coverImage = coverImage;
  }

  Object.assign(blog, update);
  await blog.save();

  const updatedBlog = await Blog.findById(blog._id)
    .select(blogDetailSelect)
    .populate("author", authorListSelect)
    .lean();

  return updatedBlog;
}

export async function deleteBlogService({ blogId, contentType = "blog", userId }) {
  assertValidObjectId(blogId, "Invalid blog id.");

  const blog = await Blog.findOne({ _id: blogId, ...buildContentTypeFilter(contentType) });

  if (!blog) {
    throw new ApiError(404, "Blog not found.");
  }

  assertBlogOwner(blog, userId);

  if (blog.coverImage?.publicId) {
    await deleteImageFromCloudinary(blog.coverImage.publicId);
  }

  await Comment.deleteMany({ blog: blog._id });
  await blog.deleteOne();
}

export async function incrementBlogViewService(blogId, contentType = "blog") {
  assertValidObjectId(blogId, "Invalid blog id.");

  const blog = await Blog.findOneAndUpdate(
    { _id: blogId, ...buildContentTypeFilter(contentType) },
    { $inc: { views: 1 } },
    { projection: { _id: 1 }, returnDocument: "after" },
  ).lean();

  if (!blog) {
    throw new ApiError(404, "Blog not found.");
  }
}

export async function updateBlogLikeService({ blogId, contentType = "blog", liked, userId }) {
  assertValidObjectId(blogId, "Invalid blog id.");
  assertValidObjectId(userId, "Invalid user id.");

  const blog = liked
    ? await Blog.findOneAndUpdate(
        { _id: blogId, status: "published", ...buildContentTypeFilter(contentType), likedBy: { $ne: userId } },
        { $addToSet: { likedBy: userId }, $inc: { likesCount: 1 } },
        { projection: { likesCount: 1, likedBy: 1 }, returnDocument: "after" },
      )
        .select("+likedBy")
        .lean()
    : await unlikeBlog({ blogId, contentType, userId });

  const nextBlog = blog || await Blog.findOne({ _id: blogId, status: "published", ...buildContentTypeFilter(contentType) })
    .select("+likedBy likesCount")
    .lean();

  if (!nextBlog) {
    throw new ApiError(404, "Blog not found.");
  }

  return {
    isLiked: isIdInList(nextBlog.likedBy, userId),
    likesCount: nextBlog.likesCount || 0,
  };
}

export async function updateBlogBookmarkService({ blogId, bookmarked, contentType = "blog", userId }) {
  assertValidObjectId(blogId, "Invalid blog id.");
  assertValidObjectId(userId, "Invalid user id.");

  const update = bookmarked
    ? { $addToSet: { bookmarkedBy: userId } }
    : { $pull: { bookmarkedBy: userId } };

  const blog = await Blog.findOneAndUpdate(
    { _id: blogId, ...buildContentTypeFilter(contentType) },
    update,
    { projection: { bookmarkedBy: 1 }, returnDocument: "after" },
  )
    .select("+bookmarkedBy")
    .lean();

  if (!blog) {
    throw new ApiError(404, "Blog not found.");
  }

  return {
    isBookmarked: isIdInList(blog.bookmarkedBy, userId),
  };
}

export async function updateBlogContentTypeService({ blogId, contentType, userId }) {
  assertValidObjectId(blogId, "Invalid blog id.");
  assertValidObjectId(userId, "Invalid user id.");

  const nextContentType = normalizeContentType(contentType);
  const blog = await Blog.findOne({ _id: blogId, author: userId });

  if (!blog) {
    throw new ApiError(404, "Blog not found.");
  }

  blog.contentType = nextContentType;
  await blog.save();

  return Blog.findById(blog._id)
    .select(blogDetailSelect)
    .populate("author", authorListSelect)
    .lean();
}

export async function getBlogSocialStateService({ blogId, contentType = "blog", userId }) {
  assertValidObjectId(blogId, "Invalid blog id.");

  const blog = await Blog.findOne({ _id: blogId, ...buildContentTypeFilter(contentType) })
    .select("+likedBy +bookmarkedBy likesCount")
    .lean();

  if (!blog) {
    throw new ApiError(404, "Blog not found.");
  }

  return {
    isBookmarked: userId ? isIdInList(blog.bookmarkedBy, userId) : false,
    isLiked: userId ? isIdInList(blog.likedBy, userId) : false,
    likesCount: blog.likesCount || 0,
  };
}

export async function getBookmarkedBlogsService({ query, userId }) {
  assertValidObjectId(userId, "Invalid user id.");

  const { page, limit, skip } = parsePagination(query, 50);
  const filter = {
    ...buildContentTypeFilter(query.contentType),
    bookmarkedBy: userId,
  };

  const [blogs, total] = await Promise.all([
    Blog.find(filter)
      .select(blogListSelect)
      .populate("author", authorListSelect)
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Blog.countDocuments(filter),
  ]);

  return {
    blogs: await addViewerState(blogs, userId),
    pagination: buildPagination({ page, limit, skip, total }),
  };
}

async function unlikeBlog({ blogId, contentType = "blog", userId }) {
  const updatedBlog = await Blog.findOneAndUpdate(
    { _id: blogId, status: "published", ...buildContentTypeFilter(contentType), likedBy: userId, likesCount: { $gt: 0 } },
    { $pull: { likedBy: userId }, $inc: { likesCount: -1 } },
    { projection: { likesCount: 1, likedBy: 1 }, returnDocument: "after" },
  )
    .select("+likedBy")
    .lean();

  if (updatedBlog) {
    return updatedBlog;
  }

  return Blog.findOne({ _id: blogId, status: "published", ...buildContentTypeFilter(contentType) })
    .select("+likedBy likesCount")
    .lean();
}

async function generateUniqueBlogSlug(title, excludeId = null) {
  const baseSlug = slugify(title);

  if (!baseSlug) {
    throw new ApiError(400, "Title must contain valid slug characters.");
  }

  let slug = baseSlug;
  let suffix = 2;

  while (await Blog.exists(buildSlugExistsFilter(slug, excludeId))) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
}

function buildSlugExistsFilter(slug, excludeId) {
  const filter = { slug };

  if (excludeId) {
    filter._id = { $ne: excludeId };
  }

  return filter;
}

async function uploadBlogCover(file, publicIdBase) {
  try {
    return await uploadImageToCloudinary(file.buffer, publicIdBase, file.mimetype);
  } catch (error) {
    if (error.statusCode !== 409) {
      throw error;
    }

    return uploadImageToCloudinary(file.buffer, `${publicIdBase}-${Date.now()}`, file.mimetype);
  }
}

function buildBlogFilter(query, options = {}) {
  const filter = buildContentTypeFilter(query.contentType);
  const status = String(query.status || "").trim();

  if (options.includeDrafts && ["draft", "published"].includes(status)) {
    filter.status = status;
  } else if (!options.includeDrafts || status !== "all") {
    filter.status = "published";
  }

  if (query.search) {
    filter.$text = { $search: String(query.search).trim() };
  }

  if (query.category) {
    filter.category = String(query.category).trim();
  }

  const tags = parseFilterList(query.tag || query.tags);

  if (tags.length) {
    filter.tags = { $in: tags };
  }

  return filter;
}

function buildContentTypeFilter(contentType) {
  const normalizedContentType = normalizeContentType(contentType);

  if (normalizedContentType === "all") {
    return {};
  }

  if (normalizedContentType === "project") {
    return { contentType: "project" };
  }

  return { contentType: { $in: ["blog", null] } };
}

function normalizeContentType(contentType) {
  if (contentType === "all") {
    return "all";
  }

  return contentType === "project" ? "project" : "blog";
}

function buildBlogSort(sort = "latest") {
  const sortMap = {
    latest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    popular: { views: -1, createdAt: -1 },
    trending: { likesCount: -1, commentsCount: -1, views: -1, createdAt: -1 },
  };

  return sortMap[sort] || sortMap.latest;
}

function parsePagination(query, defaultLimit) {
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || defaultLimit, 1), 50);
  const requestedSkip = Number.parseInt(query.skip, 10);

  if (Number.isFinite(requestedSkip) && requestedSkip >= 0) {
    return {
      page: Math.floor(requestedSkip / limit) + 1,
      limit,
      skip: requestedSkip,
    };
  }

  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
}

function buildPagination({ page, limit, skip, total }) {
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    page,
    limit,
    skip,
    nextSkip: skip + limit < total ? skip + limit : null,
    total,
    totalPages,
    hasNextPage: skip + limit < total,
    hasPrevPage: skip > 0,
  };
}

async function getBlogStats(match) {
  const [stats] = await Blog.aggregate([
    { $match: normalizeStatsMatch(match) },
    {
      $group: {
        _id: null,
        posts: { $sum: 1 },
        blogs: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "published"] },
                  { $ne: ["$contentType", "project"] },
                ],
              },
              1,
              0,
            ],
          },
        },
        projects: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $eq: ["$status", "published"] },
                  { $eq: ["$contentType", "project"] },
                ],
              },
              1,
              0,
            ],
          },
        },
        drafts: {
          $sum: {
            $cond: [{ $eq: ["$status", "draft"] }, 1, 0],
          },
        },
        totalViews: { $sum: { $ifNull: ["$views", 0] } },
        totalLikes: { $sum: { $ifNull: ["$likesCount", 0] } },
        totalComments: { $sum: { $ifNull: ["$commentsCount", 0] } },
      },
    },
    {
      $project: {
        _id: 0,
        posts: 1,
        blogs: 1,
        drafts: 1,
        projects: 1,
        totalViews: 1,
        totalLikes: 1,
        totalComments: 1,
      },
    },
  ]);

  return stats || {
    posts: 0,
    blogs: 0,
    drafts: 0,
    projects: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
  };
}

function normalizeStatsMatch(match) {
  return {
    ...match,
    author: new mongoose.Types.ObjectId(match.author),
  };
}

async function addViewerState(blogs, userId) {
  if (!userId) {
    return blogs;
  }

  const viewer = await User.findById(userId).select("following").lean();
  const followingIds = new Set((viewer?.following || []).map(String));

  if (Array.isArray(blogs)) {
    const blogIds = blogs.map((blog) => blog._id).filter(Boolean);
    const socialRows = await Blog.find({ _id: { $in: blogIds } })
      .select("+likedBy +bookmarkedBy")
      .lean();
    const socialById = new Map(socialRows.map((blog) => [blog._id.toString(), blog]));

    return blogs.map((blog) => {
      const social = socialById.get(blog._id.toString());
      return withViewerState(blog, social, userId, followingIds);
    });
  }

  const social = await Blog.findById(blogs._id)
    .select("+likedBy +bookmarkedBy")
    .lean();

  return withViewerState(blogs, social, userId, followingIds);
}

function withViewerState(blog, social, userId, followingIds = new Set()) {
  return {
    ...blog,
    isAuthorFollowed: followingIds.has(String(blog.author?._id || blog.author)),
    isBookmarked: isIdInList(social?.bookmarkedBy, userId),
    isLiked: isIdInList(social?.likedBy, userId),
  };
}

function isIdInList(list = [], id) {
  return list.some((item) => String(item) === String(id));
}

function withFollowStats(stats, user = null) {
  return {
    ...stats,
    followersCount: user?.followers?.length || 0,
    followingCount: user?.following?.length || 0,
  };
}

function toPublicUser(user) {
  if (!user) {
    return null;
  }

  return {
    _id: user._id,
    name: user.name,
    username: user.username,
    avatar: user.avatar,
    banner: user.banner,
    bio: user.bio,
    skills: user.skills || [],
    socialLinks: user.socialLinks || {},
    portfolio: user.portfolio || [],
  };
}

function parseFilterList(value) {
  if (!value) {
    return [];
  }

  const list = Array.isArray(value) ? value : String(value).split(/[\s,]+/);
  const uniqueItems = new Set();

  // Time: O(n), Space: O(k), where k is the number of unique filters.
  for (const item of list) {
    const normalized = String(item).trim().replace(/^#+/, "").toLowerCase();

    if (normalized) {
      uniqueItems.add(normalized);
    }
  }

  return [...uniqueItems];
}

function calculateReadTime(content) {
  const wordCount = String(content || "").trim().split(/\s+/).filter(Boolean).length;

  return Math.max(1, Math.ceil(wordCount / 200));
}

function generateExcerpt(content) {
  const cleaned = String(content || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*]\s*\((?:data:image\/[^)]+|https?:\/\/[^)]+)\)/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#*_>`~[\]()!-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const excerpt = cleaned.slice(0, 160).trim();

  return cleaned.length > 160 ? `${excerpt}...` : excerpt;
}

function assertBlogOwner(blog, userId) {
  if (blog.author.toString() !== userId) {
    throw new ApiError(403, "You are not allowed to modify this blog.");
  }
}

function assertValidObjectId(id, message) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, message);
  }
}
