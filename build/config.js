const { resolve } = require("./utils");

/**
 * 使用者配置
 */
const config = {
  // 生产环境
  build: {
    bundleAnalyzer: false, // 打包结果可视化分析
  },
  // 路径别名
  alias: {
    // 示例："src": path.resolve(__dirname, "../src")
    "@": resolve("src"),
    assets: resolve("src/assets"),
  },
  // 开发服务
  devServer: {
    // 示例：port: 8081
    port: 8081,
  },
};

module.exports = config;
