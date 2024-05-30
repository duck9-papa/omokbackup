const { createProxyMiddleware } = require("http-proxy-middleware");

const proxy = createProxyMiddleware({
  target: "https://opendict.korean.go.kr",
  changeOrigin: true,
  pathRewrite: {
    "^/api/search": "/api/search", // 여기에서 프록시 경로를 적절하게 변경합니다.
  },
});

module.exports = (req, res) => {
  return proxy(req, res, err => {
    if (err) {
      res.status(500).json({ error: "Proxy error" });
    }
  });
};
