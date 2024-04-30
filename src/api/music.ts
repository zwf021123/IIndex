import myAxios from "@/requests/myAxios";

/**
 * 搜索单条音乐
 * @param keywords
 */
export const getSingleMusic = async (keywords: string) => {
  if (!keywords) {
    return null;
  }
  return myAxios.post("/music/get", { keywords });
};

/**
 * 获取音乐热榜
 */
export const listHotMusics = async () => {
  return await myAxios.post("/music/list/hot", {});
};
