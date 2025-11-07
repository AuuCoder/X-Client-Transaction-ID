# X-Client-Transaction-ID

<p align="center">
A Node.js library for generating X-Client-Transaction-ID headers required by Twitter/X API requests
</p>

<p align="center">
<img src="https://img.shields.io/badge/License-MIT-green.svg">
<img src="https://img.shields.io/badge/Node.js->=16.0.0-blue.svg">
<img src="https://img.shields.io/badge/ES-Module-yellow.svg">
</p>

## 📖 Description

This Node.js library generates valid `X-Client-Transaction-ID` headers required for Twitter/X API requests. It implements the complex algorithm used by Twitter/X to authenticate API calls, including Bezier curve calculations, matrix transformations, and cryptographic operations.

[中文文档](README_CN.md)

## ✨ Features

- ✅ Modern ES6+ module syntax
- ✅ Full async/await support
- ✅ Proxy configuration support (V2rayN, Clash, etc.)
- ✅ Comprehensive documentation
- ✅ Clean and simple API design
- ✅ HTTPS proxy agent for secure connections

## 📦 Installation

### Requirements

- Node.js >= 16.0.0
- Network access to X.com (or proxy configuration)

### Install Dependencies

```bash
cd nodejs
npm install
```

### Main Dependencies

- `axios` - HTTP request library
- `cheerio` - HTML parsing library
- `https-proxy-agent` - HTTPS proxy support

## 🚀 Quick Start

### Basic Usage

```javascript
import {
  ClientTransaction,
  createSession,
  getOndemandFileUrl,
} from "./src/index.js";
import * as cheerio from "cheerio";

// Create HTTP session
const session = createSession();

// Get X.com homepage
const homePage = await session.get("https://x.com");
const $ = cheerio.load(homePage.data);

// Get ondemand.s file
const ondemandFileUrl = getOndemandFileUrl($);
const ondemandFile = await session.get(ondemandFileUrl);

// Create ClientTransaction instance
const ct = new ClientTransaction($, ondemandFile.data);

// Generate Transaction ID
const transactionId = ct.generateTransactionId(
  "POST",
  "/i/api/1.1/jot/client_event.json"
);

console.log(transactionId);
```

### With Proxy Configuration

If you need to use a proxy (e.g., V2rayN, Clash):

```javascript
import { createSession } from "./src/index.js";

// Configure proxy
const session = createSession({
  proxy: "http://127.0.0.1:10808", // V2rayN default port
  timeout: 30000,
});

// Rest of the code remains the same...
```

### Run Examples

```bash
# Run basic example
npm start

# Run with proxy
npm run start:proxy

# Run real API call example
npm run example:real
```

## 📚 API Documentation

### `createSession(options)`

Creates a configured axios HTTP client instance.

**Parameters:**

- `options.proxy` (string, optional) - Proxy URL (e.g., "http://127.0.0.1:10808")
- `options.timeout` (number, optional) - Request timeout in milliseconds (default: 30000)

**Returns:** Configured axios instance

**Example:**

```javascript
const session = createSession({
  proxy: "http://127.0.0.1:7890",
  timeout: 60000,
});
```

### `ClientTransaction` Class

Main class for generating Transaction IDs.

#### Constructor

```javascript
new ClientTransaction(
  homePageResponse,
  ondemandFileResponse,
  randomKeyword,
  randomNumber
);
```

**Parameters:**

- `homePageResponse` - Cheerio object or HTML string (X.com homepage)
- `ondemandFileResponse` - Text content of ondemand.s file
- `randomKeyword` (optional) - Custom random keyword (default: "obfiowerehiring")
- `randomNumber` (optional) - Custom random number (default: 3)

#### `generateTransactionId(method, path, options)`

Generates an X-Client-Transaction-ID header value.

**Parameters:**

- `method` (string) - HTTP method (e.g., "GET", "POST")
- `path` (string) - API endpoint path (e.g., "/i/api/1.1/jot/client_event.json")
- `options` (object, optional) - Configuration options
  - `homePageResponse` - Override default homepage response
  - `key` - Override default key
  - `animationKey` - Override default animation key
  - `timeNow` - Custom timestamp

**Returns:** String - Transaction ID

**Example:**

```javascript
const transactionId = ct.generateTransactionId(
  "POST",
  "/i/api/1.1/jot/client_event.json"
);
```

### Utility Functions

#### `generateHeaders()`

Generates default HTTP headers for X.com requests.

```javascript
import { generateHeaders } from "./src/index.js";

const headers = generateHeaders();
// Returns headers object with User-Agent, Accept-Language, etc.
```

#### `getOndemandFileUrl($)`

Extracts the ondemand.s file URL from the homepage HTML.

```javascript
const url = getOndemandFileUrl($);
// Returns: "https://abs.twimg.com/responsive-web/client-web/ondemand.s.xxxxx.js"
```

#### `handleXMigration(axiosInstance)`

Handles Twitter to X domain migration if necessary.

```javascript
const $ = await handleXMigration(session);
```

## 🔧 Proxy Configuration

### V2rayN Users

1. Open V2rayN application
2. Check HTTP proxy port (usually 10808 or 10809)
3. Configure in your code:

```javascript
const session = createSession({
  proxy: "http://127.0.0.1:10808",
});
```

### Clash Users

```javascript
const session = createSession({
  proxy: "http://127.0.0.1:7890", // Clash default port
});
```

### Environment Variables

You can also set proxy via environment variables:

```bash
export HTTP_PROXY=http://127.0.0.1:10808
export HTTPS_PROXY=http://127.0.0.1:10808
npm start
```

## 🏗️ Project Structure

```
nodejs/
├── src/
│   ├── index.js           # Main entry point
│   ├── transaction.js     # ClientTransaction class
│   ├── constants.js       # Constants and configurations
│   ├── cubic-curve.js     # Cubic Bezier curve implementation
│   ├── interpolate.js     # Interpolation functions
│   ├── rotation.js        # Rotation matrix calculations
│   └── utils.js           # Utility functions (HTTP, parsing, etc.)
├── examples/
│   ├── quickstart.js             # Basic example
│   ├── quickstart-with-proxy.js  # Proxy configuration example
│   ├── real-api-call.js          # Real API call example
│   └── test.js                   # Test file
├── package.json
├── .gitignore
├── README.md              # English documentation
└── README_CN.md           # Chinese documentation
```

## 🔍 Technical Details

### Algorithm Overview

The Transaction ID generation involves several steps:

1. **Key Extraction** - Extract `twitter-site-verification` meta tag from HTML
2. **Animation Frame Parsing** - Parse SVG animation frame data from ondemand.s file
3. **Cubic Bezier Curve** - Calculate easing function values
4. **Matrix Transformation** - Perform rotation matrix calculations
5. **Hash Generation** - SHA-256 hashing with XOR encryption
6. **Base64 Encoding** - Final Transaction ID encoding

### Core Technologies

| Component       | Purpose                 | Implementation                   |
| --------------- | ----------------------- | -------------------------------- |
| HTTP Client     | Network requests        | `axios` with `https-proxy-agent` |
| HTML Parser     | Page parsing            | `cheerio` (jQuery-like API)      |
| Hash Algorithm  | SHA-256                 | Node.js `crypto` module          |
| Encoding        | Base64                  | Node.js `Buffer`                 |
| Math Operations | Bezier curves, matrices | Custom implementations           |

## 💡 Usage Examples

### Example 1: Multiple Endpoints

```javascript
const ct = new ClientTransaction($, ondemandFileResponse);

const endpoints = [
  { method: "POST", path: "/i/api/1.1/jot/client_event.json" },
  { method: "GET", path: "/i/api/graphql/xxx/UserByScreenName" },
  { method: "GET", path: "/i/api/2/timeline/home.json" },
];

for (const endpoint of endpoints) {
  const tid = ct.generateTransactionId(endpoint.method, endpoint.path);
  console.log(`${endpoint.method} ${endpoint.path}`);
  console.log(`Transaction ID: ${tid}\n`);
}
```

### Example 2: Making Authenticated API Requests

```javascript
import axios from "axios";
import {
  ClientTransaction,
  createSession,
  getOndemandFileUrl,
} from "./src/index.js";
import * as cheerio from "cheerio";

async function makeAPIRequest() {
  // Setup
  const session = createSession();
  const homePage = await session.get("https://x.com");
  const $ = cheerio.load(homePage.data);
  const ondemandFileUrl = getOndemandFileUrl($);
  const ondemandFile = await session.get(ondemandFileUrl);

  const ct = new ClientTransaction($, ondemandFile.data);

  // Make API request
  const apiUrl = "https://x.com/i/api/1.1/jot/client_event.json";
  const path = new URL(apiUrl).pathname;
  const transactionId = ct.generateTransactionId("POST", path);

  const response = await session.post(apiUrl, requestData, {
    headers: {
      "X-Client-Transaction-ID": transactionId,
      Authorization: "Bearer YOUR_TOKEN_HERE",
    },
  });

  return response.data;
}
```

### Example 3: Offline Mode

Save homepage and ondemand file for offline use:

```javascript
import fs from "fs";

// First run - save data
fs.writeFileSync("home_page.html", homePage.data);
fs.writeFileSync("ondemand.js", ondemandFile.data);

// Subsequent runs - use saved data
const savedHomePage = fs.readFileSync("home_page.html", "utf-8");
const savedOndemand = fs.readFileSync("ondemand.js", "utf-8");
const $ = cheerio.load(savedHomePage);
const ct = new ClientTransaction($, savedOndemand);
```

## 🐛 Troubleshooting

### Error: "timeout" or "ETIMEDOUT"

**Cause:** Cannot access X.com (network restrictions)

**Solution:**

- Configure a proxy (V2rayN, Clash, etc.)
- Ensure proxy software is running
- Verify proxy port is correct

### Error: "Request failed with status code 400"

**Cause:** Incorrect proxy configuration or missing headers

**Solution:**

- Install `https-proxy-agent`: `npm install https-proxy-agent`
- Use `createSession()` function for proper proxy handling
- Ensure all required headers are present

### Error: "Couldn't get KEY_BYTE indices"

**Cause:** Wrong format for ondemand file

**Solution:**

```javascript
// ✅ Correct - pass text content
const ondemandFileResponse = ondemandFile.data;

// ❌ Wrong - don't parse as HTML
const ondemandFileResponse = cheerio.load(ondemandFile.data);
```

### Verify Proxy is Working

```bash
# Test proxy connection
curl -x http://127.0.0.1:10808 https://x.com

# Or run debug example
node examples/quickstart-with-proxy.js
```

## 🎯 Performance Tips

### Reuse ClientTransaction Instance

```javascript
// ✅ Good - create once, reuse multiple times
const ct = new ClientTransaction($, ondemandFileResponse);
const tid1 = ct.generateTransactionId("POST", "/api/path1");
const tid2 = ct.generateTransactionId("GET", "/api/path2");
const tid3 = ct.generateTransactionId("POST", "/api/path3");

// ❌ Bad - creating new instance every time
const ct1 = new ClientTransaction($, ondemandFileResponse);
const tid1 = ct1.generateTransactionId("POST", "/api/path1");
const ct2 = new ClientTransaction($, ondemandFileResponse);
const tid2 = ct2.generateTransactionId("GET", "/api/path2");
```

### Cache Homepage and Ondemand Data

The homepage and ondemand.s file don't change frequently. Consider caching them for better performance:

```javascript
// Cache for 1 hour
const CACHE_DURATION = 60 * 60 * 1000;
let cachedData = null;
let cacheTime = 0;

async function getCachedTransaction() {
  const now = Date.now();
  if (!cachedData || now - cacheTime > CACHE_DURATION) {
    // Refresh cache
    const session = createSession();
    const homePage = await session.get("https://x.com");
    const $ = cheerio.load(homePage.data);
    const ondemandFileUrl = getOndemandFileUrl($);
    const ondemandFile = await session.get(ondemandFileUrl);

    cachedData = { $, ondemandFileResponse: ondemandFile.data };
    cacheTime = now;
  }

  return new ClientTransaction(cachedData.$, cachedData.ondemandFileResponse);
}
```

## 🔐 Security Notes

- Never commit API tokens or credentials to version control
- Use environment variables for sensitive data
- Keep your proxy configuration private
- See [SECURITY.md](SECURITY.md) for more details

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details

## 👤 Author

[@AuuCoder](https://github.com/AuuCoder)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/XClientTransaction.git`
3. Install dependencies: `npm install`
4. Make your changes
5. Test your changes: `npm test`
6. Submit a pull request

## 📧 Contact

For questions or issues, please open an issue on GitHub.

## 🙏 Acknowledgments

This project implements the X-Client-Transaction-ID generation algorithm used by Twitter/X.

---

**Disclaimer**: This tool is for educational and research purposes only. Please comply with Twitter/X's Terms of Service and API usage policies.
