import { Router } from "express";
import { newUsers, viewProfile } from "../controllers/users.controller.js";
const router = new Router();

router.get("/", newUsers);
router.get("/:username", viewProfile);

export default router;
