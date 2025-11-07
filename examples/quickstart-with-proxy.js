/**
 * X-Client-Transaction-ID 快速开始示例（带代理配置）
 * 如果无法直接访问 X.com，使用此版本
 */

import axios from "axios";
import * as cheerio from "cheerio";
import {
  ClientTransaction,
  createSession,
  handleXMigration,
  getOndemandFileUrl,
} from "../src/index.js";

async function main() {
  try {
    console.log("开始生成 X-Client-Transaction-ID（使用代理）...\n");

    // ============================================
    // 配置代理（根据你的实际情况修改）
    // ============================================
    const PROXY_CONFIG = {
      // 常见代理端口：
      // - Clash: http://127.0.0.1:7890
      // - V2rayN: http://127.0.0.1:10808 或 http://127.0.0.1:10809
      // - Shadowsocks: socks5://127.0.0.1:1080
      proxy: "http://127.0.0.1:10808", // V2rayN 默认端口
      timeout: 60000, // 60秒超时（首次请求可能较慢）
    };

    console.log(`代理配置: ${PROXY_CONFIG.proxy}`);
    console.log(`超时时间: ${PROXY_CONFIG.timeout}ms\n`);

    // 1. 初始化 axios 实例（带代理）
    const session = createSession(PROXY_CONFIG);

    console.log("1. 正在获取 X.com 主页（通过代理）...");

    // 2. 获取主页响应
    const homePage = await session.get("https://x.com");
    const $ = cheerio.load(homePage.data);

    console.log("✓ 主页获取成功");

    // 3. 获取 ondemand.s 文件
    console.log("\n2. 正在获取 ondemand.s 文件...");
    const ondemandFileUrl = getOndemandFileUrl($);

    if (!ondemandFileUrl) {
      throw new Error("无法获取 ondemand 文件 URL");
    }

    console.log(`   文件 URL: ${ondemandFileUrl}`);
    const ondemandFile = await session.get(ondemandFileUrl);
    const ondemandFileResponse = ondemandFile.data;

    console.log("✓ ondemand.s 文件获取成功");

    // 4. 创建 ClientTransaction 实例
    console.log("\n3. 正在初始化 ClientTransaction...");
    const ct = new ClientTransaction($, ondemandFileResponse);
    console.log("✓ ClientTransaction 初始化成功");

    // 5. 生成 Transaction ID
    console.log("\n4. 正在生成 Transaction ID...\n");

    // 示例 1: client_event.json 端点
    const url1 = "https://x.com/i/api/1.1/jot/client_event.json";
    const method1 = "POST";
    const path1 = new URL(url1).pathname;
    const transactionId1 = ct.generateTransactionId(method1, path1);

    console.log("示例 1:");
    console.log(`  端点: ${url1}`);
    console.log(`  方法: ${method1}`);
    console.log(`  路径: ${path1}`);
    console.log(`  Transaction ID: ${transactionId1}\n`);

    // 示例 2: UserByScreenName 端点
    const url2 =
      "https://x.com/i/api/graphql/1VOOyvKkiI3FMmkeDNxM9A/UserByScreenName";
    const method2 = "GET";
    const path2 = new URL(url2).pathname;
    const transactionId2 = ct.generateTransactionId(method2, path2);

    console.log("示例 2:");
    console.log(`  端点: ${url2}`);
    console.log(`  方法: ${method2}`);
    console.log(`  路径: ${path2}`);
    console.log(`  Transaction ID: ${transactionId2}\n`);

    console.log("✅ 所有操作完成！");
  } catch (error) {
    console.error("❌ 发生错误:", error.message);

    if (error.code === "ETIMEDOUT") {
      console.error("\n💡 解决方案:");
      console.error("   1. 检查代理是否正确运行");
      console.error("   2. 确认代理地址和端口是否正确");
      console.error("   3. 尝试增加超时时间");
      console.error("   4. 检查网络连接");
    } else if (error.code === "ECONNREFUSED") {
      console.error("\n💡 代理连接被拒绝:");
      console.error("   1. 确保代理软件正在运行");
      console.error("   2. 检查代理端口是否正确");
    }

    console.error("\n完整错误堆栈:");
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行主函数
main();
