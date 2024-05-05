import { CommandType } from "@/types/command";
import { userLogin } from "@/api/user";
import { getCurrentSpace } from "@/api/space";
import { useUserStore, useSpaceStore } from "@/stores";
import { set } from "lodash";

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
    const { setLoginUser } = useUserStore();
    const { setSpace } = useSpaceStore();
    // const res: any = await userLogin(username, password);
    // console.log(await getCurrentSpace());
    try {
      const loginRes: any = await userLogin(username, password);
      const spaceRes: any = await getCurrentSpace();
      if (loginRes?.code === 0 && spaceRes?.code === 0) {
        setLoginUser(loginRes.data);
        setSpace(spaceRes.data);
        terminal.writeTextSuccessResult("登录成功");
      } else {
        // terminal.writeTextErrorResult(res?.message ?? "登录失败");
        terminal.writeTextErrorResult("登录失败");
      }
    } catch (e) {}
    // const res: any = await Promise.all([
    //   userLogin(username, password),
    //   getCurrentSpace(),
    // ]);
  },
};

export default loginCommand;
