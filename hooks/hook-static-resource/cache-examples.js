const http = require("http");
const fs = require("fs");
const mime = require("mime");
const { generateMD5Base64 } = require("../../utils/crypto");

/**
 * 缓存方案: 使用 Expires 响应首部
 * 使用效果: Expires 过期之后，客户端会请求服务器再验证 (不推荐使用，可以使用 HTTP/1.1 Cache-Control: max-age 实现相同效果)
 * @param { http.IncomingMessage } req
 * @param { http.ServerResponse } res
 * @param { string } resourcePath
 */
exports.useExpires = async function (req, res, resourcePath) {
  res.setHeader("Expires", new Date(Date.now() + 10 * 1000).toUTCString());
  res.setHeader("Content-Type", mime.getType(resourcePath));
  res.end(fs.readFileSync(resourcePath));
};

/**
 * 缓存方案: 使用 Cache-Control: no-store 响应首部
 * 使用效果：禁止缓存，客户端每次都会请求服务器
 * @param { http.IncomingMessage } req
 * @param { http.ServerResponse } res
 * @param { string } resourcePath
 */
exports.useCacheControlNoStore = async function (req, res, resourcePath) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", mime.getType(resourcePath));
  res.end(fs.readFileSync(resourcePath));
};

/**
 * 缓存方案: 使用 Cache-Control: no-cache 响应首部
 * 使用效果：客户端会缓存，但每次都需要请求服务器再验证 (一般会搭配条件请求首部进行再验证)
 * @param { http.IncomingMessage } req
 * @param { http.ServerResponse } res
 * @param { string } resourcePath
 */
exports.useCacheControlNoCache = async function (req, res, resourcePath) {
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Content-Type", mime.getType(resourcePath));
  res.end(fs.readFileSync(resourcePath));
};

/**
 * 缓存方案: 使用 Cache-Control: max-age 响应首部
 * 使用效果: max-age 过期之后，客户端会请求服务器再验证 (一般会搭配条件请求首部进行再验证)
 * @param { http.IncomingMessage } req
 * @param { http.ServerResponse } res
 * @param { string } resourcePath
 */
exports.useCacheControlMaxAge = async function (req, res, resourcePath) {
  res.setHeader("Cache-Control", "max-age=10");
  res.setHeader("Content-Type", mime.getType(resourcePath));
  res.end(fs.readFileSync(resourcePath));
};

/**
 * 缓存方案: 使用 HTTP/1.0 Expires 和 HTTP/1.1 Cache-Control: max-age 响应首部
 * 使用效果: 在支持 HTTP/1.1 的客户端中，Cache-Control 优先级更高
 * @param { http.IncomingMessage } req
 * @param { http.ServerResponse } res
 * @param { string } resourcePath
 */
exports.useExpiresAndCacheControlMaxAge = async function (
  req,
  res,
  resourcePath
) {
  res.setHeader("Expires", new Date(Date.now() + 5 * 1000).toUTCString());
  res.setHeader("Cache-Control", "max-age=60");
  res.setHeader("Content-Type", mime.getType(resourcePath));
  res.end(fs.readFileSync(resourcePath));
};

/**
 * 缓存方案: 使用 Cache-Control: max-age, must-revalidate 响应首部
 * 使用效果: max-age 过期之后，客户端会请求服务器再验证 (一般会搭配条件请求首部进行再验证)
 * @param { http.IncomingMessage } req
 * @param { http.ServerResponse } res
 * @param { string } resourcePath
 */
exports.useCacheControlMaxAgeMustRevalidate = async function (
  req,
  res,
  resourcePath
) {
  res.setHeader("Cache-Control", "max-age=10, must-revalidate");
  res.setHeader("Content-Type", mime.getType(resourcePath));
  res.end(fs.readFileSync(resourcePath));
};

/**
 * 缓存方案: 使用 Cache-Control: max-age 和 Last-Modified 响应首部
 * 使用效果: max-age 过期之后，客户端会请求服务器再验证，通过 If-Modified-Since 条件请求首部进行再验证
 * @param { http.IncomingMessage } req
 * @param { http.ServerResponse } res
 * @param { string } resourcePath
 */
exports.useCacheControlMaxAgeAndLastModified = async function (
  req,
  res,
  resourcePath
) {
  // 客户端缓存资源的最后修改时间
  const ifModifiedSince = req.headers["if-modified-since"];
  // 服务器资源的最后修改时间
  const lastModified = fs.statSync(resourcePath).mtime.toUTCString();
  const isFirstRequestOrModifiedSince =
    ifModifiedSince === undefined || ifModifiedSince !== lastModified;

  if (isFirstRequestOrModifiedSince) {
    res.statusCode = 200;
    // 10 秒过期之后，客户端会请求服务器再验证
    res.setHeader("Cache-Control", "max-age=10");
    res.setHeader("Last-Modified", lastModified);
    res.setHeader("Content-Type", mime.getType(resourcePath));
  } else {
    res.statusCode = 304;
  }

  isFirstRequestOrModifiedSince
    ? res.end(fs.readFileSync(resourcePath))
    : res.end();
};

/**
 * 缓存方案: 使用 Cache-Control: no-cache 和 Last-Modified 响应首部
 * 使用效果：客户端会缓存，但每次都需要请求服务器再验证，通过 If-Modified-Since 条件请求首部进行再验证
 * @param { http.IncomingMessage } req
 * @param { http.ServerResponse } res
 * @param { string } resourcePath
 */
exports.useCacheControlNoCacheAndLastModified = async function (
  req,
  res,
  resourcePath
) {
  // 客户端缓存资源的最后修改时间
  const ifModifiedSince = req.headers["if-modified-since"];
  // 服务器资源的最后修改时间
  const lastModified = fs.statSync(resourcePath).mtime.toUTCString();
  const isFirstRequestOrModifiedSince =
    ifModifiedSince === undefined || ifModifiedSince !== lastModified;

  if (isFirstRequestOrModifiedSince) {
    res.statusCode = 200;
    // 客户端会缓存，但每次都需要请求服务器再验证
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Last-Modified", lastModified);
    res.setHeader("Content-Type", mime.getType(resourcePath));
  } else {
    res.statusCode = 304;
  }

  isFirstRequestOrModifiedSince
    ? res.end(fs.readFileSync(resourcePath))
    : res.end();
};

/**
 * 缓存方案: 使用 Cache-Control: max-age 和 ETag 响应首部
 * 使用效果: max-age 过期之后，客户端会请求服务器再验证，通过 If-None-Match 条件请求首部进行再验证
 * @param { http.IncomingMessage } req
 * @param { http.ServerResponse } res
 * @param { string } resourcePath
 */
exports.useCacheControlMaxAgeAndETag = async function (req, res, resourcePath) {
  // 客户端缓存资源的实体标签
  const ifNoneMatch = req.headers["if-none-match"];
  const content = fs.readFileSync(resourcePath);
  // 服务器资源的实体标签
  const eTag = generateMD5Base64(content);
  const isFirstRequestOrNoneMatch =
    ifNoneMatch === undefined || ifNoneMatch !== eTag;

  if (isFirstRequestOrNoneMatch) {
    res.statusCode = 200;
    // 10 秒过期之后，客户端会请求服务器再验证
    res.setHeader("Cache-Control", "max-age=10");
    res.setHeader("ETag", eTag);
    res.setHeader("Content-Type", mime.getType(resourcePath));
  } else {
    res.statusCode = 304;
  }

  isFirstRequestOrNoneMatch ? res.end(content) : res.end();
};

/**
 * 缓存方案: 使用 Cache-Control: no-cache 和 ETag 响应首部
 * 使用效果：客户端会缓存，但每次都需要请求服务器再验证，通过 If-None-Match 条件请求首部进行再验证
 * @param { http.IncomingMessage } req
 * @param { http.ServerResponse } res
 * @param { string } resourcePath
 */
exports.useCacheControlNoCacheAndETag = async function (
  req,
  res,
  resourcePath
) {
  // 客户端缓存资源的实体标签
  const ifNoneMatch = req.headers["if-none-match"];
  const content = fs.readFileSync(resourcePath);
  // 服务器资源的实体标签
  const eTag = generateMD5Base64(content);
  const isFirstRequestOrNoneMatch =
    ifNoneMatch === undefined || ifNoneMatch !== eTag;

  if (isFirstRequestOrNoneMatch) {
    res.statusCode = 200;
    // 每次都会请求服务器，进行再验证
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("ETag", eTag);
    res.setHeader("Content-Type", mime.getType(resourcePath));
  } else {
    res.statusCode = 304;
  }

  isFirstRequestOrNoneMatch ? res.end(content) : res.end();
};

/**
 * 缓存方案: 使用 Cache-Control: max-age 和 Last-Modified 和 ETag 响应首部
 * 使用效果: max-age 过期之后，客户端会请求服务器再验证，通过 If-Modified-Since 和 If-None-Match 条件请求首部进行再验证
 * @param { http.IncomingMessage } req
 * @param { http.ServerResponse } res
 * @param { string } resourcePath
 */
exports.useCacheControlMaxAgeAndLastModifiedAndETag = async function (
  req,
  res,
  resourcePath
) {
  // 客户端缓存资源的最后修改时间
  const ifModifiedSince = req.headers["if-modified-since"];
  // 服务器资源的最后修改时间
  const lastModified = fs.statSync(resourcePath).mtime.toUTCString();

  // 客户端缓存资源的实体标签
  const ifNoneMatch = req.headers["if-none-match"];
  const content = fs.readFileSync(resourcePath);
  // 服务器资源的实体标签
  const eTag = generateMD5Base64(content);

  // 默认值第一次请求资源
  let isFirstRequestOrModifiedSinceOrNoneMatch = true;
  // 如果携带条件请求首部 If-None-Match，就使用 If-None-Match 再验证
  if (ifNoneMatch !== undefined) {
    isFirstRequestOrModifiedSinceOrNoneMatch = ifNoneMatch !== eTag;
    // 否则，如果携带条件请求首部 If-Modified-Since，就使用 If-Modified-Since 再验证
  } else if (ifModifiedSince !== undefined) {
    isFirstRequestOrModifiedSinceOrNoneMatch = ifModifiedSince !== lastModified;
  }

  if (isFirstRequestOrModifiedSinceOrNoneMatch) {
    res.statusCode = 200;
    // 10 秒过期之后，客户端会请求服务器再验证
    res.setHeader("Cache-Control", "max-age=10");
    res.setHeader("Last-Modified", lastModified);
    res.setHeader("ETag", eTag);
    res.setHeader("Content-Type", mime.getType(resourcePath));
  } else {
    res.statusCode = 304;
  }

  isFirstRequestOrModifiedSinceOrNoneMatch ? res.end(content) : res.end();
};

/**
 * 缓存方案: 使用 Cache-Control: no-cache 和 Last-Modified 和 ETag 响应首部
 * 使用效果：客户端会缓存，但每次都需要请求服务器再验证，通过 If-Modified-Since 和 If-None-Match 条件请求首部进行再验证
 * @param { http.IncomingMessage } req
 * @param { http.ServerResponse } res
 * @param { string } resourcePath
 */
exports.useCacheControlNoCacheAndLastModifiedAndETag = async function (
  req,
  res,
  resourcePath
) {
  // 客户端缓存资源的最后修改时间
  const ifModifiedSince = req.headers["if-modified-since"];
  // 服务器资源的最后修改时间
  const lastModified = fs.statSync(resourcePath).mtime.toUTCString();

  // 客户端缓存资源的实体标签
  const ifNoneMatch = req.headers["if-none-match"];
  const content = fs.readFileSync(resourcePath);
  // 服务器资源的实体标签
  const eTag = generateMD5Base64(content);

  // 默认值第一次请求资源
  let isFirstRequestOrModifiedSinceOrNoneMatch = true;
  // 如果携带条件请求首部 If-None-Match，就使用 If-None-Match 再验证
  if (ifNoneMatch !== undefined) {
    isFirstRequestOrModifiedSinceOrNoneMatch = ifNoneMatch !== eTag;
    // 否则，如果携带条件请求首部 If-Modified-Since，就使用 If-Modified-Since 再验证
  } else if (ifModifiedSince !== undefined) {
    isFirstRequestOrModifiedSinceOrNoneMatch = ifModifiedSince !== lastModified;
  }

  if (isFirstRequestOrModifiedSinceOrNoneMatch) {
    res.statusCode = 200;
    // 每次都会请求服务器，进行再验证
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Last-Modified", lastModified);
    res.setHeader("ETag", eTag);
    res.setHeader("Content-Type", mime.getType(resourcePath));
  } else {
    res.statusCode = 304;
  }

  isFirstRequestOrModifiedSinceOrNoneMatch ? res.end(content) : res.end();
};
