/**
 * 完整的 API 调用示例 - 使用 .env 文件存储敏感信息
 *
 * 使用方法：
 * 1. .env 文件已自动创建，编辑它并填入你的真实配置
 * 2. 运行：npm run example:real
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import axios from "axios";
import * as cheerio from "cheerio";
import { HttpsProxyAgent } from "https-proxy-agent";
import {
  ClientTransaction,
  createSession,
  getOndemandFileUrl,
} from "../src/index.js";

// 获取当前文件所在目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载 .env 文件（从 nodejs 目录）
dotenv.config({ path: join(__dirname, "..", ".env") });

// 从 .env 文件读取配置
const CONFIG = {
  proxy: process.env.PROXY || "http://127.0.0.1:10808",
  authToken: process.env.X_AUTH_TOKEN,
  csrfToken: process.env.X_CSRF_TOKEN,
  bearerToken: process.env.X_BEARER_TOKEN,
};

// 调试：显示加载的配置（隐藏敏感部分）
console.log("\n🔧 配置加载状态:");
console.log("  PROXY:", CONFIG.proxy ? "✓" : "✗");
console.log(
  "  X_AUTH_TOKEN:",
  CONFIG.authToken ? `✓ (${CONFIG.authToken.substring(0, 10)}...)` : "✗ 未设置"
);
console.log(
  "  X_CSRF_TOKEN:",
  CONFIG.csrfToken ? `✓ (${CONFIG.csrfToken.substring(0, 10)}...)` : "✗ 未设置"
);
console.log("  X_BEARER_TOKEN:", CONFIG.bearerToken ? "✓" : "✗ 未设置");
console.log();

/**
 * 生成 Transaction ID
 */
async function generateTransactionId(apiPath) {
  const session = createSession({
    proxy: CONFIG.proxy,
    timeout: 30000,
  });

  const homePage = await session.get("https://x.com");
  const $ = cheerio.load(homePage.data);

  const ondemandFileUrl = getOndemandFileUrl($);
  const ondemandFile = await session.get(ondemandFileUrl);

  const ct = new ClientTransaction($, ondemandFile.data);

  // 提取路径和方法
  const path = new URL(apiPath).pathname;
  const method = "GET"; // 根据实际 API 调整

  return ct.generateTransactionId(method, path);
}

/**
 * 调用 X.com GraphQL API
 */
async function callXApi(endpoint, params = {}) {
  try {
    console.log(`\n🚀 调用 API: ${endpoint}`);

    // 生成 Transaction ID
    const transactionId = await generateTransactionId(endpoint);
    console.log(`✓ Transaction ID: ${transactionId.substring(0, 30)}...`);

    // 构建请求头
    const headers = {
      accept: "*/*",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
      authorization: CONFIG.bearerToken,
      "cache-control": "no-cache",
      "content-type": "application/json",
      referer: "https://x.com/",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
      "x-client-transaction-id": transactionId,
      "x-csrf-token": CONFIG.csrfToken,
      "x-twitter-active-user": "yes",
      "x-twitter-auth-type": "OAuth2Session",
      "x-twitter-client-language": "en",
      cookie: `auth_token=${CONFIG.authToken}; ct0=${CONFIG.csrfToken}`,
    };

    // 发起请求
    const response = await axios.get(endpoint, {
      params,
      headers,
      httpsAgent: new HttpsProxyAgent(CONFIG.proxy),
      timeout: 30000,
    });

    console.log("✓ 请求成功！");
    return response.data;
  } catch (error) {
    console.error("❌ 请求失败:", error.message);
    if (error.response) {
      console.error("状态码:", error.response.status);
      console.error(
        "错误信息:",
        error.response.data?.errors || error.response.data
      );
    }
    throw error;
  }
}

/**
 * 解析并显示最新的推文
 */
function parseAndDisplayLatestTweet(data) {
  try {
    // 从响应中提取推文列表
    const instructions =
      data?.data?.user?.result?.timeline?.timeline?.instructions || [];

    // 查找包含推文的指令
    let tweets = [];
    for (const instruction of instructions) {
      if (instruction.type === "TimelineAddEntries" && instruction.entries) {
        tweets = instruction.entries
          .filter(
            (entry) => entry.content?.entryType === "TimelineTimelineItem"
          )
          .map((entry) => entry.content?.itemContent?.tweet_results?.result);
        break;
      }
    }

    if (tweets.length === 0) {
      console.log("\n⚠️  未找到推文");
      return;
    }

    // 获取第一条（最新的）推文
    const latestTweet = tweets[0];
    const legacy = latestTweet?.legacy;

    if (!legacy) {
      console.log("\n⚠️  无法解析推文数据");
      return;
    }

    console.log("\n" + "=".repeat(80));
    console.log("  📌 最新推文");
    console.log("=".repeat(80));
    console.log();

    // 推文 ID
    console.log(`🆔 推文 ID: ${latestTweet.rest_id}`);

    // 发布时间
    const createdAt = new Date(legacy.created_at);
    console.log(
      `📅 发布时间: ${createdAt.toLocaleString("zh-CN", {
        timeZone: "Asia/Shanghai",
      })}`
    );

    // 推文内容
    console.log(`\n💬 内容:\n${legacy.full_text}`);

    // 统计数据
    console.log(`\n📊 互动数据:`);
    console.log(`  ❤️  点赞: ${legacy.favorite_count?.toLocaleString() || 0}`);
    console.log(`  🔄 转推: ${legacy.retweet_count?.toLocaleString() || 0}`);
    console.log(`  💬 回复: ${legacy.reply_count?.toLocaleString() || 0}`);
    console.log(
      `  👁️  浏览: ${legacy.views?.count?.toLocaleString() || "N/A"}`
    );

    // 推文链接
    const userScreenName =
      latestTweet.core?.user_results?.result?.legacy?.screen_name || "unknown";
    const tweetUrl = `https://x.com/${userScreenName}/status/${latestTweet.rest_id}`;
    console.log(`\n🔗 链接: ${tweetUrl}`);

    // 媒体文件
    if (legacy.entities?.media && legacy.entities.media.length > 0) {
      console.log(`\n📷 媒体文件: ${legacy.entities.media.length} 个`);
      legacy.entities.media.forEach((media, index) => {
        console.log(`  ${index + 1}. ${media.type}: ${media.media_url_https}`);
      });
    }

    // Hashtags
    if (legacy.entities?.hashtags && legacy.entities.hashtags.length > 0) {
      const tags = legacy.entities.hashtags.map((h) => `#${h.text}`).join(" ");
      console.log(`\n🏷️  标签: ${tags}`);
    }

    console.log("\n" + "=".repeat(80));
  } catch (error) {
    console.error("\n❌ 解析推文失败:", error.message);
    console.log("\n原始数据结构：");
    console.log(JSON.stringify(data, null, 2).substring(0, 1000) + "...");
  }
}

/**
 * 示例：获取用户推文
 */
async function getUserTweets(userId, count = 20) {
  const endpoint =
    "https://x.com/i/api/graphql/oRJs8SLCRNRbQzuZG93_oA/UserTweets";

  const params = {
    variables: JSON.stringify({
      userId: userId,
      count: count,
      includePromotedContent: true,
      withQuickPromoteEligibilityTweetFields: true,
      withVoice: true,
    }),
    features: JSON.stringify({
      rweb_video_screen_enabled: false,
      payments_enabled: false,
      profile_label_improvements_pcf_label_in_post_enabled: true,
      responsive_web_profile_redirect_enabled: false,
      rweb_tipjar_consumption_enabled: true,
      verified_phone_label_enabled: false,
      creator_subscriptions_tweet_preview_api_enabled: true,
      responsive_web_graphql_timeline_navigation_enabled: true,
      responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
      premium_content_api_read_enabled: false,
      communities_web_enable_tweet_community_results_fetch: true,
      c9s_tweet_anatomy_moderator_badge_enabled: true,
      responsive_web_grok_analyze_button_fetch_trends_enabled: false,
      responsive_web_grok_analyze_post_followups_enabled: true,
      responsive_web_jetfuel_frame: true,
      responsive_web_grok_share_attachment_enabled: true,
      articles_preview_enabled: true,
      responsive_web_edit_tweet_api_enabled: true,
      graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
      view_counts_everywhere_api_enabled: true,
      longform_notetweets_consumption_enabled: true,
      responsive_web_twitter_article_tweet_consumption_enabled: true,
      tweet_awards_web_tipping_enabled: false,
      responsive_web_grok_show_grok_translated_post: true,
      responsive_web_grok_analysis_button_from_backend: true,
      creator_subscriptions_quote_tweet_preview_enabled: false,
      freedom_of_speech_not_reach_fetch_enabled: true,
      standardized_nudges_misinfo: true,
      tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
      longform_notetweets_rich_text_read_enabled: true,
      longform_notetweets_inline_media_enabled: true,
      responsive_web_grok_image_annotation_enabled: true,
      responsive_web_grok_imagine_annotation_enabled: true,
      responsive_web_grok_community_note_auto_translation_is_enabled: false,
      responsive_web_enhance_cards_enabled: false,
    }),
    fieldToggles: JSON.stringify({
      withArticlePlainText: false,
    }),
  };

  const data = await callXApi(endpoint, params);
  return data;
}

// 主函数
async function main() {
  console.log("=".repeat(60));
  console.log("  X.com API 调用示例");
  console.log("=".repeat(60));

  // 检查配置
  if (
    !CONFIG.authToken ||
    !CONFIG.csrfToken ||
    CONFIG.authToken === "YOUR_AUTH_TOKEN_HERE" ||
    CONFIG.csrfToken === "YOUR_CSRF_TOKEN_HERE"
  ) {
    console.log("\n⚠️  请先配置 .env 文件！\n");
    console.log("1. 编辑 nodejs/.env 文件");
    console.log("2. 填入你的真实 Token（从浏览器获取）");
    console.log("3. 保存后重新运行\n");
    console.log("提示：.env 是隐藏文件，在终端中使用以下命令编辑：");
    console.log("  nano .env");
    console.log("  或在 VS Code 中打开：code .env\n");
    return;
  }

  try {
    // 示例：获取指定用户的推文
    // 替换为你想查询的用户 ID
    const userId = "1436266357172039683"; // 例如：ningmeng_zq的用户ID
    console.log(`\n📝 获取用户 ${userId} 的推文...\n`);

    const data = await getUserTweets(userId, 20);

    console.log("\n✅ 成功获取推文数据！");

    // 解析并显示最新的推文
    parseAndDisplayLatestTweet(data);
  } catch (error) {
    console.error("\n❌ 执行失败");
  }
}

// 运行
main();
