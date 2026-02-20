import crypto from "crypto";
import { prisma } from "../config/prisma.js";
import https from "https";

export async function createShareLink(req, res) {
	try {
		const { fileId } = req.params;

		const file = await prisma.file.findUnique({
			where: { id: fileId },
		});

		if (!file || file.userId !== req.user.id) {
			return res.status(403).json({ error: "Unauthorized" });
		}

		// Check for existing link
		const existingLink = await prisma.shareLink.findUnique({
			where: { fileId },
		});

		const now = new Date();

		if (existingLink) {
			// If still valid → reuse it
			if (existingLink.expiresAt > now) {
				const fullUrl = `${req.protocol}://${req.get("host")}/share/${existingLink.token}`;
				return res.json({ url: fullUrl });
			}

			// If expired → delete it
			await prisma.shareLink.delete({
				where: { fileId },
			});
		}

		// Create new link
		const token = crypto.randomUUID();

		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + 3);

		const newLink = await prisma.shareLink.create({
			data: {
				token,
				fileId,
				expiresAt,
			},
		});

		const fullUrl = `${req.protocol}://${req.get("host")}/share/${newLink.token}`;

		return res.json({ url: fullUrl });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Something went wrong" });
	}
}

export async function accessSharedFile(req, res) {
	try {
		const { token } = req.params;

		const shareLink = await prisma.shareLink.findUnique({
			where: { token },
			include: { file: true },
		});

		if (!shareLink) {
			return res.status(404).send("Invalid link");
		}

		if (new Date() > shareLink.expiresAt) {
			return res.status(410).send("Link expired");
		}

		const fileUrl = shareLink.file.url;

		// Force download
		res.setHeader(
			"Content-Disposition",
			`attachment; filename="${shareLink.file.name}"`,
		);
		res.setHeader("Content-Type", shareLink.file.mimeType);

		https
			.get(fileUrl, (fileStream) => {
				fileStream.pipe(res);
			})
			.on("error", (err) => {
				console.error(err);
				res.status(500).send("Download failed");
			});
	} catch (error) {
		console.error(error);
		res.status(500).send("Server error");
	}
}

export default {
	createShareLink,
	accessSharedFile,
};
