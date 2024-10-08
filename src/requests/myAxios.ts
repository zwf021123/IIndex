import axios from "axios";
import { message } from "ant-design-vue";

// 自定义 axios 实例
const myAxios = axios.create({
  baseURL:
    // @ts-ignore
    // ? "/api"
    process.env.NODE_ENV === "production"
      ? "http://139.9.69.223:5000/api"
      : "http://localhost:5000/api",
});

// 配置请求携带cookie
myAxios.defaults.withCredentials = true;

// 添加请求拦截器
myAxios.interceptors.request.use(
  function (config) {
    // 在发送请求之前做些什么
    return config;
  },
  function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 添加响应拦截器
myAxios.interceptors.response.use(
  function (response) {
    console.log("请求响应：", response);
    // 对响应数据做点什么
    return response.data;
  },
  function (error) {
    console.log("响应错误", error);
    message.error({
      content: () =>
        `${error.response.data?.code || error.response.status || error.code}：${
          error.response.data?.message || "服务异常"
        }`,
    });
    // 对响应错误做点什么
    return Promise.reject(error);
  }
);

export default myAxios;
