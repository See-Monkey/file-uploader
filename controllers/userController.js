import userModel from "../models/userModel.js";
import folderModel from "../models/folderModel.js";

async function getIndex(req, res) {
	res.render("index", { errors: [] });
}

async function getRegister(req, res) {
	res.render("register", { errors: [] });
}

async function register(req, res, next) {
	try {
		const { username, password } = req.body;

		// Create user (handles hashing inside model)
		const user = await userModel.createUser({
			username,
			password,
		});

		// Create root folder for this user
		await folderModel.createRoot(user.id);

		// Log user in
		req.login(user, (err) => {
			if (err) return next(err);
			res.redirect("/folders");
		});
	} catch (err) {
		next(err);
	}
}

export default {
	getIndex,
	getRegister,
	register,
};
