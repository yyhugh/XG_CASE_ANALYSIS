<template>
  <div class="v-panel" :style="{ ...panelStyle }">
    <!-- 标题 -->
    <div class="title">{{ title }}</div>
    <!-- 内容 -->
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

defineProps({
  title: String,
  width: Number,
  height: Number,
  top: Number,
  bottom: Number,
  left: Number,
  right: Number,
});

const panelStyle = ref<any>({
  width: "400px",
  height: "300px",
  top: "80px",
  bottom: "unset",
  left: "30px",
  right: "unset",
});

/**
 * 面板样式容器，统一样式风格
 */
// @Options({})
// export default class Panel extends Vue {
//   @prop({ required: false, type: String, default: "" })
//   protected title: string;

//   @Prop({ required: false, type: [Number, String], default: 400 })
//   protected width: number;

//   @Prop({ required: false, type: [Number, String], default: 300 })
//   protected height: number;

//   @Prop({ required: false, type: [Number, String], default: null })
//   protected top: number;

//   @Prop({ required: false, type: [Number, String], default: null })
//   protected bottom: number;

//   @Prop({ required: false, type: [Number, String], default: null })
//   protected left: number;

//   @Prop({ required: false, type: [Number, String], default: null })
//   protected right: number;

//   protected panelStyle = {
//     width: null,
//     height: null,
//     top: null,
//     bottom: null,
//     left: null,
//     right: null,
//   };

//   /**
//    * 图表全屏属性
//    */
//   protected chartFullScreen = 0;

//   /**
//    * 处理单位问题
//    * ---
//    * 借助原型链中的单位转换方法进行适配
//    */
//   protected formatUnit(val: number | string): string {
//     if (typeof val === "string") {
//       if (val.endsWith("%")) {
//         return val;
//       }

//       if (val.endsWith("Px") || val.endsWith("PX")) {
//         return val.replace(/Px|PX/g, "px"); // PX|Px转小写
//       }
//     }

//     const num = Number.parseFloat(val as string);

//     if ((this as any).px2vh) {
//       return (this as any).px2vh(num);
//     } else {
//       return num + "px";
//     }
//   }

//   protected dblclickHandler() {
//     const time = new Date().getTime();
//     this.chartFullScreen = time;
//   }

//   @Watch("width", { deep: true, immediate: true })
//   protected watchWidth(next: number | string): void {
//     this.panelStyle.width = this.formatUnit(next);
//   }

//   @Watch("height", { deep: true, immediate: true })
//   protected watchHeight(next: number | string): void {
//     this.panelStyle.height = this.formatUnit(next);
//   }

//   @Watch("top", { deep: true, immediate: true })
//   protected watchTop(next: number | string): void {
//     if (next === null) {
//       return;
//     }
//     if (this.panelStyle.bottom === null) {
//       this.panelStyle.top = this.formatUnit(next);
//     }
//   }

//   @Watch("bottom", { deep: true, immediate: true })
//   protected watchBottom(next: number | string): void {
//     if (next === null) {
//       return;
//     }
//     this.panelStyle.bottom = this.formatUnit(next);
//     this.panelStyle.top = null;
//   }

//   @Watch("left", { deep: true, immediate: true })
//   protected watchLeft(next: number | string): void {
//     if (next === null) {
//       return;
//     }
//     if (this.panelStyle.right === null) {
//       this.panelStyle.left = this.formatUnit(next);
//     }
//   }

//   @Watch("right", { deep: true, immediate: true })
//   protected watchRight(next: number | string): void {
//     if (next === null) {
//       return;
//     }
//     this.panelStyle.right = this.formatUnit(next);
//     this.panelStyle.left = null;
//   }
// }
</script>

<style lang="scss" scoped>
.v-panel {
  position: absolute;

  & > .title {
    position: absolute;
    top: -43px;
    width: 158px;
    height: 40px;
    line-height: 40px;
    font-size: 18px;
    font-weight: bold;
    text-indent: 28px;
    cursor: pointer;
    user-select: none;
    color: #ffffff;
    background: url("./bg_title.png") top left/ 100% 100% no-repeat;
  }

  & > .content {
    width: 100%;
    height: 100%;
    background: url("./bg_normal.png") top left / 100% 100% no-repeat;
    color: #ffffff;
  }
}
</style>
