import { CommandType } from "@/types/command";
import registerCommand from "./subCommands/registerCommand";
import loginCommand from "./subCommands/loginCommand";
import logoutCommand from "./subCommands/logoutCommand";
import { getLoginUser } from "@/api/user";
import { useUserStore } from "@/stores";
import { LOCAL_USER } from "@/constants/user";

/**
 * 用户命令
 * @author zwf021123
 */
const userCommand: CommandType = {
  func: "user",
  name: "用户",
  alias: [],
  params: [
    {
      key: "subCommand",
      desc: "子命令",
      required: true,
    },
  ],
  subCommands: {
    login: loginCommand,
    register: registerCommand,
    logout: logoutCommand,
  },
  options: [],
  async action(options, terminal) {
    const { loginUser } = useUserStore();
    if (loginUser && loginUser.username !== LOCAL_USER.username) {
      let text = `当前用户：${loginUser.username}`;
      if (loginUser.email) {
        text += ` ${loginUser.email}`;
      }
      terminal.writeTextResult(text);
    } else {
      terminal.writeTextErrorResult("未登录，请执行 user login 命令登录");
    }
  },
};

export default [userCommand];
