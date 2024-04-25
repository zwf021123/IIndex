import listCommand from "./listCommand";
import removeCommand from "./removeCommand";
import addCommand from "./addCommand";
import mkdirCommand from "./mkdirCommand";
import pwdCommand from "./pwdCommand";
import cdCommand from "./cdCommand";
import moveCommand from "./moveCommand";
import copyCommand from "./copyCommand";
import updateCommand from "./updateCommand";

/**
 * 空间命令，类似文件系统 + 收藏夹
 */
export default [
  listCommand,
  removeCommand,
  addCommand,
  mkdirCommand,
  pwdCommand,
  cdCommand,
  moveCommand,
  copyCommand,
  updateCommand,
];
