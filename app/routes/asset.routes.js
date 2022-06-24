const { authJwt } = require("../middleware");
const controller = require("../controllers/asset.controller");
const { upload } = require("../middleware/multer");

module.exports = function (app) {
	app.use(function (req, res, next) {
		res.header(
			"Access-Control-Allow-Headers",
			"x-access-token, Origin, Content-Type, Accept"
		);
		next();
	});

	app.post(
		"/api/assets",
		[authJwt.verifyToken, upload.single("file")],
		controller.create
	);
	app.post(
		"/api/assets/thumbnail",
		[authJwt.verifyToken, upload.single("file")],
		controller.createThumbnail
	);
	app.post("/api/assets-delete", [authJwt.verifyToken], controller.delete);
	app.get("/api/assets", [authJwt.verifyToken], controller.all);
	app.get("/api/assets-self", [authJwt.verifyToken], controller.allMyAssets);
	app.get("/api/tags", [authJwt.verifyToken], controller.allTags);
};
