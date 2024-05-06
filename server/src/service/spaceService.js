const MyError = require("../exception");

const {
  NO_AUTH_ERROR_CODE,
  NOT_FOUND_ERROR_CODE,
} = require("../exception/errorCode");
const { UserModel, SpaceModel } = require("../model");

/**
 * 更新用户space数据（整体替换）
 * @param {string} userId 用户id
 * @param {json} spaceData 用户space数据
 */
async function updateSpace(spaceData, req) {
  const { userInfo } = req.session;
  if (!userInfo?.id) {
    throw new MyError(NO_AUTH_ERROR_CODE, "未登录");
  }
  const currentUser = await UserModel.findByPk(userInfo.id);
  // 检查用户是否合法
  if (!currentUser) {
    throw new MyError(NOT_FOUND_ERROR_CODE, "找不到该用户");
  }
  // 使用currentUser更新space数据
  return await SpaceModel.update(
    { bindingSpace: JSON.stringify(spaceData) },
    {
      where: { userId: currentUser.id },
    }
  );
}

/**
 * 获取用户space数据
 * @param {string} userId 用户id
 */
async function getSpace(req) {
  const { userInfo } = req.session;
  if (!userInfo?.id) {
    throw new MyError(NO_AUTH_ERROR_CODE, "未登录");
  }
  const currentUser = await UserModel.findByPk(userInfo.id);
  // 检查用户是否合法
  if (!currentUser) {
    throw new MyError(NOT_FOUND_ERROR_CODE, "找不到该用户");
  }
  // 使用currentUser获取space数据
  return await SpaceModel.findOne({
    where: { userId: currentUser.id },
    attributes: ["bindingSpace"],
  });
}

/**
 * 删除用户space数据（用户注销时，直接在用户注销接口 操作）
 */

module.exports = {
  updateSpace,
  getSpace,
};
