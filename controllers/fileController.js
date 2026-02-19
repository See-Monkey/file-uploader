import fileModel from "../models/fileModel.js";
import folderModel from "../models/folderModel.js";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";
import path from "path";
import { prisma } from "../config/prisma.js";
import https from "https";

// Configure multer
const storage = multer.memoryStorage();

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
		const file = req.file;

		if (!file) {
			return res.status(400).send("No file uploaded");
		}

		// Extract name + extension
		const ext = path.extname(file.originalname).replace(".", ""); // "txt"
		const baseName = path.basename(
			file.originalname,
			path.extname(file.originalname),
		);

		// Mirror app folder structure in Cloudinary
		const cloudinaryFolder = `users/${userId}/${folderId}`;

		const uploadFromBuffer = () =>
			new Promise((resolve, reject) => {
				const stream = cloudinary.uploader.upload_stream(
					{
						folder: cloudinaryFolder,
						resource_type: "auto",
						public_id: baseName, // original filename (no extension)
						format: ext, // extension
						unique_filename: false, // don’t auto-randomize
						overwrite: false, // prevent silent overwrite
					},
					(error, result) => {
						if (error) reject(error);
						else resolve(result);
					},
				);

				streamifier.createReadStream(file.buffer).pipe(stream);
			});

		const result = await uploadFromBuffer();

		// Save in DB
		await prisma.file.create({
			data: {
				name: file.originalname,
				url: result.secure_url,
				publicId: result.public_id,
				size: file.size,
				mimeType: file.mimetype,
				folderId,
				userId,
				resourceType: result.resource_type,
			},
		});

		res.redirect(`/folders/${folderId}`);
	} catch (error) {
		next(error);
	}
}

async function getFile(req, res, next) {
	try {
		const fileId = req.params.id;
		const userId = req.user.id;

		const file = await fileModel.getFileById(fileId, userId);
		if (!file) return res.status(404).send("File not found");

		// Get breadcrumbs from the file's folder
		const breadcrumbs = await folderModel.getFolderBreadcrumbs(
			file.folderId,
			userId,
		);

		res.render("file", { file, breadcrumbs });
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

		// res.download(file.path, file.name);
		const safeName = file.name;

		res.setHeader("Content-Disposition", `attachment; filename="${safeName}"`);

		res.setHeader("Content-Type", file.mimeType);

		https
			.get(file.url, (cloudinaryRes) => {
				cloudinaryRes.pipe(res);
			})
			.on("error", next);
	} catch (err) {
		next(err);
	}
}

async function deleteFile(req, res, next) {
	try {
		const fileId = req.params.id;
		const userId = req.user.id;

		const file = await prisma.file.findFirst({
			where: {
				id: fileId,
				userId,
			},
		});

		if (!file) {
			return res.status(404).send("File not found");
		}

		// Delete from Cloudinary
		await cloudinary.uploader.destroy(file.publicId, {
			resource_type: file.resourceType,
		});

		// Delete from DB
		await prisma.file.delete({
			where: { id: fileId },
		});

		res.redirect(`/folders/${file.folderId}`);
	} catch (error) {
		next(error);
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
