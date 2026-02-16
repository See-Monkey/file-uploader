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

	const files = await import("./fileModel.js").then((m) =>
		m.default.getFilesInFolder(folderId, userId),
	);

	return { children, files };
}

async function getFolderBreadcrumbs(folderId, userId) {
	const breadcrumbs = [];

	let current = await prisma.folder.findFirst({
		where: { id: folderId, userId },
	});

	while (current) {
		breadcrumbs.unshift(current);

		if (!current.parentId) break;

		current = await prisma.folder.findFirst({
			where: { id: current.parentId, userId },
		});
	}

	return breadcrumbs;
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
	// First verify folder exists AND belongs to user
	const folder = await prisma.folder.findFirst({
		where: {
			id: folderId,
			userId,
		},
	});

	if (!folder) {
		throw new Error("Folder not found or not owned by user");
	}

	// Now safely update
	return prisma.folder.update({
		where: { id: folderId },
		data: { name },
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
	getFolderBreadcrumbs,
	createFolder,
	renameFolder,
	deleteFolder,
};
