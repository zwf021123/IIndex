import { RouteRecordRaw, createRouter, createWebHashHistory } from "vue-router";
import IndexPage from "../pages/IndexPage.vue";

const routes: RouteRecordRaw[] = [{ path: "/", component: IndexPage }];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
