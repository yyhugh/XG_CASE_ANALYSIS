/**
 * 主凭证
 */
export interface IMainCredential {
  /**
   * 凭证类型
   */
  tokenType: string;

  /**
   * 凭证
   */
  accessToken: string;

  /**
   * 刷新凭证
   */
  refreshToken: string;

  /**
   * 凭证的过期时间 单位(秒)
   */
  expires: number;

  /**
   * 是否记住密码
   */
  rememberPassword?: boolean;
}
