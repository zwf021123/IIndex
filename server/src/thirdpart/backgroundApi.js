const axios = require("axios");
const https = require("https");

// At request level
const agent = new https.Agent({
  rejectUnauthorized: false,
});

/**
 * 随机获取背景
 * @return {Promise<*[]>}
 */
async function getRandomBackground({ lx = "suiji" }) {
  const api = `https://api.btstu.cn/sjbz/api.php?lx=${lx}&format=json`;
  // const res = await axios.get(api);
  // return res;
  return await axios
    .get(api, { httpsAgent: agent })
    .then((res) => res.data.imgurl);
}

module.exports = {
  getRandomBackground,
};
