import mongoose from "mongoose";

const searchLogSchema = new mongoose.Schema(
  {
    query: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    resultCount: {
      type: Number,
      default: 0,
    },
    clickedSlug: {
      type: String,
      trim: true,
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
    },
    position: {
      type: Number,
      default: null,
    },
    source: {
      type: String,
      enum: ["search", "autocomplete", "trending", "recent"],
      default: "search",
    },
  },
  { timestamps: true },
);

searchLogSchema.index({ query: 1, createdAt: -1 });
searchLogSchema.index({ user: 1, createdAt: -1 });

export const SearchLog = mongoose.model("SearchLog", searchLogSchema);
