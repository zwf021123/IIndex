import { CommandType } from "@/types/command";
import { useSpaceStore } from "@/stores";

/**
 * 跳转命令
 * @author zwf021123
 */
export default {
  func: "goto",
  name: "网页跳转",
  alias: ["to", "open", "visit", "jump"],
  params: [
    {
      key: "link",
      desc: "目标链接",
      required: true,
    },
  ],
  options: [
    {
      key: "self",
      desc: "是否当前页面打开",
      alias: ["s"],
      type: "boolean",
      defaultValue: false,
    },
  ],
  action(options, terminal): void {
    const { _, self } = options;
    if (_.length < 1) {
      terminal.writeTextErrorResult("参数不足");
      return;
    }
    let link = _[0];
    // 优先找空间条目链接(即允许直接输入空间条目的name进行跳转)
    let { getItem } = useSpaceStore();
    const item = getItem(link);
    if (item?.link) {
      link = item?.link;
    }
    if (!link.startsWith("http://") && !link.startsWith("https://")) {
      link = "http://" + link;
    }
    if (self) {
      window.location.href = link;
    } else {
      window.open(link);
    }
  },
} as CommandType;
