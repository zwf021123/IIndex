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
  func: "logout",
  name: "退出登录",
  options: [],
  async action(options, terminal) {
    const { setLoginUser, isLogin } = useUserStore();
    const { resetSpace } = useSpaceStore();
    if (!isLogin) {
      terminal.writeTextErrorResult("您还未登录");
      return;
    }
    const res: any = await userLogout();
    if (res?.code === 0) {
      troggerExecuteUpdate();
      setLoginUser(LOCAL_USER);
      resetSpace();
      terminal.writeTextSuccessResult("已退出登录,bye~");
    } else {
      terminal.writeTextErrorResult(res?.message ?? "退出登录失败");
    }
  },
};

export default logoutCommand;
