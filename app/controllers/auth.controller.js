const db = require("../models");
const config = require("../config/auth.config");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const User = db.user;
const Role = db.role;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.signup = (req, res) => {
	// Save User to Database
	User.create({
		username: req.body.username,
		email: req.body.email,
		password: bcrypt.hashSync(req.body.password, 8),
	})
		.then((user) => {
			if (req.body.roles) {
				Role.findAll({
					where: {
						name: {
							[Op.or]: req.body.roles,
						},
					},
				}).then((roles) => {
					user.setRoles(roles).then(() => {
						res.send({ message: "User was registered successfully!" });
					});
				});
			} else {
				// user role = 1
				user.setRoles([1]).then(() => {
					res.send({ message: "User was registered successfully!" });
				});
			}
		})
		.catch((err) => {
			res.status(500).send({ message: err.message });
		});
};

exports.signin = (req, res) => {
	User.findOne({
		where: {
			username: req.body.username,
		},
	})
		.then((user) => {
			if (!user) {
				return res.status(404).send({ message: "User Not found." });
			}

			var passwordIsValid = bcrypt.compareSync(
				req.body.password,
				user.password
			);

			if (!passwordIsValid) {
				return res.status(401).send({
					accessToken: null,
					message: "Invalid Password!",
				});
			}

			var token = jwt.sign({ id: user.id }, config.secret, {
				expiresIn: 86400, // 24 hours
			});

			var authorities = [];
			user.getRoles().then((roles) => {
				for (let i = 0; i < roles.length; i++) {
					authorities.push("ROLE_" + roles[i].name.toUpperCase());
				}
				res.status(200).send({
					id: user.id,
					username: user.username,
					email: user.email,
					roles: authorities,
					accessToken: token,
				});
			});
		})
		.catch((err) => {
			res.status(500).send({ message: err.message });
		});
};

exports.googleLogin = async (req, res) => {
	const { token } = req.body;
	const ticket = await client.verifyIdToken({
		idToken: token,
		audience: process.env.GOOGLE_CLIENT_ID,
	});
	const { name, email, picture } = ticket.getPayload();
	const user = await upsertUser(email, picture, name);

	if (user) {
		req.session.userId = user.id;
		req.session.user = user;
		var localToken = jwt.sign({ id: user.id }, config.secret, {
			expiresIn: 86400, // 24 hours
		});

		res.status(201);
		res.json({
			...user.dataValues,
			token: localToken,
		});
	} else {
		res.status(401);
		res.json({ message: "User Not Found" });
	}
};

async function upsertUser(email, picture, name) {
	let user = await User.findOne({ where: { email } });
	if (user) {
		user.update({ picture, name });
	} else {
		user = await User.create({ name, email, picture });
	}
	return user;
}

exports.currentUser = (req, res) => {
	User.findOne({
		where: {
			id: req.userId,
		},
		include: Role,
	})
		.then((user) => {
			let isAdmin = false;
			const roles = user.dataValues.roles;
			const _user = user.dataValues;
			for (let i = 0; i < roles.length; i++) {
				if (roles[i].name === "admin" || roles[i].name === "moderator") {
					isAdmin = true;
				}
			}
			res.status(200);
			res.json({
				name: _user.name,
				email: _user.email,
				picture: _user.picture,
				isAdmin: isAdmin,
			});
		})
		.catch((err) => {
			console.log(err);
			res.status(404);
			res.json({ message: "User Not Found" });
		});
};

exports.getAllUsers = (req, res) => {
	User.findAll({
		include: Role,
	})
		.then((users) => {
			const result = [];
			users.forEach((user) => {
				let isAdmin = false;
				const roles = user.dataValues.roles;
				const _user = user.dataValues;
				for (let i = 0; i < roles.length; i++) {
					if (roles[i].name === "admin" || roles[i].name === "moderator") {
						isAdmin = true;
					}
				}
				res.status(200);
				result.push({
					id: user.id,
					name: _user.name,
					email: _user.email,
					picture: _user.picture,
					isAdmin: isAdmin,
				});
			});

			res.json(result);
		})
		.catch((err) => {
			console.log(err);
			res.status(404);
			res.json({ message: "User Not Found" });
		});
};

exports.makeAdmin = (req, res) => {
	User.findOne({
		where: {
			email: req.body.email,
		},
		include: Role,
	})
		.then((user) => {
			let isAdmin = false;
			const roles = user.dataValues.roles;
			const _user = user.dataValues;
			for (let i = 0; i < roles.length; i++) {
				if (roles[i].name === "admin" || roles[i].name === "moderator") {
					isAdmin = true;
				}
			}
			if (!isAdmin) {
				Role.findAll({
					where: {
						name: {
							[Op.or]: ["admin"],
						},
					},
				})
					.then((roles) => {
						user
							.setRoles([0])
							.then(() => {
								res.send({
									message: "User was registered successfully!",
								});
							})
							.catch((er) => {
								console.log(er);
								res.status(404);
								res.json({ message: er });
							});
					})
					.catch((er) => {
						console.log(er);
						res.status(404);
						res.json({ message: er });
					});
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(404);
			res.json({ message: "User Not Found" });
		});
};

exports.makeUser = (req, res) => {
	User.findOne({
		where: {
			email: req.body.email,
		},
		include: Role,
	})
		.then((user) => {
			let isAdmin = false;
			const roles = user.dataValues.roles;
			const _user = user.dataValues;
			for (let i = 0; i < roles.length; i++) {
				if (roles[i].name === "admin" || roles[i].name === "moderator") {
					isAdmin = true;
				}
			}
			if (isAdmin) {
				Role.findAll({
					where: {
						name: {
							[Op.or]: ["user"],
						},
					},
				})
					.then((roles) => {
						user
							.setRoles(roles)
							.then(() => {
								res.send({
									message: "User was registered successfully!",
								});
							})
							.catch((er) => {
								console.log(er);
								res.status(404);
								res.json({ message: er });
							});
					})
					.catch((er) => {
						console.log(er);
						res.status(404);
						res.json({ message: er });
					});
			}
		})
		.catch((err) => {
			console.log(err);
			res.status(404);
			res.json({ message: "User Not Found" });
		});
};
