import { Router } from "express";
import passport from "passport";
import {
	validateUser,
	handleValidationErrors,
} from "../middleware/validators.js";

import userController from "../controllers/userController.js";

const router = Router();

router.get("/", userController.getIndex);

// passport login route
router.post(
	"/login",
	passport.authenticate("local", {
		successRedirect: "/folders",
		failureRedirect: "/",
	}),
);

// passport logout route
router.post("/logout", (req, res, next) => {
	req.logout((err) => {
		if (err) return next(err);
		res.redirect("/");
	});
});

router.get("/register", userController.getRegister);
router.post(
	"/register",
	validateUser,
	handleValidationErrors("register"),
	userController.register,
);

export default router;
