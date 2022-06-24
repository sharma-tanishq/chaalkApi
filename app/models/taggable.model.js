module.exports = (sequelize, Sequelize) => {
  const Taggable = sequelize.define("tag_taggable", {
    tagId: {
      type: Sequelize.INTEGER,
      unique: 'tt_unique_constraint'
    },
    taggableId: {
      type: Sequelize.INTEGER,
      unique: 'tt_unique_constraint',
      references: null
    },
    taggableType: {
      type: Sequelize.STRING,
      unique: 'tt_unique_constraint'
    }
  }, {
    underscored: true,
    timestamps: false,
    uniqueKeys: {
      ttUniqueConstraint: {
        fields: ['tag_id', 'taggable_id', 'taggable_type']
      }
    }
  });

  return Taggable;
};