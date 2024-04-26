import { CommandType } from "@/types/command";
import { useSpaceStore } from "@/stores";

/**
 * 切换目录
 */
const cdCommand: CommandType = {
  func: "cd",
  name: "切换空间目录",
  params: [
    {
      key: "dir",
      desc: "目标目录",
      required: true,
    },
  ],
  options: [],
  async action(options, terminal): Promise<void> {
    const { _ } = options;
    // 如果没有参数就回到根目录
    const targetDir = _[0];
    const spaceStore = useSpaceStore();
    try {
      await spaceStore.updateCurrentDir(targetDir || "/");
      terminal.writeTextSuccessResult(`已切换至目录：${spaceStore.currentDir}`);
    } catch (errMsg: any) {
      terminal.writeTextErrorResult(errMsg);
    }
  },
};

export default cdCommand;
