import { CommandType } from "@/types/command";
import { userLogin, userLogout, userRegister } from "@/api/user";
import { useUserStore } from "@/stores";
import { LOCAL_USER } from "@/constants/user";

/**
 * 用户注销命令
 * @author zwf021123
 */
const logoutCommand: CommandType = {
  func: "logout",
  name: "用户注销",
  options: [],
  async action(options, terminal) {
    const res: any = await userLogout();
    const { setLoginUser } = useUserStore();
    if (res?.code === 0) {
      setLoginUser(LOCAL_USER);
      terminal.writeTextSuccessResult("已退出登录");
    } else {
      terminal.writeTextErrorResult(res?.message ?? "注销失败");
    }
  },
};

export default logoutCommand;
