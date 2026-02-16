import { Router } from "express";
import { isAuth } from "../middleware/auth.js";
import {
	validateFolder,
	validateFile,
	handleValidationErrors,
} from "../middleware/validators.js";

import folderController from "../controllers/folderController.js";
import fileController from "../controllers/fileController.js";

const router = Router();

// view folder contents
router.get("/", isAuth, folderController.getRoot);
router.get("/:id", isAuth, folderController.getFolder);

// create folder
router.post(
	"/",
	isAuth,
	validateFolder,
	handleValidationErrors("folder"),
	folderController.createFolder,
);

// upload file into a folder
router.post(
	"/:id/upload",
	isAuth,
	fileController.uploadMiddleware.single("file"),
	validateFile,
	handleValidationErrors("folder"),
	fileController.uploadFile,
);

// rename folder
router.post(
	"/:id/rename",
	isAuth,
	validateFolder,
	handleValidationErrors("folder"),
	folderController.renameFolder,
);

// delete folder
router.post("/:id/delete", isAuth, folderController.deleteFolder);

export default router;
