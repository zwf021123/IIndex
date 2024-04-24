import { CommandType } from "@/types/command";
import { defineAsyncComponent } from "vue";
import ComponentOutputType = YuTerminal.ComponentOutputType;

/**
 * DDOS 命令（整活）
 * @author zwf021123
 */
const ddosCommand: CommandType = {
  func: "ddos",
  name: "ddos",
  desc: "发起网络攻击，慎用！",
  options: [],
  action(options, terminal) {
    const output: ComponentOutputType = {
      type: "component",
      component: defineAsyncComponent(() => import("./DdosBox.vue")),
      props: {},
    };
    terminal.writeResult(output);
  },
};

export default ddosCommand;
