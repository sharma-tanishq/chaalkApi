module.exports = (sequelize, Sequelize) => {
  const Board = sequelize.define("boards", {
    id: {
      type: Sequelize.UUID,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING
    },
    content: {
      type: Sequelize.TEXT
    },
    appState: {
      type: Sequelize.TEXT
    },
    thumb: {
      type: Sequelize.STRING
    },
    isTemplate: {
      type: Sequelize.BOOLEAN
    },
  }, { underscored: true });

  return Board;
};