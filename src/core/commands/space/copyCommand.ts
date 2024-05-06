import { CommandType } from "@/types/command";
import { useSpaceStore } from "@/stores";

/**
 * 复制
 */
const copyCommand: CommandType = {
  func: "copy",
  name: "复制空间条目",
  alias: ["cp"],
  params: [
    {
      key: "source",
      desc: "来源路径",
      required: true,
    },
    {
      key: "target",
      desc: "目标路径",
      required: true,
    },
  ],
  options: [
    {
      key: "recursive",
      desc: "是否递归复制",
      alias: ["r"],
      type: "boolean",
      defaultValue: false,
    },
    {
      key: "completely",
      desc: "是否完全复制",
      alias: ["c"],
      type: "boolean",
      defaultValue: false,
    },
  ],
  async action(options, terminal): Promise<void> {
    const { _, recursive = false, completely = false } = options;
    if (_.length < 2) {
      terminal.writeTextErrorResult("参数不足");
      return;
    }
    const spaceStore = useSpaceStore();
    const [source, target] = _;

    try {
      await spaceStore.copyItem(source, target, recursive, completely);
      terminal.writeTextSuccessResult("复制成功");
    } catch (errMsg: any) {
      terminal.writeTextErrorResult(errMsg);
    }
  },
};

export default copyCommand;
