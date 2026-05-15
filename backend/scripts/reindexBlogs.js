import { connectDB } from "../src/config/db.js";
import { syncBlogSearchIndexes } from "../src/services/searchSync.service.js";

try {
  await connectDB();
  const result = await syncBlogSearchIndexes();
  console.log("MongoDB blog search indexes synced.");
  console.log(`Dropped indexes: ${result.droppedIndexes.length ? result.droppedIndexes.join(", ") : "none"}`);
} catch (error) {
  console.error("Blog search index sync failed:", error);
  process.exitCode = 1;
} finally {
  process.exit();
}
