import { Blog } from "../models/Blog.js";

export async function syncBlogSearchIndexes() {
  const droppedIndexes = await Blog.syncIndexes();

  return {
    droppedIndexes,
    activeIndexes: await Blog.collection.indexes(),
  };
}
