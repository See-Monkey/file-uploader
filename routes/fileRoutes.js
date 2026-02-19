import { Router } from "express";
import { isAuth } from "../middleware/auth.js";

import fileController from "../controllers/fileController.js";

const router = Router();

// get file details
router.get("/:id", isAuth, fileController.getFile);

// download file
router.get("/:id/download", isAuth, fileController.downloadFile);

// delete file
router.delete("/:id", isAuth, fileController.deleteFile);

export default router;
