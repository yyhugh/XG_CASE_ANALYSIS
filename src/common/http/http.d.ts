import { IHttpRequest, IHttpResponse } from "./i-http";

declare global {
  namespace IHttp {
    interface Request extends IHttpRequest {}
    interface Response extends IHttpResponse<any> {}
  }
}
