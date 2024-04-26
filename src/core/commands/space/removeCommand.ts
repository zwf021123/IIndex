import { CommandType } from "@/types/command";
import { ParsedOptions } from "getopts";
import { useSpaceStore } from "@/stores";

/**
 * 删除
 */
const removeCommand: CommandType = {
  func: "remove",
  name: "删除空间条目",
  alias: ["rm", "delete", "del"],
  params: [
    {
      key: "item",
      desc: "要删除的条目路径",
      required: true,
    },
  ],
  options: [
    {
      key: "recursive",
      desc: "是否递归删除",
      alias: ["r"],
      type: "boolean",
      defaultValue: false,
    },
    {
      key: "force",
      desc: "是否强制删除",
      alias: ["f"],
      type: "boolean",
      defaultValue: false,
    },
  ],
  async action(options: ParsedOptions, terminal): Promise<void> {
    const { _, recursive = false, force } = options;
    if (_.length < 1) {
      terminal.writeTextErrorResult("参数不足");
      return;
    }
    const deleteKey = _[0];
    if (recursive && !force) {
      terminal.writeTextErrorResult("请确认要强制删除");
      return;
    }
    const spaceStore = useSpaceStore();
    try {
      await spaceStore.deleteItem(deleteKey, recursive);
      terminal.writeTextSuccessResult("删除成功");
    } catch (errMsg: any) {
      terminal.writeTextErrorResult(errMsg);
    }
  },
};

export default removeCommand;
