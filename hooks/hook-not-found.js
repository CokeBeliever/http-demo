const http = require("http");
const path = require("path");
const fs = require("fs");
const mime = require("mime");
const { STATIC_PATH } = require("../config/paths");

/**
 * not found 处理
 * @param { http.IncomingMessage } req
 * @param { http.ServerResponse } res
 */
module.exports = async function (req, res) {
  // 如果已响应，就直接 return
  if (res.writableEnded) return;
  const resourcePath = path.resolve(STATIC_PATH, "404.html");

  res.statusCode = 404;
  res.setHeader("Content-Type", mime.getType(resourcePath));
  res.end(fs.readFileSync(resourcePath));
};
