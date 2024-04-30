import { CommandType } from "@/types/command";
import searchCommands from "./commands/search/searchCommands";
import gotoCommand from "./commands/gotoCommand";
import spaceCommands from "./commands/space";
import dateCommand from "./commands/dateCommand";
import userCommands from "./commands/user/userCommands";
import timingCommand from "./commands/timing/timingCommand";
import translateCommand from "./commands/translate/translateCommand";
import pingCommand from "./commands/pingCommand";
import todoCommand from "./commands/todo/todoCommand";
import musicCommand from "./commands/relax/music/musicCommand";
import ddosCommand from "./commands/ddos/ddosCommand";
import moyuCommand from "./commands/relax/moyu/moyuCommand";
import hotCommand from "./commands/hot/hotCommand";
import varbookCommand from "./commands/varbook/varbookCommand";
import {
  hintCommand,
  shortcutCommand,
  welcomeCommand,
  infoCommand,
  helpCommand,
  resetCommand,
  backgroundCommand,
  historyCommand,
  clearCommand,
} from "./commands/terminal";
/**
 * 命令列表（数组元素顺序会影响 help 命令的展示顺序，命令命名会影响提示）
 */
const commandList: CommandType[] = [
  shortcutCommand,
  gotoCommand,
  ...searchCommands,
  ...spaceCommands,
  ...userCommands,
  varbookCommand,
  hotCommand,
  todoCommand,
  timingCommand,
  dateCommand,
  clearCommand,
  historyCommand,
  translateCommand,
  helpCommand,
  infoCommand,
  pingCommand,
  musicCommand,
  ddosCommand,
  moyuCommand,
  welcomeCommand,
  backgroundCommand,
  resetCommand,
  hintCommand,
];

/**
 * 命令字典
 * 将命令的 func（或其他别名） 作为 key，方便查找
 */
const commandMap: Record<string, CommandType> = {};

commandList.forEach((command) => {
  commandMap[command.func] = command;
  command.alias?.forEach((name) => {
    commandMap[name] = command;
  });
});

export { commandList, commandMap };
