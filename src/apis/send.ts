import { ApplicationContext } from "@/application";
import { MainHttpClient } from "@/common/http";

type IMethod = "get" | "post" | "put" | "delete" | "patch" | "upload";

/**
 * 请求发给主服务
 */
export function reqMainService(url: string, options: IHttp.Request = {}, method: IMethod = "post"): Promise<IHttp.Response> {
  // 获取上下文
  const context = ApplicationContext.current;

  if (!options.headers) {
    options.headers = {};
  }

  // ? 请求头是否携带凭证
  if (context.mainCredential) {
    const { accessToken } = context.mainCredential;
    options.headers["Authorization"] = "Bearer " + accessToken;
  }

  return MainHttpClient.instance[method]({
    url,
    ...options,
  });
}
