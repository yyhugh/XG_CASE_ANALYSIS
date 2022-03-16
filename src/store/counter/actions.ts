import { ActionTree, ActionContext } from "vuex";
import State from "./state";

export default <ActionTree<State, unknown>>{
  setCount,
};

/**
 * 加减器
 */
export function setCount(store: ActionContext<State, void>, type: "add" | "minus"): void {
  let count = store.state.count;
  if (type === "add") {
    count++;
  } else if (type === "minus") {
    count--;
  }
  store.commit("SET_COUNT", count);
}
