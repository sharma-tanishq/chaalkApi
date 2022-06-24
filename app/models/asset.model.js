module.exports = (sequelize, Sequelize) => {
  const Asset = sequelize.define("assets", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING,
      null: true
    },
    path: {
      type: Sequelize.STRING,
    },
    content: {
      type: Sequelize.STRING
    },
    mimetype: {
      type: Sequelize.STRING,
    },
    isPrivate: {
      type: Sequelize.BOOLEAN,
      default: false
    }
  }, { underscored: true });

  return Asset;
};