import { body, validationResult } from "express-validator";

// Shared base regex for names: letters, numbers, dots, underscores, dashes
const NAME_REGEX = /^[a-zA-Z0-9._-]+$/;

// Forbidden single/double dot (current/parent folder)
const FORBIDDEN_NAMES = /^(\.|..)$/;

export const validateUser = [
	body("username")
		.trim()
		.notEmpty()
		.withMessage("Email address is required")
		.isEmail()
		.withMessage("Must be a valid email address"),
	body("password")
		.notEmpty()
		.withMessage("Password is required")
		.isLength({ min: 6 })
		.withMessage("Password must be at least 6 characters"),
	body("verifyPassword") // custom validation
		.notEmpty()
		.withMessage("Please verify your password")
		.custom((value, { req }) => {
			if (value !== req.body.password) {
				throw new Error("Passwords do not match");
			}
			return true; // validation passed
		}),
];

export const validateFolder = [
	body("name")
		.trim()
		.notEmpty()
		.withMessage("Folder name is required")
		.matches(NAME_REGEX)
		.withMessage(
			"Folder name can only contain letters, numbers, dots, underscores, and dashes",
		)
		.isLength({ max: 64 })
		.withMessage("Folder name must be 64 characters or less")
		.not()
		.matches(FORBIDDEN_NAMES)
		.withMessage("Folder name cannot be '.' or '..'"),
];

export function handleValidationErrors(view) {
	return (req, res, next) => {
		const errors = validationResult(req);

		if (!errors.isEmpty()) {
			// Special case: folder upload route
			if (view === "folder" && req.params.id) {
				req.session.validationErrors = errors.array();
				return res.redirect(`/folders/${req.params.id}`);
			}

			// Default behavior for other views
			return res.status(400).render(view, {
				errors: errors.array(),
				userInput: req.body,
			});
		}

		next();
	};
}
