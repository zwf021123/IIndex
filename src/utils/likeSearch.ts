import { commandMap } from "@/core/commandRegister";

/**
 * 模糊查询
 */
export const likeSearch = (
  keyword: string,
  commandMapParam: Object = commandMap
) => {
  // 大小写无关
  let func = keyword.toLowerCase();
  // 前缀匹配
  const likeKey = Object.keys(commandMapParam).filter((key) =>
    key.startsWith(func)
  )[0];
  return likeKey;
};
