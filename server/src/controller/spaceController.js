const MyError = require("../exception");
const {
  REQUEST_PARAMS_ERROR_CODE,
  NO_AUTH_ERROR_CODE,
} = require("../exception/errorCode");
const { updateSpace, getSpace } = require("../service/spaceService");

/**
 * 更新用户space数据（整体替换）
 * @param {string} userId 用户id
 * @param {json} spaceData 用户space数据
 */
async function updateSpaceApi(spaceData, req, res) {
  if (!spaceData) {
    throw new MyError(REQUEST_PARAMS_ERROR_CODE, "参数错误");
  }
  return await updateSpace(spaceData, req);
}

/**
 * 获取用户space数据
 * @param {string} userId 用户id
 */
async function getSpaceApi(event, req, res) {
  return await getSpace(req);
}

module.exports = {
  updateSpaceApi,
  getSpaceApi,
};
