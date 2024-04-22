import { CommandType } from "../../../command";
import { useTerminalConfigStore } from "./terminalConfigStore";
import axios from "axios";
import myAxios from "../../../../plugins/myAxios";

/**
 * 切换终端背景
 * @author yupi
 */
const backgroundCommand: CommandType = {
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
  options: [],
  async action(options, terminal) {
    console.log(options._);

    const { _ } = options;
    let url = _[0];
    const { setBackground } = useTerminalConfigStore();
    if (!url) {
      // 随机获取壁纸
      const res = await myAxios.post("/background/get/random");
      setBackground(res.data);
      return;
    }
    setBackground(url);
  },
};

export default backgroundCommand;
