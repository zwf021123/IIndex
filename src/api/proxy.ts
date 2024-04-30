// 该服务为 vercel serve跨域处理
const { createProxyMiddleware } = require("http-proxy-middleware");
module.exports = (req: any, res: any) => {
  let target = "";
  // 代理目标地址
  // xxxxx 替换为 你请求的服务器 如： http://baidu.com
  console.log("req.url", req.url);

  if (req.url.startsWith("/req")) {
    //这里使用/api可能会与vercel serverless 的 api 路径冲突，根据接口进行调整
    target = "106.53.22.27";
  }
  // 创建代理对象并转发请求
  createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      // 通过路径重写，去除请求路径中的 `/req`
      "^/req/": "/",
    },
  })(req, res);
};
export {};
