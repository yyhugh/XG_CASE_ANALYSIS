import { MutationTree } from "vuex";
import State from "./state";

export default <MutationTree<State>>{
  SET_APP_LOADING,
};

export function SET_APP_LOADING(state: State, isShow: boolean): void {
  state.appLoading = isShow;
}
