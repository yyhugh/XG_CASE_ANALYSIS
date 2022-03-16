<template>
  <div class="v-admin">
    <router-view />
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { RouteRecordRaw } from "vue-router";
import { ApplicationContext } from "@/application";
const context = ApplicationContext.current;
const router = ref(context.router);
const { routes } = router.value.options;
const list = ref<Array<RouteRecordRaw>>([]);

routes.forEach((route) => {
  if (route.path !== "/") {
    list.value.push(route);
  }
});
</script>

<style lang="scss">
@import "@/styles/reset.scss";

.v-admin {
  height: 100%;
  background-color: #000;
}
</style>
