const db = require("../models");
const { authJwt } = require("../middleware");
const { verifySignUp } = require("../middleware");
const controller = require("../controllers/auth.controller");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

module.exports = function (app) {
	app.use(function (req, res, next) {
		res.header(
			"Access-Control-Allow-Headers",
			"x-access-token, Origin, Content-Type, Accept"
		);
		next();
	});

	// GOOGLE Signin
	app.post("/api/v1/auth/google", [], controller.googleLogin);

	app.delete("/api/v1/auth/logout", async (req, res) => {
		await req.session.destroy();
		res.status(200);
		res.json({
			message: "Logged out successfully",
		});
	});

	app.get("/api/me", [authJwt.verifyToken], controller.currentUser);
	app.get("/api/meTest", controller.currentUser);
	app.post("/api/auth/makeAdmin", controller.makeAdmin);
	app.post("/api/auth/makeUser", controller.makeUser);
	app.get("/api/auth/allUsers", controller.getAllUsers);

	app.post(
		"/api/auth/signup",
		[
			verifySignUp.checkDuplicateUsernameOrEmail,
			verifySignUp.checkRolesExisted,
		],
		controller.signup
	);

	app.post("/api/auth/signin", controller.signin);
};
