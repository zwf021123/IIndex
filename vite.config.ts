import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
// @ts-ignore
import Components from "unplugin-vue-components/vite";
// @ts-ignore
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
// @ts-ignore
import { chromeExtension } from "./build/chromeExtension";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [
    vue(),
    // 按需加载 ant-design-vue
    Components({
      resolvers: [AntDesignVueResolver()],
    }),
    process.env.BUILD_CRX && chromeExtension(),
  ].filter(Boolean),
  resolve: {
    alias: [
      {
        find: "@",
        replacement: resolve(__dirname, "./src"),
      },
    ],
  },
  // server: {
  //   proxy: {
  //     "/api": {
  //       target: "106.53.22.27",
  //       changeOrigin: true,
  //       // rewrite: (path) => path.replace(/^\/req/, ""),
  //     },
  //   },
  // },
});
