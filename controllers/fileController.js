import fileModel from "../models/fileModel.js";
import folderModel from "../models/folderModel.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		const folderId = req.params.id;
		const uploadPath = path.join("uploads", folderId);

		// Ensure folder exists
		fs.mkdirSync(uploadPath, { recursive: true });
		cb(null, uploadPath);
	},
	filename: function (req, file, cb) {
		// Keep original filename, but could sanitize
		cb(null, file.originalname);
	},
});
export const uploadMiddleware = multer({ storage });

async function uploadFile(req, res, next) {
	try {
		const folderId = req.params.id;
		const userId = req.user.id;

		// Ensure folder exists and belongs to user
		const folder = await folderModel.getFolderById(folderId, userId);
		if (!folder) return res.status(404).send("Folder not found");

		if (!req.file) return res.status(400).send("No file uploaded");

		const { originalname, path: filePath, size, mimetype } = req.file;

		// Create file record in DB
		await fileModel.createFile({
			name: originalname,
			path: filePath,
			size,
			mimetype,
			folderId,
			userId,
		});

		res.redirect(`/folders/${folderId}`);
	} catch (err) {
		next(err);
	}
}

async function getFile(req, res, next) {
	try {
		const fileId = req.params.id;
		const userId = req.user.id;

		const file = await fileModel.getFileById(fileId, userId);
		if (!file) return res.status(404).send("File not found");

		res.render("file", { file });
	} catch (err) {
		next(err);
	}
}

async function downloadFile(req, res, next) {
	try {
		const fileId = req.params.id;
		const userId = req.user.id;

		const file = await fileModel.getFileById(fileId, userId);
		if (!file) return res.status(404).send("File not found");

		res.download(file.path, file.name);
	} catch (err) {
		next(err);
	}
}

async function deleteFile(req, res, next) {
	try {
		const fileId = req.params.id;
		const userId = req.user.id;

		const folderId = await fileModel.deleteFile(fileId, userId);

		res.redirect(`/folders/${folderId}`);
	} catch (err) {
		next(err);
	}
}

export default {
	uploadFile,
	getFile,
	downloadFile,
	deleteFile,
	uploadMiddleware,
};
