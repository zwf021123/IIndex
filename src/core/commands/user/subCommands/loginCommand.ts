import { CommandType } from "@/types/command";
import { userLogin } from "@/api/user";
import { useUserStore, useSpaceStore } from "@/stores";
import { troggerExecuteUpdate } from "@/stores/modules/space";

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
      needHidden: true,
    },
  ],
  async action(options, terminal) {
    const { setLoginUser, isLogin } = useUserStore();
    const { requestSpace } = useSpaceStore();
    if (isLogin) {
      terminal.writeTextErrorResult("请先退出登录");
      return;
    }
    const { username, password } = options;
    if (!username) {
      terminal.writeTextErrorResult("请输入用户名");
      return;
    }
    if (!password) {
      terminal.writeTextErrorResult("请输入密码");
      return;
    }
    // const res: any = await userLogin(username, password);
    // console.log(await getCurrentSpace());
    try {
      const loginRes: any = await userLogin(username, password);
      if (loginRes?.code === 0) {
        troggerExecuteUpdate();
        setLoginUser(loginRes.data);
        requestSpace();
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
