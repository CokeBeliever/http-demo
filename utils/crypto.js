const crypto = require("crypto");

/**
 * 生成 MD5，以 Base64 编码
 * @param { crypto.BinaryLike } data
 */
exports.generateMD5Base64 = function (data) {
  return crypto.createHash("md5").update(data).digest("base64");
};
