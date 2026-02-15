import { Router } from "express";
import {
	validateUser,
	handleValidationErrors,
} from "../middleware/validators.js";

import folderController from "./controllers/folderController.js";

const router = Router();

// view folder contents
// GET    /folders/:id

// create folder
// POST   /folders

// rename folder
// PUT    /folders/:id

// delete folder
// DELETE /folders/:id

export default router;
