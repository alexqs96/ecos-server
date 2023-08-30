import { Router } from "express";
import { isAuthenticated } from "../middleware/index.js";
import { getProfile } from "../controllers/profile.controller.js";
const router = new Router();

router.get("/", isAuthenticated, getProfile);

export default router;
