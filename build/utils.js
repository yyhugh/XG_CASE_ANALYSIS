const path = require("path");
const glob = require("glob");

/**
 * 以根目录为起点，获取绝对路径
 * @param filename string
 * @returns string
 */
function resolve(filename = ".") {
  // filename === "/" 时路径将为磁盘根路径
  return path.resolve(__dirname, "..", filename);
}

/**
 * 获取同类型文件列表
 * @param type string 匹配类型
 * @returns Array<string>
 */
function getPeerFileList(type) {
  // 示例："public/static/dll/*.json"
  return glob.sync(resolve(type));
}

module.exports = {
  resolve,
  getPeerFileList,
};
