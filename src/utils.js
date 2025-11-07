/**
 * 工具函数
 */

import * as cheerio from "cheerio";
import axios from "axios";
import { HttpsProxyAgent } from "https-proxy-agent";
import {
  MIGRATION_REDIRECTION_REGEX,
  ON_DEMAND_FILE_REGEX,
  ON_DEMAND_FILE_URL,
} from "./constants.js";

/**
 * 自定义 Math.round 实现
 */
export class MathUtils {
  static round(num) {
    const x = Math.floor(num);
    if (num - x >= 0.5) {
      return Math.sign(num) * Math.ceil(Math.abs(num));
    }
    return Math.sign(num) * x;
  }
}

/**
 * 生成默认请求头
 */
export function generateHeaders() {
  return {
    Authority: "x.com",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    Referer: "https://x.com",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    "X-Twitter-Active-User": "yes",
    "X-Twitter-Client-Language": "en",
  };
}

/**
 * 创建配置好的 HTTP 客户端实例
 * @param {Object} options - 配置选项
 * @param {string} options.proxy - 代理地址，例如 "http://127.0.0.1:7890"
 * @param {number} options.timeout - 超时时间（毫秒），默认 30000
 * @returns {Object} axios 实例
 */
export function createSession(options = {}) {
  const { proxy = null, timeout = 30000 } = options;

  const config = {
    headers: generateHeaders(),
    timeout,
    maxRedirects: 5,
    validateStatus: function (status) {
      return status >= 200 && status < 400; // 允许重定向
    },
  };

  // 如果提供了代理配置
  if (proxy) {
    // 使用 https-proxy-agent 处理 HTTPS 连接
    const httpsAgent = new HttpsProxyAgent(proxy);
    config.httpsAgent = httpsAgent;
    config.proxy = false; // 禁用 axios 默认代理，使用 agent
  }

  return axios.create(config);
}

/**
 * 验证响应对象
 */
export function validateResponse(response) {
  if (typeof response !== "object" || !response) {
    throw new TypeError(
      `The response object must be a valid object, not ${typeof response}`
    );
  }
}

/**
 * 获取迁移 URL
 */
export function getMigrationUrl($) {
  const migrationMeta = $("meta[http-equiv='refresh']");
  const content = migrationMeta.attr("content") || "";
  const match = content.match(MIGRATION_REDIRECTION_REGEX);
  return match ? match[0] : null;
}

/**
 * 获取迁移表单
 */
export function getMigrationForm($) {
  const migrationForm =
    $("form[name='f']").first() ||
    $("form[action='https://x.com/x/migrate']").first();

  if (!migrationForm || migrationForm.length === 0) {
    return null;
  }

  const url = migrationForm.attr("action") || "https://x.com/x/migrate";
  const method = migrationForm.attr("method") || "POST";
  const requestPayload = {};

  migrationForm.find("input").each((_, input) => {
    const $input = $(input);
    const name = $input.attr("name");
    const value = $input.attr("value");
    if (name) {
      requestPayload[name] = value;
    }
  });

  return { method, url, data: requestPayload };
}

/**
 * 获取 ondemand 文件 URL
 */
export function getOndemandFileUrl($) {
  const html = $.html();
  ON_DEMAND_FILE_REGEX.lastIndex = 0; // 重置正则表达式
  const match = ON_DEMAND_FILE_REGEX.exec(html);

  if (match && match[1]) {
    const filename = match[1];
    return ON_DEMAND_FILE_URL.replace("{filename}", filename);
  }
  return null;
}

/**
 * 处理 X 迁移（同步版本）
 */
export async function handleXMigration(axiosInstance) {
  let response = await axiosInstance.get("https://x.com");
  let $ = cheerio.load(response.data);

  const migrationUrl = getMigrationUrl($);
  if (migrationUrl) {
    response = await axiosInstance.get(migrationUrl);
    $ = cheerio.load(response.data);
  }

  const migrationForm = getMigrationForm($);
  if (migrationForm) {
    response = await axiosInstance.request({
      method: migrationForm.method,
      url: migrationForm.url,
      data: migrationForm.data,
    });
    $ = cheerio.load(response.data);
  }

  return $;
}

/**
 * 将浮点数转换为十六进制字符串
 */
export function floatToHex(x) {
  const result = [];
  let quotient = Math.floor(x);
  let fraction = x - quotient;

  while (quotient > 0) {
    const newQuotient = Math.floor(quotient / 16);
    const remainder = quotient - newQuotient * 16;

    if (remainder > 9) {
      result.unshift(String.fromCharCode(remainder + 55));
    } else {
      result.unshift(remainder.toString());
    }

    quotient = newQuotient;
  }

  if (fraction === 0) {
    return result.join("");
  }

  result.push(".");

  let iterations = 0;
  while (fraction > 0 && iterations < 10) {
    fraction *= 16;
    const integer = Math.floor(fraction);
    fraction -= integer;

    if (integer > 9) {
      result.push(String.fromCharCode(integer + 55));
    } else {
      result.push(integer.toString());
    }
    iterations++;
  }

  return result.join("");
}

/**
 * 判断是否为奇数
 */
export function isOdd(num) {
  return num % 2 ? -1.0 : 0.0;
}

/**
 * Base64 编码
 */
export function base64Encode(data) {
  if (typeof data === "string") {
    return Buffer.from(data, "utf-8").toString("base64");
  }
  if (Array.isArray(data)) {
    return Buffer.from(data).toString("base64");
  }
  if (Buffer.isBuffer(data)) {
    return data.toString("base64");
  }
  return Buffer.from(data).toString("base64");
}

/**
 * Base64 解码
 */
export function base64Decode(input) {
  try {
    return Array.from(Buffer.from(input, "base64"));
  } catch (e) {
    return Array.from(Buffer.from(input, "utf-8"));
  }
}
