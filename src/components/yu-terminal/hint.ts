import { ref } from "vue";
import { getUsageStr } from "../../core/commands/terminal/help/helpUtils";
import { commandList, commandMap } from "../../core/commandRegister";
import _, { trim } from "lodash";
import { useTerminalConfigStore } from "../../core/commands/terminal/config/terminalConfigStore";

/**
 * 命令提示功能
 * @author awf021123
 */
const useHint = () => {
  const hint = ref("");
  const { showHint } = useTerminalConfigStore();

  const setHint = (inputText: string) => {
    // 未开启提示
    if (!showHint) {
      return;
    }
    if (!inputText) {
      hint.value = "";
      return;
    }
    const args = trim(inputText).split(/\s+/);

    const likeKey = likeSearch(args[0]);
    let command = commandMap[likeKey];
    if (!command) {
      hint.value = "";
      return;
    }
    // 子命令提示
    if (
      command.subCommands &&
      Object.keys(command.subCommands).length > 0 &&
      args.length > 1
    ) {
      // 模糊查询子命令func
      const likeKey = likeSearch(args[1], command.subCommands);
      hint.value = getUsageStr(command.subCommands[likeKey], command);
    } else {
      hint.value = getUsageStr(command);
    }
  };

  /**
   * 输入提示防抖
   */
  const debounceSetHint = _.debounce(function (inputText: string) {
    setHint(inputText);
  }, 200);

  return {
    hint,
    setHint,
    debounceSetHint,
  };
};

/**
 * 模糊查询
 */
const likeSearch = (keyword: string, commandMapParam: Object = commandMap) => {
  // 大小写无关
  let func = keyword.toLowerCase();
  // 前缀匹配
  const likeKey = Object.keys(commandMapParam).filter((key) =>
    key.startsWith(func)
  )[0];
  return likeKey;
};

export default useHint;
