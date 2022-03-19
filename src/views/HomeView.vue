<template>
  <div class="home">
    <div class="container" :id="containerUUID"></div>
    <div class="heatmap" ref="heatmapContainer"></div>
    <transition name="r">
      <div class="control-group" v-show="panelShow">
        <el-icon class="ctrl refresh" color="#409EFC" :size="20" @click="refreshCamera"><refresh-left /></el-icon>
        <el-select v-model="currentDrawMode" class="ctrl" placeholder="Select" @change="onDrawModeChange">
          <el-option v-for="item in drawMode" :key="item.type" :label="item.label" :value="item.type" />
        </el-select>
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
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useStore } from "vuex";
import { ElMessage } from "element-plus";
import { RefreshLeft } from "@element-plus/icons-vue";
import * as Cesium from "cesium";
import h337 from "heatmap.js";
import dayjs from "dayjs";
import { ApplicationContext } from "@/application";
import { Extend } from "@/common/utils";
import { caseService } from "@/services";
import { IPerson } from "@/models";

const context = ApplicationContext.current;
const containerUUID = Extend.uuid();
const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

// 状态
const panelShow = ref(false);
const dateRange = ref([yesterday, yesterday]);
const currentDrawMode = ref<"point" | "heatmap">("point");

// 节点
const heatmapContainer = ref();

// 实例
let viewerIns: Cesium.Viewer | undefined;
let heatmapIns: h337.Heatmap<any, any, any> | undefined;

// 数据
let dataCaseGroup: Map<string, Array<IPerson>>;

// Store
const store = useStore();

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

// 支持的绘制模式
const drawMode = [
  {
    label: "分布点",
    type: "point",
  },
  {
    label: "热力图",
    type: "heatmap",
  },
];

/**
 * 创建Viewer实例
 */
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

/**
 * 设置默认相机位置
 */
function setDefaultCamera(viewer: Cesium.Viewer, duration = 3, complete?: any) {
  // 摆放好相机
  viewer.scene.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(114.23, 22.06, 58000.0),
    // destination: Cesium.Cartesian3.fromDegrees(114.214357, 22.657728, 110000.0),
    orientation: {
      heading: Cesium.Math.toRadians(0.0),
      pitch: Cesium.Math.toRadians(-40.0),
      // pitch: Cesium.Math.toRadians(-90.0),
      roll: 0.0,
    },
    duration,
    complete: () => {
      complete && complete();
    },
  });
}

/**
 * 获取高德地图矢量图层
 */
function getAMapImageryProvider() {
  // 高德地图矢量图层
  const layer = new Cesium.UrlTemplateImageryProvider({
    url: "http://webrd02.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
    minimumLevel: 4,
    maximumLevel: 18,
  });
  return layer;
}

/**
 * 根据区域名称读取本地geoJSON文件
 */
function getGeoJSON(areaName: string): Promise<Cesium.GeoJsonDataSource> {
  return Cesium.GeoJsonDataSource.load(`static/geoJSON/${areaName}.json`);
}

/**
 * 根据geoJSON获取区域边界线
 */
async function drawAreaPolyline(viewer: Cesium.Viewer, areaName: string) {
  const dataSource = await getGeoJSON(areaName);
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
}

/**
 * 绘制病例分布点
 */
async function drawCasePoint(viewer: Cesium.Viewer, group: Map<string, Array<IPerson>>) {
  const groupEntries = group.entries();
  for (const target of groupEntries) {
    const [lnglatText, list]: [string, Array<IPerson>] = target;
    const lnglat = lnglatText.split(",").map((item: string) => Number.parseFloat(item));
    const caseTotal = list.length;
    const createTime = list[0].createTime;

    // 画点
    viewer.entities.add({
      id: `case--${createTime}--${lnglatText}`,
      position: Cesium.Cartesian3.fromDegrees(lnglat[0], lnglat[1]),
      point: {
        pixelSize: 20,
        color: new Cesium.Color(1, 0, 0, 1),
      },
    });
    // 画label
    viewer.entities.add({
      position: Cesium.Cartesian3.fromDegrees(lnglat[0], lnglat[1]),
      label: {
        text: caseTotal > 1 ? String(caseTotal) : "",
        font: "16px Hack",
        fillColor: Cesium.Color.RED,
        pixelOffset: new Cesium.Cartesian2(0, -20),
      },
    });
  }
}

/**
 * 绘制热力图
 */
async function drawHeatmap(viewer: Cesium.Viewer, group: Map<string, Array<IPerson>>) {
  const degrees = [113.681448, 22.867816, 114.733389, 22.386134]; // 给定绘制范围
  const lngMin = degrees[0];
  const lngMax = degrees[2];
  const latMin = degrees[3];
  const latMax = degrees[1];

  // 计算圆点与两个坐标点之间的距离，也就是获取宽高
  const o = Cesium.Cartographic.fromDegrees(lngMin, latMax);
  const x = Cesium.Cartographic.fromDegrees(lngMax, latMax);
  const y = Cesium.Cartographic.fromDegrees(lngMin, latMin);

  // 获取ox之间的距离
  const eg1 = new Cesium.EllipsoidGeodesic();
  eg1.setEndPoints(o, x);
  const o2x = eg1.surfaceDistance;

  // 获取oy之间的距离
  const eg2 = new Cesium.EllipsoidGeodesic();
  eg2.setEndPoints(o, y);
  const o2y = eg2.surfaceDistance;

  // 根据绘制范围计算出热力图画布的宽高
  const scale = o2y / o2x; // 高/宽
  const width = window.innerWidth;
  const height = (width * scale) >> 0;
  const points: Array<{ x: number; y: number; value: number; radius: number }> = [];
  let max = 0;

  // 经纬度转平面坐标系
  for (let v of group) {
    const [lnglatText, list] = v;
    const lnglat = lnglatText.split(",");
    const count = list.length;
    max = Math.max(max, count);
    let lng = +lnglat[0];
    let lat = +lnglat[1];
    const leftScale = (lng - lngMin) / (lngMax - lngMin);
    const topScale = (lat - latMin) / (latMax - latMin);
    // 比例换算
    points.push({
      x: (width * leftScale) >> 0,
      y: (height * (1 - topScale)) >> 0,
      value: count,
      radius: 20,
    });
  }

  // 绘制热力图
  const heatmap = h337.create({
    container: heatmapContainer.value,
  });

  // 设置画布大小
  const cvs = (heatmap as any)._renderer.canvas as HTMLCanvasElement;
  cvs.width = width;
  cvs.height = height;

  const data: any = {
    max,
    data: points,
  };
  heatmap.setData(data);

  // 在场景中的绘制范围
  const rectangle = Cesium.Rectangle.fromDegrees(degrees[0], degrees[3], degrees[2], degrees[1]);

  // 热力图层加入场景中(方式1)
  viewer.entities.add({
    rectangle: {
      coordinates: rectangle,
      material: new Cesium.ImageMaterialProperty({
        image: (heatmap as any)._renderer.canvas,
      }),
    },
  });

  // 热力图层加入场景中(方式2)
  // const provider = new Cesium.SingleTileImageryProvider({
  //   url: (heatmap as any)._renderer.canvas.toDataURL(),
  //   rectangle,
  // });
  // viewer.imageryLayers.addImageryProvider(provider);

  // 显示绘制范围（调试时可用）
  // viewer.entities.add({
  //   rectangle: {
  //     coordinates: rectangle,
  //     material: Cesium.Color.RED.withAlpha(0.2),
  //   },
  // });
}

/**
 * 监听分布点点击事件
 */
function onCaseClick(viewer: Cesium.Viewer, callback: (id: string) => void) {
  // 监听点击事件
  const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((event) => {
    const pick = viewer.scene.pick(event.position);
    // 检查是否存在空间数据
    if (Cesium.defined(pick) && pick.id.id.includes("case--")) {
      callback(pick.id.id);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

/**
 * 监听日期选择器时间变化
 */
async function onDateRangeChange(range: Array<any>) {
  if (range) {
    const viewer = viewerIns as Cesium.Viewer;
    viewer.entities.removeAll();
    refreshCamera();
    const start = dayjs(range[0]).format("YYYY-MM-DD");
    const end = dayjs(range[1]).format("YYYY-MM-DD");
    const { list, group } = await getCaseList(start, end);
    if (currentDrawMode.value === "point") {
      drawCasePoint(viewer, group);
    } else if (currentDrawMode.value === "heatmap") {
      drawHeatmap(viewer, group);
    }
  }
}

/**
 * 重置相机位置
 */
function refreshCamera() {
  const viewer = viewerIns as Cesium.Viewer;
  setDefaultCamera(viewer, 2);
}

/**
 * @hook
 * 球体首次完成瓦片加载时触发并自动回收该事件
 */
function onGlobeTileLoaded(viewer: Cesium.Viewer, callback: () => void) {
  const eventHelper = new Cesium.EventHelper();
  eventHelper.add(viewer.scene.globe.tileLoadProgressEvent, (event) => {
    if (event === 0) {
      eventHelper.removeAll();
      callback();
    }
  });
}

/**
 * 获取病例列表
 */
async function getCaseList(startTime: string, endTime: string) {
  const list = await caseService.getCaseList(startTime, endTime);

  // 相同经纬度的合成一组
  const group = new Map();
  list.forEach((item) => {
    const lnglatText = item.position?.location;
    if (group.has(lnglatText)) {
      group.get(lnglatText).push(item);
    } else {
      group.set(lnglatText, [item]);
    }
  });
  dataCaseGroup = group;
  return {
    list,
    group,
  };
}

/**
 * 切换绘制模式
 */
function onDrawModeChange(type: "point" | "heatmap") {
  const group = dataCaseGroup;
  if (!group) {
    return;
  }
  const viewer = viewerIns as Cesium.Viewer;
  viewer.entities.removeAll();
  if (type === "point") {
    drawCasePoint(viewer, group);
  } else if (type === "heatmap") {
    drawHeatmap(viewer, group);
  }
}

/**
 * 初始化
 */
function init() {
  const viewer = createViewer();

  onGlobeTileLoaded(viewer, () => {
    store.dispatch("loading/setAppLoading", false); // 关闭全局loading
    // ? 该定时器是为了优化体验效果
    setTimeout(() => {
      setDefaultCamera(viewer, 3, () => {
        const layer = getAMapImageryProvider();
        // ? 该定时器是为了优化体验效果
        setTimeout(async () => {
          viewer.imageryLayers.addImageryProvider(layer);
          await drawAreaPolyline(viewer, "深圳市");
          await drawAreaPolyline(viewer, "深汕特别合作区");
          const { group } = await getCaseList(yesterday, yesterday);
          drawCasePoint(viewer, group); // 默认查昨日数据
          // drawHeatmap(viewer, group); // 默认查昨日数据
          panelShow.value = true;
        }, 800);
      });
    }, 2200);
  });

  onCaseClick(viewer, (id) => {
    let lnglatText: string = id.split("--").slice(-1)[0];
    if (typeof lnglatText === "string" && lnglatText.length > 0 && dataCaseGroup) {
      for (const target of dataCaseGroup) {
        const [flag, list]: [string, Array<IPerson>] = target;
        if (flag === lnglatText) {
          let message = "";
          list.forEach((person, i) => {
            if (i > 0) {
              message += "<br><br>";
            }
            message += `<span>${person.id}</span>`;
          });
          ElMessage({
            type: "success",
            message,
            dangerouslyUseHTMLString: true,
          });
          console.log("caseList", list);
          break;
        }
      }
    }
  });
}

/**
 * 销毁
 */
function destroy() {
  viewerIns?.destroy();
  viewerIns = undefined;
}

/**
 * TODO 调试模式
 */
function testInit() {
  const viewer = createViewer();

  store.dispatch("loading/setAppLoading", false);
  setDefaultCamera(viewer, 0, async () => {
    const layer = getAMapImageryProvider();
    viewer.imageryLayers.addImageryProvider(layer);
    await drawAreaPolyline(viewer, "深圳市");
    await drawAreaPolyline(viewer, "深汕特别合作区");
    const { list, group } = await getCaseList(yesterday, yesterday);
    // drawCasePoint(viewer, group); // 默认查昨日数据
    // drawHeatmap(viewer, group); // 默认查昨日数据
    panelShow.value = true;
  });
}

onMounted(() => {
  init();
  // testInit();
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
  .heatmap {
    position: absolute;
    z-index: -1;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }
  .control-group {
    position: absolute;
    top: 40px;
    right: 0;
    display: flex;
    :deep(.ctrl) {
      margin: 0 15px 0 0;
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
    top: 10px;
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
