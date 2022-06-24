const { authJwt } = require("../middleware");
const controller = require("../controllers/workspace.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.get("/api/workspaces", [authJwt.verifyToken], controller.all);
  app.post("/api/workspaces", [authJwt.verifyToken], controller.create);
  app.put("/api/workspaces/:id", [authJwt.verifyToken], controller.update);
  app.delete("/api/workspaces/:id", [authJwt.verifyToken], controller.delete);
};