import { CommandType } from "@/types/command";
import { useSpaceStore } from "@/stores";

/**
 * 移动目录（重命名）
 */
const moveCommand: CommandType = {
  func: "move",
  name: "移动空间条目",
  alias: ["mv"],
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
      desc: "是否递归移动",
      alias: ["r"],
      type: "boolean",
      defaultValue: false,
    },
    {
      key: "completely",
      desc: "是否完全移动",
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
      await spaceStore.moveItem(source, target, recursive, completely);
      terminal.writeTextSuccessResult("移动成功");
    } catch (errMsg: any) {
      terminal.writeTextErrorResult(errMsg);
    }
  },
};

export default moveCommand;
