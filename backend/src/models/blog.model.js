import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    heading: {
      type: String,
      required: true,
      trim: true,
    },
    subheading: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      default: "",
    },
    coverImage: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    contentType: {
      type: String,
      enum: ["blog", "project"],
      default: "blog",
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "published",
      index: true,
    },
    readTime: {
      type: Number,
      default: 1,
    },
    views: {
      type: Number,
      default: 0,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    likedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
      select: false,
    },
    bookmarkedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
      select: false,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

blogSchema.index(
  {
    title: "text",
    heading: "text",
    subheading: "text",
    excerpt: "text",
    content: "text",
    tags: "text",
    category: "text",
    contentType: "text",
  },
  {
    weights: {
      title: 12,
      tags: 10,
      category: 8,
      contentType: 3,
      heading: 6,
      subheading: 5,
      excerpt: 4,
      content: 1,
    },
    name: "BlogSearchIndex",
  },
);
blogSchema.index({ createdAt: -1 });
blogSchema.index({ views: -1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ contentType: 1, status: 1, createdAt: -1 });
blogSchema.index({ author: 1, createdAt: -1 });
blogSchema.index({ likedBy: 1 });
blogSchema.index({ bookmarkedBy: 1 });

export const Blog = mongoose.model("Blog", blogSchema);
