import express from "express";
import { accessSharedFile } from "../controllers/shareController.js";

const router = express.Router();

router.get("/:token", accessSharedFile);

export default router;
