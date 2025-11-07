/**
 * X-Client-Transaction-ID 快速开始示例
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
    console.log("开始生成 X-Client-Transaction-ID...\n");

    // 1. 初始化 axios 实例
    // 如果需要代理，取消注释并配置代理地址
    // const session = createSession({
    //   proxy: "http://127.0.0.1:7890",  // 修改为你的代理地址
    //   timeout: 30000
    // });

    // 不使用代理
    const session = createSession({ timeout: 30000 });

    console.log("1. 正在获取 X.com 主页...");
    console.log("   提示: 如果连接超时，请配置代理或检查网络\n");

    // 2. 获取主页响应
    // 如果访问 twitter.com 需要处理迁移
    // const homePageResponse = await handleXMigration(session);

    // 如果直接访问 x.com，可以直接获取
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
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行主函数
main();
