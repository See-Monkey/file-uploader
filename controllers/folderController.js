import folderModel from "../models/folderModel.js";

async function createRoot(userId) {
	try {
		const rootFolder = await folderModel.createRoot(userId);
		return rootFolder;
	} catch (err) {
		console.error("Error creating root folder:", err);
		throw err;
	}
}

async function getRoot(req, res, next) {
	try {
		// Find the root folder for this user (parentId = null)
		const rootFolder = await folderModel.getRootByUser(req.user.id);

		if (!rootFolder) {
			return res.status(404).render("folder", {
				folder: null,
				children: [],
				files: [],
				breadcrumbs: [],
				error: "Root folder not found",
			});
		}

		const breadcrumbs = [rootFolder];

		const contents = await folderModel.getFolderContents(
			rootFolder.id,
			req.user.id,
		);

		res.render("folder", {
			folder: rootFolder,
			children: contents.children,
			files: contents.files,
			breadcrumbs,
			error: null,
		});
	} catch (err) {
		next(err);
	}
}

async function getFolder(req, res, next) {
	try {
		const folderId = req.params.id;

		const folder = await folderModel.getFolderById(folderId, req.user.id);

		if (!folder) {
			return res.status(404).render("folder", {
				folder: null,
				children: [],
				files: [],
				breadcrumbs: [],
				error: "Folder not found",
			});
		}

		const breadcrumbs = await folderModel.getFolderBreadcrumbs(
			folder.id,
			req.user.id,
		);

		const contents = await folderModel.getFolderContents(
			folder.id,
			req.user.id,
		);

		res.render("folder", {
			folder,
			children: contents.children,
			files: contents.files,
			breadcrumbs,
			error: null,
		});
	} catch (err) {
		next(err);
	}
}

async function createFolder(req, res, next) {
	try {
		const { name, parentId } = req.body;

		const folder = await folderModel.createFolder({
			name,
			parentId: parentId || null,
			userId: req.user.id,
		});

		res.redirect(parentId ? `/folders/${parentId}` : "/folders");
	} catch (err) {
		next(err);
	}
}

async function renameFolder(req, res, next) {
	try {
		const folderId = req.params.id;
		const { name } = req.body;

		const folder = await folderModel.renameFolder(folderId, name, req.user.id);

		res.redirect(`/folders/${folder.id}`);
	} catch (err) {
		next(err);
	}
}

async function deleteFolder(req, res, next) {
	try {
		const folderId = req.params.id;

		const parentId = await folderModel.deleteFolder(folderId, req.user.id);

		res.redirect(parentId ? `/folders/${parentId}` : "/folders");
	} catch (err) {
		next(err);
	}
}

export default {
	createRoot,
	getRoot,
	getFolder,
	createFolder,
	renameFolder,
	deleteFolder,
};
