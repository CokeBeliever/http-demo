const path = require("path");
const { STATIC_PATH } = require("../config/paths");

/**
 * 解析资源路径
 * @param { http.IncomingMessage } req
 */
exports.parseResourcePath = function (req) {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  let resourcePath = path.join(STATIC_PATH, pathname);
  // 如果资源路径的扩展名为 ''，就表示为目录，默认返回该目录下的 index.html
  return path.extname(resourcePath)
    ? resourcePath
    : path.join(resourcePath, "index.html");
};
