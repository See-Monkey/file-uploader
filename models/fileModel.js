import { prisma } from "../config/prisma.js";
import fs from "fs";

async function createFile({ name, path, size, mimetype, folderId, userId }) {
	return prisma.file.create({
		data: {
			name,
			path,
			size,
			mimetype,
			folderId,
			userId,
		},
	});
}

async function getFileById(fileId, userId) {
	return prisma.file.findFirst({
		where: {
			id: fileId,
			userId,
		},
	});
}

async function deleteFile(fileId, userId) {
	// Fetch the file first
	const file = await prisma.file.findFirst({
		where: { id: fileId, userId },
		select: { folderId: true, path: true },
	});

	if (!file) {
		throw new Error("File not found or not owned by user");
	}

	// Delete file from disk
	if (fs.existsSync(file.path)) {
		fs.unlinkSync(file.path);
	}

	// Delete DB record
	await prisma.file.delete({
		where: { id: fileId },
	});

	return file.folderId;
}

async function getFilesInFolder(folderId, userId) {
	return prisma.file.findMany({
		where: {
			folderId,
			userId,
		},
		orderBy: {
			name: "asc",
		},
	});
}

export default {
	createFile,
	getFileById,
	deleteFile,
	getFilesInFolder,
};
