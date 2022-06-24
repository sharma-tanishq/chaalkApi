const db = require("../models");
const config = require("../config/auth.config");
const Tag = db.tag;
const Taggable = db.taggable;

const Op = db.Sequelize.Op;

var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

exports.create = (req, res) => {
  // Save User to Database
  Tag.create({
    name: req.body.name,
    type: req.body.type,
    content: req.body.content,
    isTemplate: req.body.isTemplate || false,
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

  Tag.findByPk(id)
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
  // const userId = req.params.user_id
  db.tag.findAll({
    where: { type: 'board' }
    // include: [{
    //   model: Taggable,
    //   where: { taggableType: 'board' }
    // }]
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

  Tag.update(req.body, {
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

  Tag.destroy({
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
  Tag.destroy({
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
  Tag.findAll({ where: { is_template: true } })
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