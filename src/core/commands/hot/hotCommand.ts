import { CommandType } from "@/types/command";
import { defineAsyncComponent } from "vue";
import { listHotMusics } from "@/api/music";
import ComponentOutputType = YuTerminal.ComponentOutputType;

/**
 * 热榜命令
 * @author zwf021123
 */
const hotCommand: CommandType = {
  func: "hot",
  name: "热榜",
  alias: [],
  params: [
    {
      key: "热榜类别",
      desc: "要查询的热榜",
      required: false,
    },
  ],
  options: [],
  collapsible: true,
  async action(options, terminal) {
    let songList = [];
    try {
      const res: any = await listHotMusics();
      if (res?.code === 0) {
        const songs = res.data;
        songList = songs.slice(0, 10);
      }
      const output: ComponentOutputType = {
        type: "component",
        component: defineAsyncComponent(() => import("./HotBox.vue")),
        props: {
          songList,
        },
      };
      terminal.writeResult(output);
    } catch (err) {
      terminal.writeTextErrorResult("获取热榜失败");
    }
  },
};

export default hotCommand;
