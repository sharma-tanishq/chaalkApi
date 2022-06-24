const { authJwt } = require("../middleware");
const controller = require("../controllers/board.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/board-templates", [authJwt.verifyToken], controller.findAllTemplates);
  app.post("/api/boards", [authJwt.verifyToken], controller.create);
  app.get("/api/boards", [authJwt.verifyToken], controller.all);
  app.get("/api/boards/:id", [authJwt.verifyToken], controller.findOne);
  app.put("/api/boards/:id", [authJwt.verifyToken], controller.update);
  app.delete("/api/boards/:id", [authJwt.verifyToken], controller.delete);
  app.get("/api/boards/templates", [authJwt.verifyToken], controller.findAllTemplates);
};