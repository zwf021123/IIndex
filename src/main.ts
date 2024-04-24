import { createApp } from "vue";
import App from "./App.vue";
import router from "./routes";
import pinia from "@/stores";

const app = createApp(App);

// 路由
app.use(router);

// 状态管理
app.use(pinia);

app.mount("#app");
