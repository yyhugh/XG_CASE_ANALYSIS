import { Router } from "vue-router";
import { IMainCredential } from "@/models";

/**
 * 应用程序上下文
 */
export class ApplicationContext {
  /**
   * 单实例
   */
  private static _instance: ApplicationContext;

  /**
   * 访问单实例
   */
  public static get current() {
    if (!this._instance) {
      this._instance = new ApplicationContext();
    }
    return this._instance;
  }

  /**
   * 页面路由
   */
  public router!: Router;

  /**
   * 主凭证
   */
  public mainCredential!: IMainCredential;

  /**
   * Cesium AccessToken
   */
  public cesiumIonAccessToken =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhMzA0NDY3OS1iMDFiLTRmOWEtYjE3Ni05ZTY3MTEyODg0M2IiLCJpZCI6ODQyNzYsImlhdCI6MTY0NjIwNDAwNX0.wo3gAte3g3qzJTb9PSuF391rlKnM6sWJlzK1Azw8CN4";

  /**
   * ArcGIS MapServer
   */
  public arcGISMapServer = "https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer";
}
