import { ActionTree, ActionContext } from "vuex";
import State from "./state";

export default <ActionTree<State, unknown>>{
  setAppLoading,
};

export function setAppLoading(store: ActionContext<State, void>, isShow: boolean): void {
  store.commit("SET_APP_LOADING", isShow);
}
