/**
 * 常量定义
 */

export const ADDITIONAL_RANDOM_NUMBER = 3;
export const DEFAULT_KEYWORD = "obfiowerehiring";

export const ON_DEMAND_FILE_URL =
  "https://abs.twimg.com/responsive-web/client-web/ondemand.s.{filename}a.js";

// 正则表达式
export const ON_DEMAND_FILE_REGEX =
  /['|"]{1}ondemand\.s['|"]{1}:\s*['|"]{1}([\w]*)['|"]{1}/gm;
export const INDICES_REGEX = /(\(\w{1}\[(\d{1,2})\],\s*16\))+/gm;
export const MIGRATION_REDIRECTION_REGEX =
  /(http(?:s)?:\/\/(?:www\.)?(twitter|x){1}\.com(\/x)?\/migrate([\/\?])?tok=[a-zA-Z0-9%\-_]+)+/g;
