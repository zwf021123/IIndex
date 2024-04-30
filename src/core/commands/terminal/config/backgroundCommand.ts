import { CommandType } from "@/types/command";
import { useTerminalConfigStore } from "@/stores";
import myAxios from "@/requests/myAxios";

/**
 * 切换终端背景
 * @author zwf021123
 */
export const backgroundCommand: CommandType = {
  func: "background",
  name: "切换终端背景",
  alias: ["bg"],
  params: [
    {
      key: "url",
      desc: "图片地址（不填则随机）",
      required: false,
    },
  ],
  options: [
    {
      key: "category",
      desc: "壁纸分类(可选meizi/dongman/fengjing/suiji)",
      alias: ["c"],
      type: "string",
      alternative: {
        meizi: "妹子",
        dongman: "动漫",
        fengjing: "风景",
        suiji: "随机",
      },
    },
  ],
  action(options, terminal) {
    const { _, category } = options;
    let url = _[0];
    const { setBackground } = useTerminalConfigStore();
    if (!url) {
      terminal.setLoading(true);
      // 随机获取壁纸
      myAxios
        .post("/background/get/random", {
          lx: category || "suiji",
        })
        .then((res) => {
          console.log("背景请求", res);
          setBackground(res.data);
        })
        .finally(() => {
          terminal.setLoading(false);
        });
      return;
    }
    setBackground(url);
  },
};
