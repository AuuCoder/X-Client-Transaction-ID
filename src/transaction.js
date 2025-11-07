/**
 * 客户端交易 ID 生成器
 */

import * as cheerio from "cheerio";
import crypto from "crypto";
import { Cubic } from "./cubic-curve.js";
import { interpolate } from "./interpolate.js";
import { convertRotationToMatrix } from "./rotation.js";
import {
  MathUtils,
  floatToHex,
  isOdd,
  base64Encode,
  base64Decode,
} from "./utils.js";
import {
  INDICES_REGEX,
  ADDITIONAL_RANDOM_NUMBER,
  DEFAULT_KEYWORD,
} from "./constants.js";

export class ClientTransaction {
  constructor(
    homePageResponse,
    ondemandFileResponse,
    randomKeyword = null,
    randomNumber = null
  ) {
    // 如果传入的是 cheerio 对象，使用它；否则加载 HTML
    this.$ =
      typeof homePageResponse === "string"
        ? cheerio.load(homePageResponse)
        : homePageResponse;

    // 处理 ondemand 文件响应
    if (typeof ondemandFileResponse !== "string") {
      throw new TypeError("Invalid ondemand file response");
    }

    this.homePageResponse = this.$;
    this.ondemandFileResponse = ondemandFileResponse;
    this.randomKeyword = randomKeyword || DEFAULT_KEYWORD;
    this.randomNumber = randomNumber || ADDITIONAL_RANDOM_NUMBER;

    // 获取索引
    const indices = this.getIndices(this.ondemandFileResponse);
    this.rowIndex = indices.rowIndex;
    this.keyBytesIndices = indices.keyBytesIndices;

    // 获取密钥和动画密钥
    this.key = this.getKey(this.$);
    this.keyBytes = this.getKeyBytes(this.key);
    this.animationKey = this.getAnimationKey(this.keyBytes, this.$);
  }

  /**
   * 从 ondemand 文件中提取索引
   */
  getIndices(ondemandFileResponse) {
    const keyByteIndices = [];
    INDICES_REGEX.lastIndex = 0; // 重置正则表达式

    let match;
    while ((match = INDICES_REGEX.exec(ondemandFileResponse)) !== null) {
      keyByteIndices.push(match[2]);
    }

    if (keyByteIndices.length === 0) {
      throw new Error("Couldn't get KEY_BYTE indices");
    }

    const indices = keyByteIndices.map((i) => parseInt(i, 10));
    return {
      rowIndex: indices[0],
      keyBytesIndices: indices.slice(1),
    };
  }

  /**
   * 从主页响应中获取密钥
   */
  getKey($) {
    const element = $("meta[name='twitter-site-verification']");
    if (!element || element.length === 0) {
      throw new Error(
        "Couldn't get [twitter-site-verification] key from the page source"
      );
    }
    return element.attr("content");
  }

  /**
   * 将密钥转换为字节数组
   */
  getKeyBytes(key) {
    return Array.from(Buffer.from(key, "base64"));
  }

  /**
   * 获取帧元素
   */
  getFrames($) {
    return $("[id^='loading-x-anim']");
  }

  /**
   * 获取二维数组
   */
  get2DArray(keyBytes, $, frames = null) {
    if (frames === null) {
      frames = this.getFrames($);
    }

    const frameIndex = keyBytes[5] % 4;
    const frame = frames.eq(frameIndex);
    const path = frame.find("path").eq(1);
    const d = path.attr("d");

    if (!d) {
      throw new Error("Could not find path data");
    }

    const parts = d.substring(9).split("C");
    return parts.map((part) => {
      const cleaned = part.replace(/[^\d\s]/g, " ").trim();
      return cleaned.split(/\s+/).map((x) => parseInt(x, 10));
    });
  }

  /**
   * 求解函数
   */
  solve(value, minVal, maxVal, rounding) {
    const result = (value * (maxVal - minVal)) / 255 + minVal;
    return rounding ? Math.floor(result) : Math.round(result * 100) / 100;
  }

  /**
   * 动画计算
   */
  animate(frames, targetTime) {
    const fromColor = [...frames.slice(0, 3).map((x) => parseFloat(x)), 1];
    const toColor = [...frames.slice(3, 6).map((x) => parseFloat(x)), 1];
    const fromRotation = [0.0];
    const toRotation = [this.solve(parseFloat(frames[6]), 60.0, 360.0, true)];

    const framesCurve = frames.slice(7);
    const curves = framesCurve.map((item, counter) =>
      this.solve(parseFloat(item), isOdd(counter), 1.0, false)
    );

    const cubic = new Cubic(curves);
    const val = cubic.getValue(targetTime);

    let color = interpolate(fromColor, toColor, val);
    color = color.map((value) => Math.max(0, Math.min(255, value)));

    const rotation = interpolate(fromRotation, toRotation, val);
    const matrix = convertRotationToMatrix(rotation[0]);

    const strArr = color.slice(0, -1).map((value) => {
      const rounded = Math.round(value);
      return rounded.toString(16);
    });

    for (const value of matrix) {
      let rounded = Math.round(value * 100) / 100;
      if (rounded < 0) {
        rounded = -rounded;
      }
      const hexValue = floatToHex(rounded);
      if (hexValue.startsWith(".")) {
        strArr.push(`0${hexValue}`.toLowerCase());
      } else {
        strArr.push(hexValue ? hexValue : "0");
      }
    }

    strArr.push("0", "0");
    const animationKey = strArr.join("").replace(/[.\-]/g, "");
    return animationKey;
  }

  /**
   * 获取动画密钥
   */
  getAnimationKey(keyBytes, $) {
    const totalTime = 4096;

    const rowIndex = keyBytes[this.rowIndex] % 16;

    let frameTime = this.keyBytesIndices.reduce((acc, index) => {
      return acc * (keyBytes[index] % 16);
    }, 1);

    frameTime = MathUtils.round(frameTime / 10) * 10;

    const arr = this.get2DArray(keyBytes, $);
    const frameRow = arr[rowIndex];

    const targetTime = parseFloat(frameTime) / totalTime;
    const animationKey = this.animate(frameRow, targetTime);
    return animationKey;
  }

  /**
   * 生成交易 ID
   */
  generateTransactionId(method, path, options = {}) {
    const {
      homePageResponse = null,
      key = null,
      animationKey = null,
      timeNow = null,
    } = options;

    const time = timeNow || Math.floor((Date.now() - 1682924400 * 1000) / 1000);

    const timeNowBytes = [
      (time >> 0) & 0xff,
      (time >> 8) & 0xff,
      (time >> 16) & 0xff,
      (time >> 24) & 0xff,
    ];

    const usedKey = key || this.key || this.getKey(homePageResponse || this.$);
    const keyBytes = this.getKeyBytes(usedKey);

    const usedAnimationKey =
      animationKey ||
      this.animationKey ||
      this.getAnimationKey(keyBytes, homePageResponse || this.$);

    const hashString = `${method}!${path}!${time}${this.randomKeyword}${usedAnimationKey}`;
    const hash = crypto.createHash("sha256").update(hashString).digest();
    const hashBytes = Array.from(hash);

    const randomNum = Math.floor(Math.random() * 256);
    const bytesArr = [
      ...keyBytes,
      ...timeNowBytes,
      ...hashBytes.slice(0, 16),
      this.randomNumber,
    ];

    const out = [randomNum, ...bytesArr.map((item) => item ^ randomNum)];
    return base64Encode(out).replace(/=/g, "");
  }
}
