import js from "@eslint/js";

const eslintConfig = [
  // 全体に適用する無視設定
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "node_modules/**",
      "*.config.*",
      "next-env.d.ts",
      "*.min.js",
      "test-*.js", // ルートレベルのテストファイル
      "../debug/**",
      "../scripts/**",
      "../python/**",
      "../database/**",
    ],
  },
  // JavaScriptファイルのみ
  {
    ...js.configs.recommended,
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        global: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "prefer-const": "warn",
    },
  },
];

export default eslintConfig;
