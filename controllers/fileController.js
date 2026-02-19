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
		// Extract safe base name (no directories)
		const originalName = path.basename(file.originalname);

		// Separate extension
		const ext = path.extname(originalName).toLowerCase();
		const name = path.basename(originalName, ext);

		// Sanitize name
		let safeName = name
			.replace(/\s+/g, "_") // spaces → _
			.replace(/[^a-z0-9_-]/g, "") // remove unsafe chars
			.slice(0, 50); // limit length

		const finalName = `${safeName}${ext}`;

		cb(null, finalName);
	},
});
export const uploadMiddleware = multer({
	storage,
	limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
	fileFilter: (req, file, cb) => {
		if (!allowedMimeTypes.includes(file.mimetype)) {
			return cb(new Error("File type not allowed"));
		} else if (blockedTypes.includes(file.mimetype)) {
			return cb(new Error("Executable files are not allowed"));
		}
		cb(null, true);
	},
});

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

		console.log("REQ.FILE:", req.file);
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

const allowedMimeTypes = [
	// Images
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/svg+xml",
	"image/heic",

	// Video
	"video/mp4",
	"video/webm",
	"video/quicktime",
	"video/x-matroska",

	// Audio
	"audio/mpeg",
	"audio/wav",
	"audio/ogg",
	"audio/webm",
	"audio/mp4",

	// Documents
	"application/pdf",
	"text/plain",
	"text/csv",
];

const blockedTypes = [
	"application/x-msdownload", // .exe
	"application/x-sh", // shell scripts
	"application/x-bat", // .bat
	"application/x-cmd",
	"application/javascript",
	"text/javascript",
];

export default {
	uploadFile,
	getFile,
	downloadFile,
	deleteFile,
	uploadMiddleware,
};
