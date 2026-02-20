import { Router } from "express";
import { isAuth } from "../middleware/auth.js";
import shareController from "../controllers/shareController.js";

import fileController from "../controllers/fileController.js";

const router = Router();

// get file details
router.get("/:id", isAuth, fileController.getFile);

// download file
router.get("/:id/download", isAuth, fileController.downloadFile);

// delete file
router.post("/:id/delete", isAuth, fileController.deleteFile);

// create share link
router.post("/:fileId/share", isAuth, shareController.createShareLink);

export default router;
