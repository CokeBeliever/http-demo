const http = require("http");
const fs = require("fs");
const { parseResourcePath } = require("../../utils/req");
const cacheExamples = require("./cache-examples");

/**
 * 静态资源处理
 * @param { http.IncomingMessage } req
 * @param { http.ServerResponse } res
 */
module.exports = async function (req, res) {
  const resourcePath = parseResourcePath(req);

  try {
    // 判断资源是否可读，如果不可读会抛出错误
    fs.accessSync(resourcePath, fs.constants.R_OK);
    console.log(`请求静态资源：${resourcePath}`);

    // 缓存示例
    await cacheExamples.useCacheControlMaxAgeMustRevalidate(
      req,
      res,
      resourcePath
    );
  } catch (e) {}
};
