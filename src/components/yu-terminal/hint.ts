import { ref } from "vue";
import { getUsageStr } from "../../core/commands/terminal/help/helpUtils";
import { commandList, commandMap } from "../../core/commandRegister";
import _, { trim } from "lodash";
import { useTerminalConfigStore } from "@/stores";

/**
 * 命令提示功能
 * @author awf021123
 */
const useHint = () => {
  const hint = ref("");
  // 记录匹配到的命令（便于后续提示操作）
  const command = ref();
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
    command.value = commandMap[likeKey];
    if (!command.value) {
      hint.value = "";
      return;
    }
    // 子命令提示
    if (
      command.value.subCommands &&
      Object.keys(command.value.subCommands).length > 0 &&
      args.length > 1
    ) {
      // 模糊查询子命令func(这里只能满足存在父子命令的情况)
      const likeKey = likeSearch(args[1], command.value.subCommands);
      hint.value = getUsageStr(
        command.value.subCommands[likeKey],
        command.value
      );
      // 获取提示后再更新command
      command.value = commandMap[likeKey];
    } else {
      hint.value = getUsageStr(command.value);
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
    command,
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
