const { DataTypes } = require("sequelize");
const sequelize = require("../db");

/**
 * 用户模型
 * @author zwf021123
 */
const SpaceModel = sequelize.define(
  "Space",
  {
    userId: {
      type: DataTypes.BIGINT,
      primaryKey: true,
    },
    bindingSpace: {
      type: DataTypes.JSON,
    },
  },
  {
    tableName: "user_space_data",
    timestamps: false,
  }
);

module.exports = SpaceModel;
