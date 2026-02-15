import { Router } from "express";
import {
	validateUser,
	handleValidationErrors,
} from "../middleware/validators.js";

import fileController from "./controllers/fileController.js";

// upload file into folder
// POST   /folders/:id/upload

// get file details
// GET /files/:id

// download file
//GET    /files/:id/download

// delete file
// DELETE /files/:id
