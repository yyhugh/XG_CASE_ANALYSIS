import Axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import qs from "qs";
import { IHttpRequest, IHttpResponse } from "./i-http";
import { ExtendUtil } from "@/common/utils";

/**
 * http请求服务基类
 */
export default abstract class HttpClientBase {
  /**
   * 解析响应内容(可视为响应拦截器)
   */
  protected abstract resolveResponse: (axiosResponse: AxiosResponse, axiosRequestConfig: AxiosRequestConfig) => IHttpResponse<unknown>;

  /**
   * 请求配置
   */
  public abstract options: IHttpRequest;

  /**
   * GET请求
   */
  public async get(request: IHttpRequest): Promise<IHttpResponse<unknown>> {
    const config = this.getAxiosRequestConfig("get", request);
    const result = await this.send(config);
    return result;
  }

  /**
   * POST请求
   */
  public async post(request: IHttpRequest): Promise<IHttpResponse<unknown>> {
    const config = this.getAxiosRequestConfig("post", request);
    const result = await this.send(config);
    return result;
  }

  /**
   * PUT请求
   */
  public async put(request: IHttpRequest): Promise<IHttpResponse<unknown>> {
    const config = this.getAxiosRequestConfig("put", request);
    const result = await this.send(config);
    return result;
  }

  /**
   * DELETE请求
   */
  public async delete(request: IHttpRequest): Promise<IHttpResponse<unknown>> {
    const config = this.getAxiosRequestConfig("delete", request);
    const result = await this.send(config);
    return result;
  }

  /**
   * PATCH请求
   */
  public async patch(request: IHttpRequest): Promise<IHttpResponse<unknown>> {
    const config = this.getAxiosRequestConfig("patch", request);
    const result = await this.send(config);
    return result;
  }

  /**
   * 上传文件请求
   */
  public async upload(request: IHttpRequest): Promise<IHttpResponse<unknown>> {
    // 实际也是post请求
    request.serializeType = "form-data";
    const config = this.getAxiosRequestConfig("post", request);
    const result = await this.send(config);
    return result;
  }

  /**
   * 根据请求方式生成axios专用请求配置
   */
  private getAxiosRequestConfig(method: "get" | "post" | "put" | "delete" | "patch", request: IHttpRequest): AxiosRequestConfig {
    // ? 配置文档 AxiosRequestConfig http://axios-js.com/zh-cn/docs/index.html#%E8%AF%B7%E6%B1%82%E9%85%8D%E7%BD%AE
    const config: AxiosRequestConfig = {
      url: request.url,
      method,
      headers: request.headers,
      responseType: request.responseType,
      params: request.params,
      withCredentials: request.withCredentials, // 非同源请求是否携带凭证
    };

    if (!config.headers) {
      config.headers = {};
    }

    // 根据请求方式处理请求参数
    if (method === "get") {
      // 进行合并
      if (request.data) {
        config.params = {
          ...request.data,
          ...config.params,
        };
      }

      // ? /user/{id}
      if (request.urlPath) {
        config.url = ExtendUtil.stringUrlPath(request.url as string, request.urlPath);
      }
    } else {
      switch (request.serializeType) {
        case "form": {
          config.headers["Content-Type"] = "application/x-www-form-urlencoded";
          config.data = qs.stringify(request.data, { arrayFormat: "indices" });
          break;
        }
        case "form-data": {
          config.headers["Content-Type"] = "multipart/form-data";
          // 参数合并
          const data = {
            ...request.data,
            ...request.files,
          };
          // 参数转成表单数据
          const formData = new FormData();
          for (const k in data) {
            if (data[k]) {
              formData.append(k, data[k]);
            }
          }
          config.data = formData;
          break;
        }
        case "application/x-www-form-urlencoded": {
          config.headers["Content-Type"] = "application/x-www-form-urlencoded";
          config.data = qs.stringify(request.data);
          break;
        }
        default: {
          config.headers["Content-Type"] = "application/json";
          config.data = request.data;
          break;
        }
      }
    }

    // 设置重试次数
    if (typeof request.retryCount !== "number") {
      request.retryCount = this.options.retryCount;
    }

    // 设置重试时间间隔
    if (typeof request.retryInterval !== "number") {
      request.retryInterval = this.options.retryInterval;
    }

    // 设置上传进度回调函数
    if (!request.onUploadProgress) {
      request.onUploadProgress = this.options.onUploadProgress;
    }

    // 设置下载进度回调函数
    if (!request.onDownloadProgress) {
      request.onDownloadProgress = this.options.onDownloadProgress;
    }

    return config;
  }

  /**
   * 发送请求
   */
  private async send(axiosRequestConfig: AxiosRequestConfig): Promise<IHttpResponse<unknown>> {
    return new Promise((resolve, reject) => {
      Axios(axiosRequestConfig)
        .then((axiosResponse: AxiosResponse) => {
          const content = this.resolveResponse(axiosResponse, axiosRequestConfig);
          resolve(content);
        })
        .catch((error) => {
          this.resolveResponse(error.response, axiosRequestConfig);
          reject(error.response);
        });
    });
  }
}
