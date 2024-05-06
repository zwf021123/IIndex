import { CommandType } from "@/types/command";
import { userLogin, userLogout, userRegister } from "@/api/user";
import { useUserStore, useSpaceStore } from "@/stores";
import { LOCAL_USER } from "@/constants/user";
import { troggerExecuteUpdate } from "@/stores/modules/space";
/**
 * 用户注销命令
 * @author zwf021123
 */
const logoutCommand: CommandType = {
  func: "unregister",
  name: "注销账号",
  options: [],
  async action(options, terminal) {},
};

export default logoutCommand;
