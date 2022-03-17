<template>
  <div class="v-admin">
    <transition name="fade">
      <div class="mask" v-show="appLoading">
        <div class="main">
          <img src="~assets/loading.svg" alt="" />
          <p>正在启动...</p>
        </div>
      </div>
    </transition>
    <router-view />
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { useStore } from "vuex";
const store = useStore();
const appLoading = computed(() => store.getters["loading/getAppLoading"]);

function hide() {
  store.dispatch("loading/setAppLoading", false);
}

setTimeout(() => {
  hide();
}, 3500);
</script>

<style lang="scss">
@import "@/styles/reset.scss";

.v-admin {
  position: relative;
  height: 100%;
  background-color: #000;
  .mask {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #06111f;
    .main {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      transform: translateY(-25px);
      p {
        font-size: 32px;
        color: #dedede;
      }
    }
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.5s;
  }
  .fade-enter,
  .fade-leave-to {
    opacity: 0;
  }
}
</style>
