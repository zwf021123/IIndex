import { CommandType } from "@/types/command";
import { defineAsyncComponent } from "vue";
import { getSingleMusic } from "@/api/music";
import ComponentOutputType = YuTerminal.ComponentOutputType;

/**
 * 音乐命令
 * @author zwf021123
 */
const musicCommand: CommandType = {
  func: "music",
  name: "音乐",
  desc: "在线听音乐",
  params: [
    {
      key: "name",
      desc: "音乐名称",
      required: true,
    },
  ],
  options: [],
  collapsible: true,
  async action(options, terminal) {
    const { _ } = options;
    if (_.length < 1) {
      terminal.writeTextErrorResult("参数不足");
      return;
    }
    const name = _[0];
    let musicPath = "";
    const res: any = await getSingleMusic(name);
    if (res?.code === 0) {
      const music = res.data;
      musicPath = `//music.163.com/outchain/player?type=2&id=${music.id}&auto=1&height=66`;
      const output: ComponentOutputType = {
        type: "component",
        component: defineAsyncComponent(() => import("./MusicBox.vue")),
        props: {
          musicPath,
        },
      };
      terminal.writeResult(output);
    } else {
      terminal.writeTextErrorResult("未找到音乐");
    }
  },
};

export default musicCommand;
