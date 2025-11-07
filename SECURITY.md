# 🔐 安全说明

## ⚠️ 重要提示

本项目涉及 X.com (Twitter) API 的认证信息，请务必注意以下安全事项：

## 🚫 不要泄露的信息

### 1. 认证 Token

- ❌ `X_AUTH_TOKEN` - 登录凭证
- ❌ `X_CSRF_TOKEN` - CSRF Token
- ❌ `X_BEARER_TOKEN` - API Bearer Token（如果使用自己的）

### 2. 用户信息

- ❌ 真实的用户 ID
- ❌ 实际的 API 响应数据
- ❌ Cookie 值

### 3. 其他敏感数据

- ❌ 实际生成的 Transaction ID
- ❌ API 请求的完整 URL（包含参数）
- ❌ 真实的推文内容和数据

## ✅ 安全实践

### 1. 使用 .env 文件

```bash
# .env 文件已在 .gitignore 中
# 永远不要提交 .env 文件到 Git
```

### 2. 定期更换 Token

- 定期更新你的认证 Token
- 退出登录会使 Token 失效
- 发现泄露立即更换

### 3. 代码分享

分享代码时，确保：

- ✅ 使用占位符（如 `YOUR_TOKEN_HERE`）
- ✅ 删除所有真实的 Token
- ✅ 删除所有真实的用户 ID
- ✅ 使用示例数据而非真实数据

### 4. Git 提交检查

提交前检查：

```bash
# 检查是否包含敏感信息
git diff

# 确保 .env 在 .gitignore 中
cat .gitignore | grep .env
```

## 📝 数据脱敏指南

### 替换真实 Token

```javascript
// ❌ 错误
const token = "410592a9b89accc312757decbc359cf33ab43213";

// ✅ 正确
const token = process.env.X_AUTH_TOKEN || "YOUR_AUTH_TOKEN_HERE";
```

### 替换真实用户 ID

```javascript
// ❌ 错误
const userId = "902926941413453824"; // CZ_Binance

// ✅ 正确
const userId = "USER_ID_HERE"; // 替换为目标用户 ID
```

### 替换真实 Transaction ID

```javascript
// ❌ 错误
console.log("Transaction ID: dDnVa5QLBrHdQ6vlO0jAxXftSOlX...");

// ✅ 正确
console.log("Transaction ID: XXXXXXXXXXXXXXXXXXXXXXXXXXXXX...");
```

## 🔍 检测泄露

如果你的 Token 已经泄露：

1. **立即退出登录**

   - 在 X.com 上退出登录
   - 这会使所有 Token 失效

2. **更改密码**

   - 修改 X.com 账号密码
   - 启用两步验证

3. **检查账号活动**

   - 查看是否有异常登录
   - 检查是否有未授权的操作

4. **重新配置**
   - 重新登录获取新 Token
   - 更新 .env 文件

## 📞 报告安全问题

如果你发现本项目的安全问题，请通过以下方式联系：

- GitHub Issues（标记为 Security）
- 或直接联系项目维护者

## ⚖️ 法律声明

- 本工具仅供学习和研究使用
- 请遵守 X.com 的服务条款
- 不要用于非法用途
- 尊重他人隐私
- 注意 API 使用限制

---

**记住：安全无小事，保护好你的认证信息！** 🔐
