import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import globals from "globals";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default [
  { ignores: [".next/**", "node_modules/**"] },
  js.configs.recommended,
  ...compat.extends("next/core-web-vitals"),
  {
    files: ["src/app/api/**/*.js"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    },
  },
];
