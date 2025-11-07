# 如何使用 X-Client-Transaction-ID 工具

## 📋 快速开始

### 1️⃣ 生成 Transaction ID（基础功能）

```bash
# 使用代理（推荐，适用于中国大陆）
npm run start:proxy

# 不使用代理（适用于海外）
npm start
```

---

## 🔑 调用 X.com API（完整功能）

### 步骤 1: 获取认证信息

打开浏览器（推荐使用 Chrome），登录 X.com，然后按 `F12` 打开开发者工具。

#### 方法 A：从 Network 面板获取

1. 打开 **Network** 面板
2. 刷新页面或进行任何操作
3. 找到任意 X.com API 请求（如 `UserTweets`）
4. 查看 **Request Headers**：

```
authorization: Bearer YOUR_BEARER_TOKEN_HERE...
x-csrf-token: YOUR_CSRF_TOKEN_HERE...
cookie: auth_token=YOUR_AUTH_TOKEN_HERE...; ct0=YOUR_CSRF_TOKEN_HERE...
```

#### 方法 B：从 Application 面板获取

1. 打开 **Application** 面板
2. 左侧选择 **Cookies** → `https://x.com`
3. 找到以下值：
   - `auth_token` - 登录凭证
   - `ct0` - CSRF Token

### 步骤 2: 配置 .env 文件

.env 文件已自动创建在 `nodejs` 目录下，编辑它：

```bash
# 方法 1：使用 nano 编辑器
cd nodejs
nano .env

# 方法 2：使用 VS Code
code .env

# 方法 3：使用 TextEdit
open -e .env
```

填入你的真实值：

```env
# 代理配置
PROXY=http://127.0.0.1:10808

# 认证信息（替换为你的真实值）
X_BEARER_TOKEN=Bearer YOUR_BEARER_TOKEN_HERE
X_AUTH_TOKEN=YOUR_AUTH_TOKEN_HERE
X_CSRF_TOKEN=YOUR_CSRF_TOKEN_HERE
```

**💡 提示：**

- Bearer Token 开头已包含 "Bearer " 字样，不要重复添加
- 复制时不要包含引号
- .env 文件已在 .gitignore 中，不会被提交到 Git

### 步骤 3: 运行 API 调用示例

```bash
npm run example:real
```

如果配置正确，会看到：

```
==========================================================
  X.com API 调用示例
==========================================================

📝 获取用户 USER_ID_HERE 的推文...

🚀 调用 API: https://x.com/i/api/graphql/...
✓ Transaction ID: XXXXXXXXXXXXXXXXXXXXXXXXXXXXX...
✓ 请求成功！

✅ 成功获取推文数据！
```

---

## 🔍 查看 .env 文件（macOS 隐藏文件）

.env 文件以 `.` 开头，在 macOS 中是隐藏文件。

### 在 Finder 中显示

按快捷键：`⌘ Cmd + ⇧ Shift + .`

### 在终端中查看

```bash
cd nodejs
ls -la | grep .env
cat .env
```

### 在 VS Code 中

直接打开项目文件夹，.env 文件会显示在侧边栏。

---

## 🛠️ 常用命令

```bash
# 生成 Transaction ID
npm start                    # 不使用代理
npm run start:proxy          # 使用代理

# API 调用示例
npm run example:real         # 使用 .env 配置
npm run example:config       # 使用 config.js 配置

# 编辑配置
nano .env                    # 终端编辑器
code .env                    # VS Code
open -e .env                 # macOS 文本编辑器
```

---

## 🔐 安全提示

1. ✅ .env 文件已在 .gitignore 中，不会被提交
2. ❌ 不要在公共代码中暴露 Token
3. ❌ 不要截图或分享包含 Token 的内容
4. ✅ 定期更换 Token
5. ✅ 使用完毕后退出登录

---

## ❓ 常见问题

### Q: 找不到 .env 文件？

A: 它是隐藏文件，按 `⌘ + ⇧ + .` 显示隐藏文件

### Q: 提示 "请先配置认证信息"？

A: 编辑 .env 文件，替换 `YOUR_AUTH_TOKEN_HERE` 等占位符

### Q: 请求失败，状态码 400？

A: 检查 Token 是否正确，是否过期

### Q: 请求失败，状态码 401？

A: auth_token 或 CSRF token 无效或过期

### Q: 无法连接？

A: 检查代理是否正确运行（V2rayN 等）

---

## 📚 更多信息

- 详细文档：README_CN.md
- 代码示例：examples/ 目录
- 问题反馈：GitHub Issues
