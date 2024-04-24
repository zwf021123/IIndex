import { CommandType } from "@/types/command";
import { userLogin, userRegister } from "@/api/user";
import { useUserStore } from "@/stores";

/**
 * 用户登录命令
 * @author zwf021123
 */
const loginCommand: CommandType = {
  func: "login",
  name: "用户登录",
  options: [
    {
      key: "username",
      desc: "用户名",
      alias: ["u"],
      type: "string",
      required: true,
    },
    {
      key: "password",
      desc: "密码",
      alias: ["p"],
      type: "string",
      required: true,
    },
  ],
  async action(options, terminal) {
    const { username, password } = options;
    if (!username) {
      terminal.writeTextErrorResult("请输入用户名");
      return;
    }
    if (!password) {
      terminal.writeTextErrorResult("请输入密码");
      return;
    }
    const res: any = await userLogin(username, password);
    const { setLoginUser } = useUserStore();
    if (res?.code === 0) {
      setLoginUser(res.data);
      terminal.writeTextSuccessResult("登录成功");
    } else {
      terminal.writeTextErrorResult(res?.message ?? "登录失败");
    }
  },
};

export default loginCommand;
