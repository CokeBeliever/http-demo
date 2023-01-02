const http = require("http");
const { hookNotFound } = require("./hooks/");
const { hostname, port } = require("./config/server");

const server = http.createServer(async (req, res) => {
  switch (true) {
    // 如果 url 以 /api 开头，表示请求应用程序接口
    case /^\/api/.test(req.url):
      // todo ...
      break;
    // 否则，表示请求静态资源
    default:
      break;
  }

  // not found
  await hookNotFound(req, res);
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
