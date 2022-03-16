/**
 * http请求响应状态码
 */
enum HttpResponseCode {
  /**
   * 成功
   */
  success = 200,

  /**
   * 成功但是无数据
   */
  nodata = 204,

  /**
   * 参数无效
   */
  invalidParameter = 400,

  /**
   * 会话丢失
   */
  sessionLost = 401,

  /**
   * 凭证无效
   */
  invalidCredential = 402,

  /**
   * 未授权
   */
  unauthorized = 403,

  /**
   * 签名无效
   */
  invalidSign = 405,

  /**
   * 服务器错误
   */
  serverError = 500,

  /**
   * 网络错误
   */
  networkError = 505,
}

export default HttpResponseCode;
