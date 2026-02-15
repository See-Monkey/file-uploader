import { Router } from "express";
import { isAuth } from "../middleware/auth.js";
import {
	validateFolder,
	handleValidationErrors,
} from "../middleware/validators.js";

import folderController from "./controllers/folderController.js";

const router = Router();

// view folder contents
router.get("/folders", isAuth, folderController.getRoot);
router.get("/folders/:id", isAuth, folderController.getFolder);

// create folder
router.post(
	"/folders",
	isAuth,
	validateFolder,
	handleValidationErrors("folder"),
	folderController.createFolder,
);

// rename folder
router.put(
	"/folders/:id",
	isAuth,
	validateFolder,
	handleValidationErrors("folder"),
	folderController.renameFolder,
);

// delete folder
router.delete("/folders/:id", isAuth, folderController.deleteFolder);

export default router;
