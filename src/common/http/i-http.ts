/**
 * http请求接口声明
 */
export interface IHttpRequest {
  /**
   * 请求头
   */
  headers?: { [propName: string]: any };

  /**
   * 请求地址
   */
  url?: string;

  /**
   * 请求地址中有占位符需要替换
   */
  urlPath?: { [propName: string]: any };

  /**
   * 请求数据
   */
  data?: { [propName: string]: any };

  /**
   * url query 参数
   */
  params?: { [propName: string]: any };

  /**
   * 上传文件列表
   */
  files?: { [propName: string]: any };

  /**
   * 是否需要进行跨域处理
   */
  withCredentials?: boolean;

  /**
   * 参数序列化方式
   */
  serializeType?: "form" | "form-data" | "json" | "application/x-www-form-urlencoded";

  /**
   * 服务器响应数据类型
   */
  responseType?: "arraybuffer" | "blob" | "document" | "json" | "text" | "stream";

  /**
   * 请求超时时间
   */
  timeout?: number;

  /**
   * 请求失败后的重试次数
   */
  retryCount?: number;

  /**
   * 请求失败后的重试时间间隔，单位(ms)
   */
  retryInterval?: number;

  /**
   * 全局拦截器(不推荐使用。建议封装局部拦截器)
   */
  interceptors?: {
    /**
     * 请求拦截器
     */
    request?: () => void;

    /**
     * 响应拦截器
     */
    response?: () => void;
  };

  /**
   * 文件上传时
   */
  onUploadProgress?: (event: ProgressEvent) => void;

  /**
   * 文件下载时
   */
  onDownloadProgress?: (event: ProgressEvent) => void;

  /**
   * 请求完成时回调
   */
  complete?: () => void;
}

/**
 * http响应接口声明
 */
export interface IHttpResponse<Code> {
  /**
   * 响应码
   */
  code: Code;

  /**
   * 响应内容
   */
  content: any;

  /**
   * 扩展内容
   */
  extras?: any;

  /**
   * 响应头
   */
  headers?: any;

  /**
   * 本次请求参数
   */
  request?: IHttpRequest;
}

export interface IHttp {
  /**
   * 请求配置
   */
  options: IHttpRequest;

  /**
   * GET请求
   */
  get(request: IHttpRequest): Promise<IHttpResponse<any>>;

  /**
   * POST请求
   */
  post(request: IHttpRequest): Promise<IHttpResponse<any>>;

  /**
   * PUT请求
   */
  put(request: IHttpRequest): Promise<IHttpResponse<any>>;

  /**
   * DELETE请求
   */
  delete(request: IHttpRequest): Promise<IHttpResponse<any>>;

  /**
   * PATCH请求
   */
  patch(request: IHttpRequest): Promise<IHttpResponse<any>>;

  /**
   * 上传文件请求
   */
  upload(request: IHttpRequest): Promise<IHttpResponse<any>>;
}
