import { GetterTree } from "vuex";
import State from "./state";

export default <GetterTree<State, void>>{
  getAppLoading,
};

export function getAppLoading(state: State) {
  return state.appLoading;
}
