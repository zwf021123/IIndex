import { CommandType } from "@/types/command";
import { useSpaceStore } from "@/stores";
import { SpaceItemType } from "@/types/space";

/**
 * 新增
 */
const addCommand: CommandType = {
  func: "update",
  name: "更新空间条目",
  // alias: ["", ""],
  params: [
    {
      key: "item",
      desc: "要更新的条目路径",
      required: true,
    },
  ],
  options: [
    {
      key: "name",
      desc: "条目名称",
      alias: ["n"],
      type: "string",
    },
    {
      key: "link",
      desc: "链接",
      alias: ["l"],
      type: "string",
    },
  ],
  async action(options, terminal): Promise<void> {
    let { _, name, link } = options;
    const dir = _[0];
    const spaceStore = useSpaceStore();

    if (!name && !link) {
      terminal.writeTextErrorResult("请至少输入名称或链接");
      return;
    }
    const isDir = spaceStore.getItem(dir)?.type === "dir";
    if (isDir) {
      terminal.writeTextErrorResult("不能更新目录的link字段");
      return;
    }
    // 获取原有的name和link，避免只更新一个字段时，另一个字段被清空
    if (!name) {
      name = spaceStore.getItem(dir)?.name;
    }
    if (!link) {
      link = spaceStore.getItem(dir)?.link;
    }
    // 默认处理链接前缀为http
    if (link && !link.startsWith("http://") && !link.startsWith("https://")) {
      link = "http://" + link;
    }
    try {
      await spaceStore.updateItem(dir, name, link);
      terminal.writeTextSuccessResult("更新成功");
    } catch (errMsg: any) {
      terminal.writeTextErrorResult(errMsg);
    }
  },
};

export default addCommand;
