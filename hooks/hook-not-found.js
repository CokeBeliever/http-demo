const http = require("http");

/**
 * not found 处理
 * @param { http.IncomingMessage } req
 * @param { http.ServerResponse<http.IncomingMessage> & { req: http.IncomingMessage } } res
 */
module.exports = function (req, res) {
  res.statusCode = 404;
  res.setHeader("Content-Type", "text/plain");
  res.end("not found");
};
