import mongoose from "mongoose";
import { Blog } from "../models/blog.model.js";
import { ApiError } from "../utils/apiError.js";
import { slugify } from "../utils/slugify.js";
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "./upload.service.js";

const blogListSelect = "title slug heading subheading excerpt coverImage tags category author status readTime views likesCount commentsCount isFeatured createdAt updatedAt";
const blogDetailSelect = `${blogListSelect} content`;
const authorListSelect = "name username avatar bio";
const authorDetailSelect = "name username avatar bio githubUrl linkedinUrl websiteUrl";

export async function createBlogService({ body, file, userId }) {
  const slug = await generateUniqueBlogSlug(body.title);
  const coverImage = file ? await uploadBlogCover(file, slug) : undefined;

  const blog = await Blog.create({
    ...body,
    slug,
    author: userId,
    status: body.status || "published",
    excerpt: body.excerpt || generateExcerpt(body.content),
    readTime: calculateReadTime(body.content),
    coverImage,
  });

  return Blog.findById(blog._id)
    .select(blogDetailSelect)
    .populate("author", authorListSelect)
    .lean();
}

export async function getAllBlogsService(query) {
  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 50);
  const skip = (page - 1) * limit;
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
    blogs,
    pagination: buildPagination({ page, limit, total }),
  };
}

export async function getBlogBySlugService(identifier) {
  const filter = mongoose.Types.ObjectId.isValid(identifier)
    ? { _id: identifier, status: "published" }
    : { slug: identifier, status: "published" };

  const blog = await Blog.findOne(filter)
    .select(blogDetailSelect)
    .populate("author", authorDetailSelect)
    .lean();

  if (!blog) {
    throw new ApiError(404, "Blog not found.");
  }

  return blog;
}

export async function getMyBlogByIdService({ blogId, userId }) {
  assertValidObjectId(blogId, "Invalid blog id.");

  const blog = await Blog.findOne({ _id: blogId, author: userId })
    .select(blogDetailSelect)
    .populate("author", authorDetailSelect)
    .lean();

  if (!blog) {
    throw new ApiError(404, "Blog not found.");
  }

  return blog;
}

export async function getBlogsByUserService({ userId, query }) {
  assertValidObjectId(userId, "Invalid user id.");

  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 50);
  const skip = (page - 1) * limit;
  const filter = {
    ...buildBlogFilter(query),
    author: userId,
  };
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
    blogs,
    pagination: buildPagination({ page, limit, total }),
  };
}

export async function getMyBlogsService({ userId, query }) {
  assertValidObjectId(userId, "Invalid user id.");

  const page = Math.max(Number.parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(query.limit, 10) || 10, 1), 50);
  const skip = (page - 1) * limit;
  const filter = {
    ...buildBlogFilter(query, { includeDrafts: true }),
    author: userId,
  };
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
    blogs,
    pagination: buildPagination({ page, limit, total }),
  };
}

export async function updateBlogService({ blogId, body, file, userId }) {
  assertValidObjectId(blogId, "Invalid blog id.");

  const blog = await Blog.findById(blogId);

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

  return Blog.findById(blog._id)
    .select(blogDetailSelect)
    .populate("author", authorListSelect)
    .lean();
}

export async function deleteBlogService({ blogId, userId }) {
  assertValidObjectId(blogId, "Invalid blog id.");

  const blog = await Blog.findById(blogId);

  if (!blog) {
    throw new ApiError(404, "Blog not found.");
  }

  assertBlogOwner(blog, userId);

  if (blog.coverImage?.publicId) {
    await deleteImageFromCloudinary(blog.coverImage.publicId);
  }

  await blog.deleteOne();
}

export async function incrementBlogViewService(blogId) {
  assertValidObjectId(blogId, "Invalid blog id.");

  const blog = await Blog.findByIdAndUpdate(
    blogId,
    { $inc: { views: 1 } },
    { new: true, projection: { _id: 1 } },
  ).lean();

  if (!blog) {
    throw new ApiError(404, "Blog not found.");
  }
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
  const filter = {};
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

function buildBlogSort(sort = "latest") {
  const sortMap = {
    latest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    popular: { views: -1, createdAt: -1 },
    trending: { likesCount: -1, commentsCount: -1, views: -1, createdAt: -1 },
  };

  return sortMap[sort] || sortMap.latest;
}

function buildPagination({ page, limit, total }) {
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
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
