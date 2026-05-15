import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/profile", authenticate, (req, res) => {
  res.json({
    message: "This backend route is protected.",
    user: req.user,
  });
});

export default router;
