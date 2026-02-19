import { prisma } from "../config/prisma.js";

async function createFile({
	name,
	url,
	publicId,
	size,
	mimeType,
	folderId,
	userId,
}) {
	return prisma.file.create({
		data: {
			name,
			url,
			publicId,
			size,
			mimeType,
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
	getFilesInFolder,
};
