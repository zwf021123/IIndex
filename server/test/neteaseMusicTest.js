const { cloudsearch } = require("NeteaseCloudMusicApi");
const axios = require("axios");
const https = require("https");

// At request level
const agent = new https.Agent({
  rejectUnauthorized: false,
});

async function main() {
  try {
    // Make a request for a user
    const api = "https://api.btstu.cn/sjbz/api.php?lx=fengjing&format=json";

    axios
      .get(api, { httpsAgent: agent })
      .then(function (response) {
        // handle success
        console.log(response);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .finally(function () {
        // always execute
      });

    // const result = await cloudsearch({
    //   keywords: "你好",
    // });
    // console.log(result.body.result.songs);
  } catch (error) {
    console.log(error);
  }
}

main();
