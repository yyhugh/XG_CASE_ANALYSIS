import { MutationTree } from "vuex";
import State from "./state";

export default <MutationTree<State>>{
  SET_COUNT,
};

/**
 * 加减器
 */
export function SET_COUNT(state: State, count: number): void {
  state.count = count;
}
