import { CommandType } from "@/types/command";
import { useSpaceStore } from "@/stores";

/**
 * 显示当前所在目录
 */
const pwdCommand: CommandType = {
  func: "pwd",
  name: "显示当前目录位置",
  options: [],
  action(options, terminal): void {
    const spaceStore = useSpaceStore();
    const output = spaceStore.currentDir;
    terminal.writeTextResult(output);
  },
};

export default pwdCommand;
