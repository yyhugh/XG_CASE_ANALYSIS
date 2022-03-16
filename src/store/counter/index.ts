import { Module } from "vuex";
import State from "./state";
import getters from "./getters";
import actions from "./actions";
import mutations from "./mutations";

export default class Counter implements Module<State, void> {
  public namespaced = false;
  public state: State;
  public mutations = mutations;
  public getters = getters;
  public actions = actions;
  public constructor() {
    this.namespaced = true;
    this.state = new State();
  }
}
