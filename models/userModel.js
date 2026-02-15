import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";

async function createUser({ username, password, role = "USER" }) {
	const hashedPassword = await bcrypt.hash(password, 10);

	return prisma.user.create({
		data: {
			username,
			password: hashedPassword,
			role,
		},
	});
}

async function findByUsername(username) {
	return prisma.user.findUnique({
		where: { username },
	});
}

async function findById(id) {
	return prisma.user.findUnique({
		where: { id },
	});
}

async function validatePassword(user, password) {
	return bcrypt.compare(password, user.password);
}

function sanitizeUser(user) {
	if (!user) return null;

	const { password, ...safeUser } = user;
	return safeUser;
}

export default {
	createUser,
	findByUsername,
	findById,
	validatePassword,
	sanitizeUser,
};
