import { ApplicationContext } from "./context";
import { createApp } from "vue";

// vuex
import { createStore } from "vuex";
import store from "../store";

// router
import { createRouter, createWebHashHistory } from "vue-router";
import routes from "../router";

// 全局指令
import directives from "../common/directives";

// 根组件
import App from "../views/App.vue";

// UI框架
import ElementPlus from "element-plus";
import "@/styles/theme/element.scss";
import EPlusZhCn from "element-plus/es/locale/lang/zh-cn";

// Cesium
import "/node_modules/cesium/Build/Cesium/Widgets/widgets.css";
import * as Cesium from "cesium";

/**
 * 应用程序
 */
export class Application {
  /**
   * 单实例
   */
  private static _instance: Application;

  /**
   * 当前应用程序上下文
   */
  private applicationContext!: ApplicationContext;

  /**
   * 访问单实例
   */
  public static get instance() {
    if (!this._instance) {
      this._instance = new Application();
    }
    return this._instance;
  }

  /**
   * 启动应用程序
   */
  public async start(context: ApplicationContext): Promise<void> {
    // 上下文
    this.applicationContext = context;

    // 读取缓存
    this.cacheSaveToContext();

    // 创建app
    const app = createApp(App);

    // 批量注册全局指令
    const keys = Object.keys(directives);
    keys.forEach((key) => app.directive(key, directives[key]));

    // 相关依赖初始化
    this.initVendor(context);
    const store = this.initStore();
    const router = this.initRouter(context);

    // 使用中间件
    app.use(store).use(router).use(ElementPlus, {
      locale: EPlusZhCn,
    });

    // 挂载到视图
    app.mount("#app");
  }

  /**
   * 初始化状态仓库
   */
  private initStore() {
    return createStore({
      modules: store,
    });
  }

  /**
   * 初始化路由
   */
  private initRouter(context: ApplicationContext) {
    const router = createRouter({
      history: createWebHashHistory(process.env.BASE_URL),
      routes,
    });
    context.router = router;

    // 路由守卫
    router.beforeEach((to, from, next) => {
      next();
    });

    return router;
  }

  /**
   * 初始化第三方依赖
   */
  private initVendor(context: ApplicationContext) {
    // Cesium设置自己的accessToken
    Cesium.Ion.defaultAccessToken = context.cesiumIonAccessToken;
  }

  /**
   * 读取缓存并存入上下文中
   */
  private cacheSaveToContext(): void {
    // TODO
  }
}
