const client_id = process.env.REACT_APP_CLIENT_ID;
const client_secret = process.env.REACT_APP_CLIENT_SECRET;

module.exports = {
  // 다른 설정들
  devServer: {
    proxy: {
      "/api/naver-dictionary": {
        target: "https://openapi.naver.com",
        changeOrigin: true,
        pathRewrite: { "^/api/naver-dictionary": "/v1/search/encyc.json" },
        secure: false,
        headers: {
          "X-Naver-Client-Id": client_id,
          "X-Naver-Client-Secret": client_secret,
        },
      },
    },
  },
};
