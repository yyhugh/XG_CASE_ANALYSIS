import apis from "@/apis";

export default {
  getVerifyImg,
};

/**
 * 登录页请求图形验证码
 */
async function getVerifyImg() {
  await apis.getVerifyImg();
}
