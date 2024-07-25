<template>
  <div
    class="yu-terminal-wrapper"
    :style="wrapperStyle"
    @click="handleClickWrapper"
    @dblclick="handleDlbClickWrapper"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <a-spin
      class="loading"
      tip="Loading..."
      size="large"
      :spinning="spinning"
    />

    <div ref="terminalRef" class="yu-terminal" :style="mainStyle">
      <a-collapse
        v-model:activeKey="activeKeys"
        :bordered="false"
        ghost
        expand-icon-position="right"
      >
        <template v-for="(output, index) in outputList" :key="index">
          <!-- 折叠 -->
          <a-collapse-panel
            v-if="output.collapsible"
            :key="index"
            class="terminal-row"
          >
            <template #header>
              <span style="user-select: none; margin-right: 10px">
                {{ `user@${user.username}:~${output.dir}#` }}
              </span>
              <span>{{ output.text }}</span>
            </template>
            <div
              v-for="(result, idx) in output.resultList"
              :key="idx"
              class="terminal-row"
            >
              <content-output :output="result" />
            </div>
          </a-collapse-panel>
          <!-- 不折叠 -->
          <template v-else>
            <!-- 输出命令及结果-->
            <template v-if="output.type === 'command'">
              <div class="terminal-row">
                <span style="user-select: none; margin-right: 10px">{{
                  `user@${user.username}:~${output.dir}#`
                }}</span>
                <span>{{ output.text }}</span>
              </div>
              <div
                v-for="(result, idx) in output?.resultList"
                :key="idx"
                class="terminal-row"
              >
                <content-output :output="result" />
              </div>
            </template>
            <!-- 打印信息 -->
            <template v-else>
              <div class="terminal-row">
                <content-output :output="output" />
              </div>
            </template>
          </template>
        </template>
      </a-collapse>
      <div class="terminal-row">
        <a-input
          ref="commandInputRef"
          v-model:value="inputCommand.text"
          :disabled="isRunning"
          class="command-input"
          :placeholder="inputCommand.placeholder"
          :bordered="false"
          autofocus
          @press-enter="doSubmitCommand"
        >
          <!-- @change="hideInput" -->
          <template #addonBefore>
            <span class="command-input-prompt">{{ prompt }}</span>
          </template>
        </a-input>
      </div>
      <!-- 输入提示-->
      <div v-if="hint && !isRunning" class="terminal-row" style="color: #bbb">
        hint：{{ hint }}
      </div>
      <div style="margin-bottom: 16px" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  markRaw,
  onMounted,
  ref,
  StyleValue,
  toRefs,
  watchEffect,
  watch,
} from "vue";
import { useSpaceStore, useUserStore } from "@/stores";
import { registerShortcuts } from "./shortcuts";
import { useTerminalConfigStore } from "@/stores";
import { likeSearch } from "@/utils/likeSearch";
import useHint from "./hint";
import useHistory from "./history";
import { LOCAL_USER } from "@/constants/user";
import ContentOutput from "./ContentOutput.vue";
import CommandOutputType = YuTerminal.CommandOutputType;
import OutputType = YuTerminal.OutputType;
import CommandInputType = YuTerminal.CommandInputType;
import TerminalType = YuTerminal.TerminalType;
import TextOutputType = YuTerminal.TextOutputType;
import OutputStatusType = YuTerminal.OutputStatusType;
import { CommandOptionType, CommandType } from "@/types/command";
import { UserType } from "@/types/user";
import { first, second } from "@/constants/terminal";
import { updateSpace } from "@/api/space";
import { executeUpdate, troggerExecuteUpdate } from "@/stores/modules/space";
import { message } from "ant-design-vue";
import _ from "lodash";

interface YuTerminalProps {
  height?: string | number;
  fullScreen?: boolean;
  user?: UserType;
  // eslint-disable-next-line vue/require-default-prop
  onSubmitCommand?: (inputText: string) => void;
}

const props = withDefaults(defineProps<YuTerminalProps>(), {
  height: "400px",
  fullScreen: false,
  user: LOCAL_USER as any,
});

/**
 * 终端主样式
 */
const mainStyle = computed(() => {
  const fullScreenStyle: StyleValue = {
    position: "fixed",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  };
  return props.fullScreen
    ? fullScreenStyle
    : {
        height: props.height,
      };
});

/**
 * 终端包装类主样式
 */
const wrapperStyle = computed(() => {
  // 从配置中获取背景
  const { background } = configStore;
  const style = {
    ...mainStyle.value,
  };
  style.background = `url(${background})  no-repeat center/cover`;

  return style;
});

// 避免解构丢失响应性
const { user } = toRefs(props);

// 记录触摸开始与结束坐标
let touchStartX = 0;
let touchEndX = 0;

/**
 * 触摸开始
 * @param event
 */
const handleTouchStart = (event: TouchEvent) => {
  touchStartX = event.touches[0].clientX;
  console.log("touchStartX", touchStartX);
};

/**
 * 触摸结束
 * @param event
 */
const handleTouchEnd = (event: TouchEvent) => {
  touchEndX = event.changedTouches[0].clientX;
  console.log("touchEndX", touchEndX);
  const deltaX = touchEndX - touchStartX;
  if (deltaX > 50) {
    // 右扫
    showPrevCommand();
  } else if (deltaX < -50) {
    // 左扫
    showNextCommand();
  }
};

const terminalRef = ref();
const activeKeys = ref<number[]>([]);
// 输出列表
const outputList = ref<OutputType[]>([]);
// 命令列表
const commandList = ref<CommandOutputType[]>([]);
const commandInputRef = ref();
// 页面loading
const spinning = ref(false);
// 命令是否运行
const isRunning = ref(false);

// 引入终端配置状态
const configStore = useTerminalConfigStore();

const userStore = useUserStore();

// 使用空间状态
const spaceStore = useSpaceStore();
// 监听空间状态改变并 发请求保存用户空间数据
spaceStore.$subscribe(async (mutation: any, state) => {
  // console.log("mutation", mutation);
  // 判断是否是刷新导致的state改变+是否是logout导致的state改变，则不发送请求update数据
  console.log("****监听state****", state, mutation, executeUpdate);
  if (userStore.isLogin) {
    try {
      if (!executeUpdate) {
        // 跳过一次更新
        troggerExecuteUpdate();
        return;
      }
      await updateSpace(state);
    } catch (e) {
      message.error("数据保存失败");
    }
  } else {
    message.warning("请先登录，否则数据无法保存");
  }
});

/**
 * 初始命令
 */
const initCommand: CommandInputType = {
  text: "",
  placeholder: "",
};

/**
 * 只执行一次
 */
onMounted(() => {
  registerShortcuts(terminal);
  const { welcomeTexts } = configStore;
  if (welcomeTexts?.length > 0) {
    welcomeTexts.forEach((welcomeText) => {
      terminal.writeTextOutput(welcomeText);
    });
  } else {
    terminal.writeTextOutput(first);
    terminal.writeTextOutput(second);
    terminal.writeTextOutput("<br/>");
  }
});

/**
 * 待输入的命令
 */
const inputCommand = ref<CommandInputType>({
  ...initCommand,
});

/**
 * 全局记录当前命令，便于写入结果
 */
let currentNewCommand: CommandOutputType;

const {
  commandHistoryPos,
  showPrevCommand,
  showNextCommand,
  listCommandHistory,
} = useHistory(commandList.value, inputCommand);

const { hint, command, setHint, debounceSetHint } = useHint();

/**
 * 核心
 * 提交命令（回车）
 */
const doSubmitCommand = async () => {
  isRunning.value = true;
  setHint("");
  let inputText = inputCommand.value.text;
  // 执行某条历史命令
  if (inputText.startsWith("!")) {
    const commandIndex = Number(inputText.substring(1));
    const command = commandList.value[commandIndex - 1];
    if (command) {
      inputText = command.text;
    }
  }
  // 执行命令(记录当前命令执行时的目录)
  const newCommand: CommandOutputType = {
    text: inputText,
    type: "command",
    resultList: [],
    dir: useSpaceStore().currentDir,
  };
  // 记录当前命令，便于写入结果
  currentNewCommand = newCommand;
  // 执行命令
  try {
    await props.onSubmitCommand?.(inputText);
  } catch (e) {
    console.log("命令执行异常", e);
    message.error("命令执行异常");
  } finally {
    // 添加输出（为空也要输出换行）
    outputList.value.push(newCommand);
    // 不为空字符串才算是有效命令
    if (inputText) {
      commandList.value.push(newCommand);
      // 重置当前要查看的命令位置
      commandHistoryPos.value = commandList.value.length;
    }
    // 重置
    inputCommand.value = { ...initCommand };
    // 默认展开折叠面板
    activeKeys.value.push(outputList.value.length - 1);
    // 自动滚到底部
    setTimeout(() => {
      terminalRef.value.scrollTop = terminalRef.value.scrollHeight;
    }, 50);
    isRunning.value = false;
  }
};

const hiddenValue = ref([]);

let tempStr = "";

const needHidden = (command: CommandType): boolean => {
  if (!command.options) return false;
  if (command.subCommands) {
    // 递归子命令
    return Object.values(command.subCommands).some((sub) => needHidden(sub));
  } else {
    return command.options.some((option) => option.needHidden);
  }
};

const getNeedHiddenOptions = (command: CommandType): CommandOptionType[] => {
  if (!command.options) return [];
  if (command.subCommands) {
    // 递归子命令
    return Object.values(command.subCommands).reduce(
      (prev: CommandOptionType[], sub) => [
        ...prev,
        ...getNeedHiddenOptions(sub),
      ],
      []
    );
  } else {
    return command.options.filter((option) => option.needHidden);
  }
};

const hideInput = () => {
  if (!command.value) {
    return;
  }
  // 没有需要隐藏的内容(包括子命令)（新建一个函数递归判断）
  if (!needHidden(command.value)) {
    console.log(1);
    return;
  }

  let flag = false;
  tempStr = "";
  // 得到所有需要隐藏的选项（新建一个函数递归获取
  const needHiddenOptions = getNeedHiddenOptions(command.value);
  console.log("需要隐藏的:", needHiddenOptions);
  // 用户输入的最后一个单词
  const lastWord =
    inputCommand.value.text.split(/\s+/).slice(-1).join("") || "";
  // 如果用户输入的最后一个单词在需要隐藏的选项中，则开始隐藏
  console.log("最后一个单词:", lastWord, lastWord.substring(1));

  needHiddenOptions.some((option: CommandOptionType) => {
    if (
      option.alias?.includes(lastWord.substring(1)) ||
      option.key === lastWord.substring(1)
    ) {
      // 开始隐藏
      console.log("开始隐藏");
      flag = true;
    }
  });
  if (flag) {
    const lastChar = inputCommand.value.text.slice(-1);
    // if (lastChar === " ") flag = false;
    tempStr += lastChar;
    inputCommand.value.text = inputCommand.value.text.slice(0, -1) + "*";
  }
};

// 输入框内容改变时，触发输入提示
watchEffect(() => {
  debounceSetHint(inputCommand.value.text);
});

/**
 * 输入提示符
 * 根据用户名和当前最新目录生成
 */
const prompt = computed(() => {
  const spaceStore = useSpaceStore();
  const curDir = spaceStore.currentDir;
  return `user@${user.value.username}:~${curDir}#`;
});

/**
 * 清空所有输出
 */
const clear = () => {
  outputList.value = [];
};

/**
 * 写命令文本结果
 * @param text
 * @param status
 */
const writeTextResult = (text: string, status?: OutputStatusType) => {
  const newOutput: TextOutputType = {
    text,
    type: "text",
    status,
  };
  currentNewCommand.resultList.push(newOutput);
};

/**
 * 写文本错误状态结果
 * @param text
 */
const writeTextErrorResult = (text: string) => {
  writeTextResult(text, "error");
};

/**
 * 写文本成功状态结果
 * @param text
 */
const writeTextSuccessResult = (text: string) => {
  writeTextResult(text, "success");
};

/**
 * 写结果
 * @param output
 */
const writeResult = (output: OutputType) => {
  // 组件无需响应式追踪
  currentNewCommand.resultList.push(
    output.type === "component" ? markRaw(output) : output
  );
};

/**
 * 立即输出文本
 * @param text
 * @param status
 */
const writeTextOutput = (text: string, status?: OutputStatusType) => {
  const newOutput: TextOutputType = {
    text,
    type: "text",
    status,
  };
  outputList.value.push(newOutput);
};

/**
 * 设置命令是否可折叠
 * @param collapsible
 */
const setCommandCollapsible = (collapsible: boolean) => {
  currentNewCommand.collapsible = collapsible;
};

/**
 * 立即输出
 * @param newOutput
 */
const writeOutput = (newOutput: OutputType) => {
  outputList.value.push(newOutput);
};

/**
 * 输入框聚焦
 */
const focusInput = () => {
  commandInputRef.value.focus();
};
/**
 * 获取输入框是否聚焦
 */
const isInputFocused = () => {
  return (
    (commandInputRef.value.input as HTMLInputElement) == document.activeElement
  );
};
/**
 * 设置输入框的值
 */
const setTabCompletion = () => {
  if (hint.value) {
    const wordArr = inputCommand.value.text.split(/\s+/);
    const hintArr = hint.value.split(/\s+/);
    const wordNum = wordArr.length;
    const currentHintWord = hintArr[wordNum - 1];
    const currentWord = wordArr[wordNum - 1];
    const isOption = wordNum > 1 && wordArr[wordNum - 2].startsWith("-");

    /**
     * 判断当前输入的位置信息为路径还是命令（判断当前的hint值是否包含“目录”或“路径”）
     * 还是得新建一个方法进行补全，不然使用getFullPath补全会一直补全为绝对路径)
     */
    //  如果是命令则需要进行命令补全
    if (
      currentHintWord.indexOf("目录") !== -1 ||
      currentHintWord.indexOf("路径") !== -1
    ) {
      // 路径补全
      inputCommand.value.text =
        [
          ...wordArr.slice(0, wordNum - 1),
          spaceStore.autoCompletePath(currentWord),
        ].join(" ") + " ";
    } else if (isOption) {
      const toMatch = wordArr[wordNum - 2][1];
      /**
       * 如果这里能够拿到当前准备执行的命令实例，同时利用wordArr[wordNum - 2]判断是否是一个option
       * 如果是则可以通过实例拿到所有当前option的可选项，然后进行option的补全
       */
      // 获取当前选项的所有可选值
      let options = null;
      for (let i = 0; i < command.value.options.length; i++) {
        if (
          command.value.options[i].key === toMatch ||
          command.value.options[i].alias?.some(
            (alias: string) => alias === toMatch
          )
        ) {
          options = command.value.options[i].alternative;
          break;
        }
      }
      if (!options) {
        // 如果没有找到对应的选项，直接返回
        return;
      }
      // 模糊匹配
      const matchOption = likeSearch(currentWord, options);
      // 补全
      inputCommand.value.text =
        [...wordArr.slice(0, wordNum - 1), matchOption].join(" ") + " ";
    } else {
      // 命令补全
      // 将当前输入个数的单词替换为提示的单词(除了用户输入之前的)
      inputCommand.value.text =
        [...wordArr.slice(0, wordNum - 1), hintArr[wordNum - 1]].join(" ") +
        " ";
    }
  }
};

/**
 * 折叠 / 展开所有块
 */
const toggleAllCollapse = () => {
  // 展开
  if (activeKeys.value.length === 0) {
    activeKeys.value = outputList.value.map((_, index) => {
      return index;
    });
  } else {
    // 折叠
    activeKeys.value = [];
  }
};

/**
 * 设置loading
 */
const setLoading = (loading: boolean) => {
  spinning.value = loading;
};

/**
 * 操作终端的对象
 */
const terminal: TerminalType = {
  writeTextResult,
  writeTextErrorResult,
  writeTextSuccessResult,
  writeResult,
  writeTextOutput,
  writeOutput,
  clear,
  focusInput,
  isInputFocused,
  setTabCompletion,
  doSubmitCommand,
  showNextCommand,
  showPrevCommand,
  listCommandHistory,
  toggleAllCollapse,
  setCommandCollapsible,
  setLoading,
};

/**
 * 当点击空白聚焦输入框
 */
function handleClickWrapper(event: MouseEvent): void {
  //@ts-ignore
  if (event.target.className === "yu-terminal") {
    focusInput();
    // if (event.detail === 1) {
    //   focusInput();
    // } else if (event.detail === 2) {
    //   focusInput();
    //   setTabCompletion();
    // } else if (event.detail === 3) {
    //   focusInput();
    //   toggleAllCollapse();
    // }
  }
}

function handleDlbClickWrapper(event: MouseEvent) {
  //@ts-ignore
  if (event.target.className === "yu-terminal") {
    focusInput();
    setTabCompletion();
  }
}

// const debounceClickWrapper = _.debounce(handleClickWrapper, 200);

defineExpose({
  terminal,
});
</script>

<style scoped>
.yu-terminal-wrapper {
  background: black;
}

.yu-terminal-wrapper > .loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
}

.yu-terminal {
  background: rgba(0, 0, 0, 0.6);
  padding: 20px;
  overflow: scroll;
}

.yu-terminal::-webkit-scrollbar {
  display: none;
}

.yu-terminal span {
  font-size: 16px;
}

.yu-terminal
  :deep(.ant-collapse-icon-position-right
    > .ant-collapse-item
    > .ant-collapse-header) {
  color: white;
  padding: 0;
}

.yu-terminal :deep(.ant-collapse-content > .ant-collapse-content-box) {
  padding: 0;
}

.command-input {
  caret-color: white;
}

.command-input :deep(input) {
  color: white !important;
  font-size: 16px;
  padding: 0 10px;
}

.command-input :deep(.ant-input-group-addon) {
  background: none;
  border: none;
  padding: 0;
}

.command-input-prompt {
  color: white;
  background: transparent;
}

.terminal-row {
  color: white;
  font-size: 16px;
  font-family: courier-new, courier, monospace;
}
</style>
