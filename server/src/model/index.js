const UserModel = require("./user");
const SpaceModel = require("./space");

// 建立关系
UserModel.hasOne(SpaceModel, {
  foreignKey: {
    name: "userId",
    field: "userId",
    allowNull: false,
  },
});
SpaceModel.belongsTo(UserModel);

module.exports = {
  UserModel,
  SpaceModel,
};
