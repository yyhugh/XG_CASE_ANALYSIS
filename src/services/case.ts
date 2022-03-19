import dayjs from "dayjs";
import { IPerson } from "@/models";

export default {
  getCaseList,
};

/**
 * 根据时间获取病例列表
 */
async function getCaseList(startTime?: string, endTime?: string) {
  // TODO
  // const time = dayjs().subtract(2, "day").format("YYYY-MM-DD");
  // startTime = time;
  // endTime = time;

  const timeline: Array<string> = [];
  let diff = dayjs(endTime).diff(dayjs(startTime), "days");
  while (diff >= 0) {
    const date = dayjs(endTime).subtract(diff, "day").format("YYYY-MM-DD");
    timeline.push(date);
    diff--;
  }

  // 获取数据
  let list: Array<IPerson> = [];
  timeline.forEach((date) => {
    try {
      const data = require(`./data/json/shenzhen/${date}.json`);
      list.push(data);
    } catch (err) {
      console.warn(`暂无【${date}】的数据`);
    }
  });
  list = list.flat();
  return list;
}
