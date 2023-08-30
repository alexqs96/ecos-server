import { Router } from "express";
import {
  signIn,
  signOut,
  signUp,
  userData,
} from "../controllers/auth.controller.js";
import { isAuthenticated } from "../middleware/index.js";
const router = new Router();

router.post("/signup", signUp);
router.post("/signin", signIn);
router.post("/signout", signOut);
router.get("/userdata", isAuthenticated, userData);

export default router;
