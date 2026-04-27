// backend/.eslintrc.cjs
// Đặt file này vào thư mục backend/
module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "no-console": "off",        // Backend được phép dùng console.log
    "no-unused-vars": "warn",
    "no-undef": "error",
  },
};
