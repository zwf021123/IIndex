import { CommandType } from "@/types/command";
import { useSpaceStore } from "@/stores";
import { SpaceItemType } from "@/types/space";

/**
 * 新增
 */
const addCommand: CommandType = {
  func: "add",
  name: "新增空间条目",
  alias: ["touch", "new"],
  options: [
    {
      key: "name",
      desc: "条目名称",
      alias: ["n"],
      type: "string",
      required: true,
    },
    {
      key: "link",
      desc: "链接",
      alias: ["l"],
      type: "string",
      required: true,
    },
    {
      key: "dir",
      desc: "目标目录",
      alias: ["d"],
      type: "string",
    },
  ],
  async action(options, terminal): Promise<void> {
    let { _, name, link, dir } = options;
    const spaceStore = useSpaceStore();
    if (!dir) {
      // 默认当前目录
      dir = spaceStore.currentDir;
    }
    if (!name) {
      terminal.writeTextResult("请输入名称");
      return;
    }
    if (!link) {
      terminal.writeTextResult("请输入网址");
      return;
    }
    if (!link.startsWith("http://") && !link.startsWith("https://")) {
      link = "http://" + link;
    }
    const item: SpaceItemType = {
      dir,
      link,
      name,
      type: "link",
    };
    try {
      await spaceStore.addItem(item);
      terminal.writeTextSuccessResult("添加成功");
    } catch (errMsg: any) {
      terminal.writeTextErrorResult(errMsg);
    }
  },
};

export default addCommand;
