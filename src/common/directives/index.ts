import { Directive } from "vue";
import previewer from "./previewer";

const directives: { [propName: string]: Directive } = {
  previewer,
};

export default directives;
