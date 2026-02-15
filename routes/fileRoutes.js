import { Router } from "express";
import { isAuth } from "../middleware/auth.js";
import {
	validateFile,
	handleValidationErrors,
} from "../middleware/validators.js";

import fileController from "./controllers/fileController.js";

const router = Router();

// upload file into folder
router.post(
	"/folders/:id/upload",
	isAuth,
	fileController.uploadMiddleware.single("file"),
	validateFile,
	handleValidationErrors("folder"),
	fileController.uploadFile,
);

// get file details
router.get("/files/:id", isAuth, fileController.getFile);

// download file
router.get("/files/:id/download", isAuth, fileController.downloadFile);

// delete file
router.delete("/files/:id", isAuth, fileController.deleteFile);

export default router;
