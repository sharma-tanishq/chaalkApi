const config = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
	host: config.HOST,
	port: config.PORT,
	operatorsAliases: 0,
	dialect: config.dialect,
	pool: {
		max: config.pool.max,
		min: config.pool.min,
		acquire: config.pool.acquire,
		idle: config.pool.idle,
	},
	dialectOptions: {
		ssl: {
			require: true,
			rejectUnauthorized: false
		},
	},
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("../models/user.model.js")(sequelize, Sequelize);
db.role = require("../models/role.model.js")(sequelize, Sequelize);
db.board = require("../models/board.model.js")(sequelize, Sequelize);
db.asset = require("../models/asset.model.js")(sequelize, Sequelize);
db.tag = require("../models/tag.model.js")(sequelize, Sequelize);
db.taggable = require("../models/taggable.model.js")(sequelize, Sequelize);

db.role.belongsToMany(db.user, {
	through: "user_roles",
	foreignKey: "role_id",
	otherKey: "user_id",
});

db.user.belongsToMany(db.role, {
	through: "user_roles",
	foreignKey: "user_id",
	otherKey: "role_id",
});

db.board.belongsTo(db.user);
db.board.belongsTo(db.tag);
db.asset.belongsTo(db.user);

// db.board.belongsToMany(db.tag, {
//   through: {
//     model: db.taggable,
//     unique: false,
//     scope: {
//       taggableType: 'board'
//     }
//   },
//   foreignKey: 'taggable_id',
//   constraints: false
// });

db.asset.belongsToMany(db.tag, {
	through: {
		model: db.taggable,
		unique: false,
		scope: {
			taggableType: "asset",
		},
	},
	foreignKey: "taggable_id",
	constraints: false,
});

db.tag.belongsToMany(db.board, {
	through: {
		model: db.taggable,
		unique: false,
	},
	foreignKey: "tag_id",
	constraints: false,
});

db.tag.belongsToMany(db.asset, {
	through: {
		model: db.taggable,
		unique: false,
	},
	foreignKey: "tag_id",
	constraints: false,
});

db.ROLES = ["user", "admin", "moderator"];

module.exports = db;
