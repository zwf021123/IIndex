import { CommandType } from "@/types/command";
import { defineAsyncComponent } from "vue";
import ComponentOutputType = YuTerminal.ComponentOutputType;

/**
 * 摸鱼命令
 * @author zwf021123
 */
const moyuCommand: CommandType = {
  func: "moyu",
  name: "摸鱼",
  options: [],
  collapsible: true,
  action(options, terminal) {
    const output: ComponentOutputType = {
      type: "component",
      component: defineAsyncComponent(() => import("./MoYuBox.vue")),
      props: {},
    };
    terminal.writeResult(output);
  },
};

export default moyuCommand;
