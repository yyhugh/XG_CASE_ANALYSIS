import { reqMainService } from "./send";

export default {
  getVerifyImg: (options?: IHttp.Request) => reqMainService("/free/getVerifyImg", options, "get"), // 登录页请求图形验证码
};
