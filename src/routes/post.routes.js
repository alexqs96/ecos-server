import { Router } from "express";
import { isAuthenticated } from "../middleware/index.js";
import {
  createComment,
  createPost,
  getPosts,
  handleLikes,
} from "../controllers/posts.controller.js";
const router = new Router();

router.get("/:id?", getPosts);
router.post("/", isAuthenticated, createPost);
router.post("/comments", isAuthenticated, createComment);
router.post("/likes", isAuthenticated, handleLikes);

export default router;
