import { Router } from "express";
import {
  clearRecentController,
  getRecentController,
  getSuggestionsController,
  getTrendingController,
  searchBlogsController,
  trackClickController,
} from "../controllers/search.controller.js";
import { optionalAuthenticate } from "../middleware/optionalAuth.middleware.js";
import { createRateLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();
const searchRateLimit = createRateLimiter({ limit: 100, windowMs: 60_000 });

router.use(searchRateLimit);
router.use(optionalAuthenticate);

router.get("/blogs", searchBlogsController);
router.get("/suggestions", getSuggestionsController);
router.get("/trending", getTrendingController);
router.get("/recent", getRecentController);
router.delete("/recent", clearRecentController);
router.post("/click", trackClickController);

export default router;
