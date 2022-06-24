require("dotenv").config({ path: __dirname + "/./.env" });
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const db = require("./app/models");
const { v4: uuidv4 } = require("uuid");
var session = require("express-session");

const app = express();

app.use(
	session({
		secret: "someprodsecret__",
		resave: false,
		saveUninitialized: true,
		cookie: { secure: false },
	})
);

var allowedDomains = [
	"http://localhost:3000",
	"http://localhost:8080",
	"http://chaalk.teklogiks.com",
];

var corsOptions = {
	// origin: "http://localhost:8081"
	origin: function (origin, callback) {
		// bypass the requests with no origin (like curl requests, mobile apps, etc )
		if (!origin) return callback(null, true);

		if (allowedDomains.indexOf(origin) === -1) {
			var msg = `This site ${origin} does not have an access. Only specific domains are allowed to access it.`;
			return callback(new Error(msg), false);
		}
		return callback(null, true);
	},
};

app.use(cors(/** corsOptions */));

// parse requests of content-type - application/json
app.use(bodyParser.json({ limit: "10240kb" }));

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// to serve build files
app.use(express.static(path.join(__dirname, "../ui/build")));

// // simple route
// app.get("/", (req, res) => {
// 	res.json({ message: "Welcome to chaalk application." });
// });

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/user.routes")(app);
require("./app/routes/board.routes")(app);
require("./app/routes/workspace.routes")(app);
require("./app/routes/asset.routes")(app);
require("./app/routes/recording.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});

// db.sequelize.sync();
const Role = db.role;
const Board = db.board;

db.sequelize.sync({ force: false }).then(() => {
	console.log("Drop and Resync Db");
	// initial();
});

function initial() {
	Role.create({ id: 1, name: "admin" })
		.then()
		.catch((e) => console.log(e));
	Role.create({ id: 2, name: "moderator" })
		.then()
		.catch((e) => console.log(e));
	Role.create({ id: 3, name: "user" })
		.then()
		.catch((e) => console.log(e));

	// Board.create({ id: uuidv4(), name: "Mathematics", content: "{}", thumb: 'https://placebear.com/230/140', isTemplate: true });
	// Board.create({ id: uuidv4(), name: "Social", content: "{}", thumb: 'https://placebear.com/230/140', isTemplate: true });
	// Board.create({ id: uuidv4(), name: "English", content: "{}", thumb: 'https://placebear.com/230/140', isTemplate: true });
	// Board.create({ id: uuidv4(), name: "Sample", content: "{}", thumb: 'https://placebear.com/230/140', });

	// db.tag.create({ name: "Class 8", type: "board" });
	// db.tag.create({ name: "Class 9", type: "board" });
}

initial();
