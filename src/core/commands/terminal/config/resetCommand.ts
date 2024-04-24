import { CommandType } from "@/types/command";
import { useTerminalConfigStore } from "./terminalConfigStore";

/**
 * 重置配置
 * @author zwf021123
 */
const resetCommand: CommandType = {
  func: "reset",
  name: "重置终端配置",
  alias: [],
  options: [],
  action(options, terminal): void {
    const { reset } = useTerminalConfigStore();
    reset();
    terminal.writeTextSuccessResult("已重置终端配置");
  },
};

export default resetCommand;
