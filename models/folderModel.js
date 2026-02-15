import { prisma } from "../config/prisma.js";

async function createRoot(userId) {
	return prisma.folder.create({
		data: {
			name: "Home",
			parentId: null,
			userId,
		},
	});
}

async function getRootByUser(userId) {
	return prisma.folder.findFirst({
		where: {
			userId,
			parentId: null,
		},
	});
}

async function getFolderById(folderId, userId) {
	return prisma.folder.findFirst({
		where: {
			id: folderId,
			userId,
		},
	});
}

async function getFolderContents(folderId, userId) {
	const children = await prisma.folder.findMany({
		where: {
			parentId: folderId,
			userId,
		},
		orderBy: {
			name: "asc",
		},
	});

	const files = await prisma.file.findMany({
		where: {
			folderId,
			userId,
		},
		orderBy: {
			name: "asc",
		},
	});

	return { children, files };
}

async function createFolder({ name, parentId = null, userId }) {
	return prisma.folder.create({
		data: {
			name,
			parentId,
			userId,
		},
	});
}

async function renameFolder(folderId, name, userId) {
	return prisma.folder.updateMany({
		where: {
			id: folderId,
			userId,
		},
		data: {
			name,
		},
	});
}

async function deleteFolder(folderId, userId) {
	// Fetch folder first
	const folder = await prisma.folder.findFirst({
		where: {
			id: folderId,
			userId,
		},
		select: {
			parentId: true,
		},
	});

	if (!folder) {
		throw new Error("Folder not found or not owned by user");
	}

	// Delete folder and cascade to children/files
	await prisma.folder.delete({
		where: { id: folderId },
	});

	return folder.parentId;
}

export default {
	createRoot,
	getRootByUser,
	getFolderById,
	getFolderContents,
	createFolder,
	renameFolder,
	deleteFolder,
};
