import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.js", "**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        ...globals.node,   // process, __dirname, __filename, Buffer, etc.
        ...globals.jest,   // describe, it, expect, beforeEach, afterEach
      },
    },
    rules: {
      "no-console": "off",       // Backend được dùng console.log
      "no-unused-vars": "warn",
      "no-undef": "error",
    },
  },
  {
    // Bỏ qua thư mục không cần lint
    ignores: ["node_modules/**", "coverage/**"],
  },
]);
