import { AxiosRequestConfig, AxiosResponse } from "axios";
import HttpBase from "../http-base";
import { IHttpRequest, IHttpResponse } from "../i-http";
import HttpResponseCode from "./http-response-code";

/**
 * http请求服务
 */
export default class HttpClient extends HttpBase {
  /**
   * 单实例
   */
  private static _instance: HttpClient;

  /**
   * 访问单实例
   */
  public static get instance(): HttpClient {
    if (!this._instance) {
      this._instance = new HttpClient();
    }
    return this._instance;
  }

  /**
   * 请求配置
   */
  public options: IHttpRequest = {
    serializeType: "json",
    withCredentials: false,
    timeout: 1000 * 20,
    retryCount: 0,
    retryInterval: 1000 * 10,
  };

  /**
   * 解析响应内容
   */
  protected resolveResponse = (axiosResponse: AxiosResponse, axiosRequestConfig: AxiosRequestConfig): IHttpResponse<HttpResponseCode> => {
    // 响应内容解析
    const { status: code, data: content, headers, request } = axiosResponse;

    // TODO 重试

    switch (code) {
      case HttpResponseCode.invalidParameter:
      case HttpResponseCode.sessionLost: {
        // TODO 请求异常提示 axiosResponse
        break;
      }
      default: {
        break;
      }
    }

    const response = {
      code,
      content,
      headers,
      request,
    };
    return response;
  };
}
