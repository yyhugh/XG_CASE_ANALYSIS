<template>
  <div class="home">
    <div class="container" :id="containerUUID"></div>
    <transition name="r">
      <div class="control-group" v-show="panelShow">
        <el-icon class="ctrl refresh" color="#409EFC" :size="20" @click="refreshCamera"><refresh-left /></el-icon>
        <el-date-picker
          class="ctrl date-picker"
          type="daterange"
          v-model="dateRange"
          :clearable="false"
          :shortcuts="shortcuts"
          start-placeholder="Start date"
          end-placeholder="End date"
          @change="onDateRangeChange"
        ></el-date-picker>
      </div>
    </transition>
    <transition name="r">
      <div class="data-source" v-show="panelShow">数据来源于深圳卫健委</div>
    </transition>
    <!-- 增长趋势 -->
    <!-- <transition name="l">
      <u-layout-panel title="增长趋势" :width="456" :height="370" :left="20" :top="140" v-show="panelShow"></u-layout-panel>
    </transition> -->
    <!-- 年龄段占比 -->
    <!-- 性别占比 -->
    <!-- 来源占比 -->
    <!-- 区域排名 -->
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { RefreshLeft } from "@element-plus/icons-vue";
import * as Cesium from "cesium";
import dayjs from "dayjs";
import { uLayoutPanel } from "@/components";
import { ApplicationContext } from "@/application";
import { Extend } from "@/common/utils";
import { caseService } from "@/services";
import { IPerson } from "@/models";

const context = ApplicationContext.current;
const containerUUID = Extend.uuid();
const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
const panelShow = ref(false);
const dateRange = ref([yesterday, yesterday]);
let dataCaseList: Array<IPerson> = [];

let viewerIns: Cesium.Viewer | undefined;

// 日期快捷键
const shortcuts = [
  {
    text: "昨日",
    value: () => {
      const start = dayjs().subtract(1, "day").format("YYYY-MM-DD");
      const end = dayjs().subtract(1, "day").format("YYYY-MM-DD");
      return [start, end];
    },
  },
  {
    text: "近3天",
    value: () => {
      const start = dayjs().subtract(3, "day").format("YYYY-MM-DD");
      const end = dayjs().subtract(1, "day").format("YYYY-MM-DD");
      return [start, end];
    },
  },
  {
    text: "近一周",
    value: () => {
      const start = dayjs().subtract(1, "week").format("YYYY-MM-DD");
      const end = dayjs().subtract(1, "day").format("YYYY-MM-DD");
      return [start, end];
    },
  },
  {
    text: "近一个月",
    value: () => {
      const start = dayjs().subtract(1, "month").format("YYYY-MM-DD");
      const end = dayjs().subtract(1, "day").format("YYYY-MM-DD");
      return [start, end];
    },
  },
];

const store = useStore();
const appLoading = computed(() => store.getters["loading/getAppLoading"]);

watch(appLoading, () => {
  const viewer = viewerIns as Cesium.Viewer;
  if (!viewer) {
    return;
  }
  // ? 该定时器是为了优化体验效果
  setTimeout(() => {
    setDefaultCamera(viewer, 3, () => {
      const layer = getAMapImageryProvider();
      // ? 该定时器是为了优化体验效果
      setTimeout(() => {
        viewer.imageryLayers.addImageryProvider(layer);
        drawAreaPolyline(viewer, "深圳市");
        drawCasePoint(viewer, yesterday, yesterday); // 默认查昨日数据
        panelShow.value = true;
      }, 800);
    });
  }, 2200);
});

function createViewer() {
  // 新地图信息
  const esri = new Cesium.ArcGisMapServerImageryProvider({
    url: context.arcGISMapServer,
  });

  // 实例化并隐藏附带的操作控件
  const viewer = new Cesium.Viewer(containerUUID, {
    geocoder: false, // 地理位置搜索控件
    homeButton: false, // 平滑过渡到默认视角控件
    sceneModePicker: false, // 切换2D、3D地图模式控件
    baseLayerPicker: false, // 切换三维数字地球底图控件
    navigationHelpButton: false, // 帮助提示控件
    animation: false, // 视窗动画播放速度控件
    timeline: false, // 时间轴控件
    fullscreenButton: false, // 视窗全屏按钮控件
    infoBox: false, // 信息窗口控件
    imageryProvider: esri, // 加载新地图
  });
  viewerIns = viewer;

  // 设置动画
  viewer.clock.shouldAnimate = true; // 设置循环动画
  viewer.clock.multiplier = 1000; // 动画速率

  return viewer;
}

function setDefaultCamera(viewer: Cesium.Viewer, duration = 3, complete?: any) {
  // 摆放好相机
  viewer.scene.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(114.23, 22.06, 58000.0),
    orientation: {
      heading: Cesium.Math.toRadians(0.0),
      pitch: Cesium.Math.toRadians(-40.0),
      roll: 0.0,
    },
    duration,
    complete: () => {
      complete && complete();
    },
  });
}

function getAMapImageryProvider() {
  // 高德地图矢量图层
  const layer = new Cesium.UrlTemplateImageryProvider({
    url: "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
    minimumLevel: 4,
    maximumLevel: 18,
  });
  return layer;
}

function getGeoJSON(areaName: string): Promise<Cesium.GeoJsonDataSource> {
  return Cesium.GeoJsonDataSource.load(`static/geoJSON/${areaName}.json`);
}

function drawAreaPolyline(viewer: Cesium.Viewer, areaName: string) {
  getGeoJSON(areaName).then((dataSource) => {
    // 放入场景中
    viewer.dataSources.add(dataSource);
    // 统一修改样式
    const entities = dataSource.entities.values;
    entities.forEach((entity: any) => {
      entity.polygon.material = new Cesium.Color(0, 0, 0, 0);
      entity.polygon.outline = false;

      // 行政区域边界线加粗
      const positions = entity.polygon.hierarchy._value.positions;
      entity.polyline = {
        positions,
        width: 6,
        material: Cesium.Color.BLUE,
        clampToGround: true,
      };
    });
  });
}

async function drawCasePoint(viewer: Cesium.Viewer, startTime: string, endTime: string) {
  const caseList = await caseService.getCaseList(startTime, endTime);
  dataCaseList = caseList;
  const pointList: Array<Cesium.Entity> = [];
  caseList.forEach((person: IPerson) => {
    const lnglat = person.position.location.split(",");
    const name = person.id.replace("--", " 病例");
    // 画点
    const entity = viewer.entities.add({
      id: person.id,
      name,
      position: Cesium.Cartesian3.fromDegrees(+lnglat[0], +lnglat[1]),
      point: {
        pixelSize: 20,
        color: new Cesium.Color(1, 0, 0, 1),
      },
    });
    pointList.push(entity);
  });
}

function onCaseClick(viewer: Cesium.Viewer, callback: (id: string) => void) {
  // 监听点击事件
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((event) => {
    const pick = viewer.scene.pick(event.position);
    // 检查是否存在空间数据
    if (Cesium.defined(pick) && pick.id.id.includes("--")) {
      callback(pick.id.id);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

function onDateRangeChange(range: Array<any>) {
  if (range) {
    const viewer = viewerIns as Cesium.Viewer;
    viewer.entities.removeAll();
    const start = dayjs(range[0]).format("YYYY-MM-DD");
    const end = dayjs(range[1]).format("YYYY-MM-DD");
    drawCasePoint(viewer, start, end);
    refreshCamera();
  }
}

function refreshCamera() {
  const viewer = viewerIns as Cesium.Viewer;
  setDefaultCamera(viewer, 2);
}

function init() {
  const viewer = createViewer();

  onCaseClick(viewer, (id) => {
    ElMessage({
      type: "success",
      message: id,
    });
    const detail = dataCaseList.find((item) => item.id === id);
    console.log(detail);
  });
}

function destroy() {
  viewerIns?.destroy();
  viewerIns = undefined;
}

onMounted(() => {
  init();
});

onBeforeUnmount(() => {
  destroy();
});
</script>

<style lang="scss" scoped>
.home {
  position: relative;
  height: 100%;
  .container {
    height: 100%;
    :deep(.cesium-viewer) {
      // 展示数据来源控件
      .cesium-viewer-bottom {
        display: none;
      }
    }
  }

  .control-group {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    :deep(.ctrl) {
      margin: 20px 15px 0 0;
      &.refresh {
        font-size: 16px;
        color: red;
        width: 32px;
        height: 32px;
        border-radius: 4px;
        cursor: pointer;
        background-color: #fff;
        box-shadow: rgb(220, 223, 230) 0px 0px 0px 1px inset;
        svg {
          transition: transform 0.3s 0.05s;
        }
        &:hover {
          svg {
            transition: transform 0.3s 0.05s;
            transform: rotate(-270deg);
          }
        }
      }
    }
  }

  .data-source {
    position: absolute;
    top: 60px;
    right: 20px;
    font-size: 14px;
    color: #ccc;
  }

  .l-enter-active,
  .l-leave-active {
    transition: transform 0.5s;
  }
  .l-enter-from,
  .l-leave-to {
    transform: translateX(-500px);
  }

  .r-enter-active,
  .r-leave-active {
    transition: transform 0.5s;
  }
  .r-enter-from,
  .r-leave-to {
    transform: translateX(500px);
  }
}
</style>
