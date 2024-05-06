import { defineStore } from "pinia";
import { getLoginUser } from "@/api/user";
import { LOCAL_USER } from "@/constants/user";
import { UserType } from "@/types/user";
import { useSpaceStore } from "@/stores";

/**
 * 用户系统
 */
export const useUserStore = defineStore("user", {
  state: () => ({
    loginUser: {
      ...LOCAL_USER,
    },
  }),
  getters: {
    isLogin: (state) => state.loginUser.id,
  },
  // 持久化
  persist: {
    key: "user-store",
    storage: window.localStorage,
    beforeRestore: (context) => {
      console.log("load userStore data start");
    },
    afterRestore: (context) => {
      console.log("load userStore data end");
    },
  },
  actions: {
    async getAndSetLoginUser() {
      const { requestSpace } = useSpaceStore();
      const res: any = await getLoginUser();
      if (res?.code === 0 && res.data) {
        this.loginUser = res.data;
        // 登录成功后，同时请求用户的空间信息
        requestSpace();
      } else {
        this.$reset();
      }
    },
    setLoginUser(user: UserType) {
      this.loginUser = user;
    },
  },
});
