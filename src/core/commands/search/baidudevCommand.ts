import { CommandType } from "@/types/command";

/**
 * 百度开发者搜索命令
 * @author zwf021123
 */
const baidudevCommand: CommandType = {
  func: "baidudev",
  name: "百度开发者搜索",
  alias: ["dev"],
  params: [
    {
      key: "word",
      desc: "搜索内容",
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
  action(options, terminal) {
    const { _, self } = options;
    const word = _.length > 0 ? _[0] : "";
    const targetLink = `https://kaifa.baidu.com/searchPage?wd=${word}`;
    if (self) {
      window.location.href = targetLink;
    } else {
      window.open(targetLink);
    }
  },
};

export default baidudevCommand;
