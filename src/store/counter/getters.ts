import { GetterTree } from "vuex";
import State from "./state";

export default <GetterTree<State, void>>{
  getCount,
};

/**
 * 获取数值
 */
export function getCount(state: State): number {
  return state.count;
}
