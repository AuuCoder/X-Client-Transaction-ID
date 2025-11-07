# X-Client-Transaction-ID (Node.js 版本)

<p align="center">
Twitter/X X-Client-Transaction-Id 生成器的 Node.js 实现
</p>

<p align="center">
<img src="https://img.shields.io/badge/License-MIT-green.svg">
<img src="https://img.shields.io/badge/Node.js->=16.0.0-blue.svg">
<img src="https://img.shields.io/badge/ES-Module-yellow.svg">
</p>

## 📖 简介

Twitter/X API 请求所需的 `X-Client-Transaction-ID` 生成工具。

## ⚠️ 重要提示

**中国大陆用户必看：**

由于网络限制，中国大陆无法直接访问 X.com。请使用以下方式之一：

1. **使用代理（推荐）** - 支持 V2rayN、Clash 等代理工具
2. **设置环境变量** - 通过 HTTP_PROXY/HTTPS_PROXY
3. **在海外服务器运行** - VPS、云服务器等

## 📦 安装

### 要求

- Node.js >= 16.0.0
- 可访问 X.com 的网络环境（或配置代理）

### 安装依赖

```bash
cd nodejs
npm install
```

### 主要依赖

- `axios` - HTTP 请求库
- `cheerio` - HTML 解析库
- `https-proxy-agent` - HTTPS 代理支持（V2rayN/Clash 等）

## 🚀 快速开始

### 方式一：使用代理（推荐）

适用于 V2rayN、Clash、Shadowsocks 等代理工具。

```javascript
import {
  ClientTransaction,
  createSession,
  getOndemandFileUrl,
} from "./src/index.js";
import * as cheerio from "cheerio";

// 配置代理
const session = createSession({
  proxy: "http://127.0.0.1:10808", // V2rayN 默认端口
  timeout: 30000,
});

// 获取主页
const homePage = await session.get("https://x.com");
const $ = cheerio.load(homePage.data);

// 获取 ondemand 文件
const ondemandFileUrl = getOndemandFileUrl($);
const ondemandFile = await session.get(ondemandFileUrl);

// 生成 Transaction ID
const ct = new ClientTransaction($, ondemandFile.data);
const transactionId = ct.generateTransactionId(
  "POST",
  "/i/api/1.1/jot/client_event.json"
);
console.log(transactionId);
```

### 方式二：不使用代理

适用于海外服务器或可直接访问 X.com 的环境。

```javascript
import {
  ClientTransaction,
  createSession,
  getOndemandFileUrl,
} from "./src/index.js";
import * as cheerio from "cheerio";

// 不配置代理
const session = createSession();

// ... 其余代码相同
```

### 运行示例

```bash
# 使用代理运行（推荐）
npm run start:proxy

# 直接运行（需要能访问 X.com）
npm start

# 测试连接
npm test
```

## 🔧 代理配置指南

### V2rayN 用户

1. 打开 V2rayN
2. 查看 HTTP 代理端口（通常是 10808 或 10809）
3. 修改代码中的代理地址：

```javascript
const session = createSession({
  proxy: "http://127.0.0.1:10808", // 修改为你的端口
  timeout: 30000,
});
```

### Clash 用户

```javascript
const session = createSession({
  proxy: "http://127.0.0.1:7890", // Clash 默认端口
  timeout: 30000,
});
```

### 使用环境变量（所有代理工具通用）

```bash
# 设置环境变量
export HTTP_PROXY=http://127.0.0.1:10808
export HTTPS_PROXY=http://127.0.0.1:10808

# 然后运行程序（会自动使用环境变量的代理）
npm start
```

## 📚 API 文档

### createSession(options)

创建配置好的 HTTP 客户端实例。

**参数：**

- `options.proxy` (可选) - 代理地址，如 "http://127.0.0.1:10808"
- `options.timeout` (可选) - 超时时间（毫秒），默认 30000

**返回值：** axios 实例

### ClientTransaction

主要的交易 ID 生成类。

#### 构造函数

```javascript
new ClientTransaction(
  homePageResponse,
  ondemandFileResponse,
  randomKeyword,
  randomNumber
);
```

**参数：**

- `homePageResponse` - Cheerio 对象或 HTML 字符串（X.com 主页）
- `ondemandFileResponse` - ondemand.s 文件的文本内容
- `randomKeyword` (可选) - 自定义随机关键词
- `randomNumber` (可选) - 自定义随机数

#### 方法

##### generateTransactionId(method, path, options)

生成 X-Client-Transaction-ID。

**参数：**

- `method` - HTTP 方法（如 "GET", "POST"）
- `path` - API 路径
- `options` (可选) - 配置对象

**返回值：** 字符串 - Transaction ID

## 🏗️ 项目结构

```
nodejs/
├── src/
│   ├── index.js           # 主入口
│   ├── transaction.js     # ClientTransaction 类
│   ├── constants.js       # 常量定义
│   ├── cubic-curve.js     # 三次贝塞尔曲线
│   ├── interpolate.js     # 插值函数
│   ├── rotation.js        # 旋转矩阵
│   └── utils.js           # 工具函数（HTTP、解析等）
├── examples/
│   ├── quickstart.js             # 基础示例
│   ├── quickstart-with-proxy.js  # 代理示例（推荐）
│   ├── test.js                   # 测试文件
│   └── debug-request.js          # 调试工具
├── package.json
└── README_CN.md
```

## 🔍 技术架构

### 核心组件

| 组件        | 功能         | 实现                          |
| ----------- | ------------ | ----------------------------- |
| HTTP 客户端 | 网络请求     | `axios` + `https-proxy-agent` |
| HTML 解析   | 页面解析     | `cheerio`                     |
| 哈希算法    | SHA-256      | `crypto` 模块                 |
| 编码        | Base64       | `Buffer`                      |
| 数学计算    | 贝塞尔曲线等 | 自定义实现                    |

### 代理支持

本工具使用 `https-proxy-agent` 正确处理 HTTPS 网站的代理访问：

```javascript
import { createSession } from "./src/index.js";

// 配置代理
const session = createSession({
  proxy: "http://127.0.0.1:10808", // V2rayN 等代理
});

// 访问 HTTPS 网站
const response = await session.get("https://x.com");
```

## 🐛 常见问题

### Q1: 提示 "timeout" 或 "ETIMEDOUT" 错误？

**原因：** 无法访问 X.com（中国大陆网络限制）

**解决方案：**

1. 配置代理（V2rayN、Clash 等）
2. 确保代理软件正在运行
3. 检查代理端口是否正确

### Q2: 提示 "Request failed with status code 400" 错误？

**原因：** 代理配置不正确（已修复）

**解决方案：**
确保已安装 `https-proxy-agent`：

```bash
npm install https-proxy-agent
```

### Q3: "Couldn't get KEY_BYTE indices" 错误？

**原因：** 传递了错误的 ondemand 文件格式

**解决方案：**

```javascript
// ✅ 正确 - 传递文本内容
const ondemandFileResponse = ondemandFile.data;

// ❌ 错误 - 不要解析为 HTML
const ondemandFileResponse = cheerio.load(ondemandFile.data);
```

### Q4: 如何验证代理是否工作？

运行调试脚本：

```bash
node examples/debug-request.js
```

### Q5: 代理端口如何查看？

- **V2rayN**: 右键托盘图标 → 参数设置 → 本地监听端口
- **Clash**: 托盘菜单 → Port (通常是 7890)
- **终端测试**: `curl -x http://127.0.0.1:10808 https://x.com`

## 💡 使用技巧

### 1. 批量生成 Transaction ID

```javascript
const endpoints = [
  { method: "POST", path: "/i/api/1.1/jot/client_event.json" },
  { method: "GET", path: "/i/api/graphql/xxx/UserByScreenName" },
  { method: "GET", path: "/i/api/2/timeline/home.json" },
];

for (const ep of endpoints) {
  const tid = ct.generateTransactionId(ep.method, ep.path);
  console.log(`${ep.method} ${ep.path}`);
  console.log(`TID: ${tid}\n`);
}
```

### 2. 在实际请求中使用

```javascript
const apiUrl = "https://x.com/i/api/1.1/jot/client_event.json";
const path = new URL(apiUrl).pathname;
const tid = ct.generateTransactionId("POST", path);

const response = await session.post(apiUrl, requestData, {
  headers: {
    "X-Client-Transaction-ID": tid,
    Authorization: "Bearer YOUR_TOKEN",
  },
});
```

### 3. 保存数据以供离线使用

```javascript
import fs from "fs";

// 首次运行时保存数据
fs.writeFileSync("home_page.html", homePage.data);
fs.writeFileSync("ondemand.js", ondemandFile.data);

// 后续可以离线使用
const savedHomePage = fs.readFileSync("home_page.html", "utf-8");
const savedOndemand = fs.readFileSync("ondemand.js", "utf-8");
const $ = cheerio.load(savedHomePage);
const ct = new ClientTransaction($, savedOndemand);
```

## 🎯 性能优化

### 复用 ClientTransaction 实例

```javascript
// ✅ 好 - 创建一次，多次使用
const ct = new ClientTransaction($, ondemandFileResponse);
const tid1 = ct.generateTransactionId("POST", "/api/path1");
const tid2 = ct.generateTransactionId("GET", "/api/path2");

// ❌ 差 - 每次都创建新实例
const ct1 = new ClientTransaction($, ondemandFileResponse);
const tid1 = ct1.generateTransactionId("POST", "/api/path1");
const ct2 = new ClientTransaction($, ondemandFileResponse);
const tid2 = ct2.generateTransactionId("GET", "/api/path2");
```

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 👤 作者

[@AuuCoder](https://github.com/AuuCoder)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📧 联系方式

如有问题或建议，请通过 GitHub Issues 联系。

---

**注意**: 本工具仅供学习和研究使用，请遵守 Twitter/X 的服务条款。
