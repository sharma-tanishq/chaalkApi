const db = require("../models");
const config = require("../config/auth.config");
const queryString = require("query-string");
const Asset = db.asset;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.create = async (req, res) => {
	var file = req.file;

	await Asset.create({
		name: req.body.title || file.key,
		path: file.key,
		content: "",
		mimetype: file.mimetype,
		userId: req.userId,
		isPrivate: req.body.isPrivate || false,
	})
		.then((asset) => {
			if (req.body.tags !== "" && req.body.tags !== undefined) {
				const _tags = req.body.tags.split(",");
				_tags.forEach(async (tag) => {
					const _tag = await db.tag.findOne({
						where: { name: tag, type: null },
					});
					if (_tag) {
						asset.addTag(_tag);
					} else {
						db.tag.create({ name: tag }).then((tag) => {
							asset.addTag(tag);
						});
					}
				});
			}

			res.send(asset);
		})
		.catch((err) => {
			res.status(500).send({ message: err.message });
		});
	// asset.addTags(req.body.tags)
	// .then(data => {
	//   const tags = req.body.tags || [];

	//   res.send(data);
	// })
	// .catch(err => {
	//   res.status(500).send({ message: err.message });
	// });
};

exports.createThumbnail = async (req, res) => {
	var file = req.file;
	await Asset.create({
		name: req.body.title || file.key,
		path: file.key,
		content: "",
		mimetype: file.mimetype,
		userId: req.userId,
		isPrivate: false,
	})
		.then((asset) => {
			res.send(asset);
		})
		.catch((err) => {
			res.status(500).send({ message: err.message });
		});
};

exports.findOne = (req, res) => {
	const id = req.params.id;

	Asset.findByPk(id)
		.then((data) => {
			if (data) {
				res.send(data);
			} else {
				res.status(404).send({
					message: `Cannot find Asset with id=${id}.`,
				});
			}
		})
		.catch((err) => {
			res.status(500).send({
				message: "Error retrieving Asset with id=" + id,
			});
		});
};

exports.allTags = (req, res) => {
	db.tag
		.findAll({
			where: { type: null },
		})
		.then((data) => {
			res.send(data);
		})
		.catch((err) => {
			res.status(500).send({ message: err.message });
		});
};

exports.allMyAssets = (req, res) => {
	Asset.findAll({
		where: { userId: req.userId, isPrivate: true },
	})
		.then((data) => {
			res.send(data);
		})
		.catch((err) => {
			res.status(500).send({ message: err.message });
		});
};

exports.all = (req, res) => {
	const query = queryString.parse(req.query[0]);
	const limit = query.limit || 1000;
	const offset = query.offset || 0;
	const order = query.order || "DESC";
	const sort = query.sort || "id";
	const where = { isPrivate: false };
	const include = [];

	if (query.tags !== "") {
		// where.tags = query.tags.split(",")
		include.push({
			model: db.tag,
			as: "tags",
			where: {
				id: query.tags.split(","),
			},
		});
	}

	if (query.name !== "") {
		where.name = {
			[Op.iLike]: `%${query.query}%`,
		};
	}

	Asset.findAll({
		include,
		where,
		limit,
		offset,
		order: [[sort, order]],
	})
		.then((data) => {
			res.send(data);
		})
		.catch((err) => {
			res.status(500).send({ message: err.message });
		});
};

exports.update = (req, res) => {
	const id = req.params.id;

	Asset.update(req.body, {
		where: { id: id },
	})
		.then((num) => {
			if (num == 1) {
				res.send({
					message: "Asset was updated successfully.",
				});
			} else {
				res.send({
					message: `Cannot update Asset with id=${id}. Maybe Asset was not found or req.body is empty!`,
				});
			}
		})
		.catch((err) => {
			res.status(500).send({
				message: "Error updating Asset with id=" + id,
			});
		});
};

exports.delete = (req, res) => {
	const id = req.body.params.id;

	Asset.destroy({
		where: { id: id },
	})
		.then((num) => {
			if (num == 1) {
				res.send({
					message: "Asset was deleted successfully!",
				});
			} else {
				res.send({
					message: `Cannot delete Asset with id=${id}. Maybe Asset was not found!`,
				});
			}
		})
		.catch((err) => {
			res.status(500).send({
				message: "Could not delete Asset with id=" + id,
			});
		});
};

exports.deleteAll = (req, res) => {
	Asset.destroy({
		where: {},
		truncate: false,
	})
		.then((nums) => {
			res.send({ message: `${nums} Assets were deleted successfully!` });
		})
		.catch((err) => {
			res.status(500).send({
				message:
					err.message || "Some error occurred while removing all Assets.",
			});
		});
};

exports.findAllTemplates = (req, res) => {
	Asset.findAll({ where: { isTemplate: true } })
		.then((data) => {
			res.send(data);
		})
		.catch((err) => {
			res.status(500).send({
				message:
					err.message || "Some error occurred while retrieving templates.",
			});
		});
};
