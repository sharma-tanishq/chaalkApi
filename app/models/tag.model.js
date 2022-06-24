module.exports = (sequelize, Sequelize) => {
  const Tag = sequelize.define("tags", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING
    },
    type: {
      type: Sequelize.STRING
    },
  }, { timestamps: false, underscored: true });

  return Tag;
};