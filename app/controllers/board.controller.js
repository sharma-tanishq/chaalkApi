const db = require("../models");
const Board = db.board;
const queryString = require('query-string');
const { v4: uuidv4 } = require('uuid');

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.create = (req, res) => {
  // Save User to Database
  Board.create({
    id: uuidv4(),
    name: req.body.name,
    content: req.body.content,
    isTemplate: req.body.isTemplate || false,
    thumb: req.body.thumb,
    userId: req.userId
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.findOne = (req, res) => {
  const id = req.params.id;

  Board.findByPk(id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Board with id=${id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Board with id=" + id
      });
    });
};

exports.all = (req, res) => {
  const where = { is_template: false, user_id: req.userId }
  const query = queryString.parse(req.query[0]);
  const limit = query.limit || 100000;
  const offset = query.offset || 0;
  const order = query.order || 'DESC';
  const sort = query.sort || 'updatedAt';

  if (query.tagId) {
    where.tag_id = query.tagId
  }

  if (query.name !== '' && query.name !== undefined) {
    where.name = {
      [Op.iLike]: `%${query.name}%`
    }
  }

  Board.findAll({
    where,
    limit,
    offset,
    order: [[sort, order]]
  })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.update = (req, res) => {
  const id = req.params.id;
  const body = {}
  if (req.body.name) body.name = req.body.name
  if (req.body.tagId) body.tagId = req.body.tagId
  if (req.body.content) body.content = req.body.content
  if (req.body.isTemplate) body.isTemplate = req.body.isTemplate
  if (req.body.thumb) body.thumb = req.body.thumb
  if (req.body.appState) body.appState = req.body.appState

  Board.update(body, {
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Board was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Board with id=${id}. Maybe Board was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Board with id=" + id
      });
    });
};

exports.delete = (req, res) => {
  const id = req.params.id;

  Board.destroy({
    where: { id: id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Board was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Board with id=${id}. Maybe Board was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Board with id=" + id
      });
    });
};

exports.deleteAll = (req, res) => {
  Board.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Boards were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all Boards."
      });
    });
};

exports.findAllTemplates = (req, res) => {
  Board.findAll({ where: { is_template: true } })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving templates."
      });
    });
};
