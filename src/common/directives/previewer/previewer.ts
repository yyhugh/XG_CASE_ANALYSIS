import "./index.css";
import "viewerjs/dist/viewer.min.css";
import { Directive, DirectiveBinding } from "vue";
import Viewer from "viewerjs";

interface El extends HTMLElement {
  viewerInstance?: Viewer;
}

function createViewer(el: El, binding: DirectiveBinding): void {
  function handler() {
    const { arg, modifiers } = binding;

    // 使用前先销毁
    if (el.viewerInstance) {
      el.viewerInstance.destroy();
      el.viewerInstance = undefined;
    }

    // 处理指令参数
    switch (arg) {
      // 通过按钮来预览
      case "btn": {
        const keys = Object.keys(modifiers);
        if (keys.length > 0) {
          const className = keys[0];
          const btnEl = el.getElementsByClassName(className)[0] as HTMLButtonElement;
          btnEl.onclick = () => el.viewerInstance?.show();
        }
        break;
      }
      default: {
        // 判断节点是否为img标签
        if (el.tagName.toLowerCase() === "img") {
          // 给当前图片添加鼠标样式
          el.title = "点击查看大图";
          el.classList.add("v-previewer-cursor");
        } else {
          // 给所有图片添加鼠标样式
          const imgs = el.querySelectorAll("img");
          imgs.forEach((img) => {
            img.title = "点击查看大图";
            img.classList.add("v-previewer-cursor");
          });
        }
        break;
      }
    }

    // 实例化并保存
    const viewer = new Viewer(el, {
      // 自定义工具栏
      toolbar: {
        zoomIn: true,
        zoomOut: true,
        oneToOne: true,
        reset: true,
        prev: true,
        play: true,
        next: true,
        rotateLeft: true,
        rotateRight: true,
        flipHorizontal: true,
        flipVertical: true,
      },
    });
    el.viewerInstance = viewer;
  }
  // ? 等待视图节点更新后
  setTimeout(handler, 0);
}

function destroyViewer(el: El) {
  if (el.viewerInstance) {
    el.viewerInstance.destroy();
  }
}

/**
 * 图片预览器指令
 * ---
 * 钩子函数参数文档 https://v3.cn.vuejs.org/guide/custom-directive.html#%E9%92%A9%E5%AD%90%E5%87%BD%E6%95%B0
 */
const previewer: Directive = {
  mounted(el, binding): void {
    createViewer(el, binding);
  },
  updated(el, binding): void {
    createViewer(el, binding);
  },
  beforeUnmount(el): void {
    destroyViewer(el);
  },
};

export default previewer;
