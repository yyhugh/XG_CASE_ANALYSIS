import { RouteRecordRaw } from "vue-router";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/home",
    name: "home",
    component: () => import("@/views/HomeView.vue"),
  },
];

routes.unshift({
  path: "/",
  redirect: routes[0].path,
});

export default routes;
