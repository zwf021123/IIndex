import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

export default pinia;

// store统一导出
export * from "./modules/space";
export * from "./modules/todo";
export * from "./modules/user";
export * from "./modules/terminalConfig";
