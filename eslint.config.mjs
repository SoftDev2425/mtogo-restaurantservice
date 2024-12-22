import globals from "globals";
import pluginJs from "@eslint/js";
import eslintPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.{ts,tsx}"], // TypeScript files
    languageOptions: {
      parser: tsParser, // Use the TypeScript parser
      parserOptions: {
        project: "./tsconfig.json", // Ensure this is the path to your tsconfig.json
        tsconfigRootDir: process.cwd(),
      },
      globals: globals.node,
    },
    plugins: {
      "@typescript-eslint": eslintPlugin,
    },
    rules: {
      rules: {
        "@typescript-eslint/await-thenable": "off", // Disable rules requiring type info
        "@typescript-eslint/consistent-return": "off",
        "no-unused-vars": "warn", // Change error to warn
        "prefer-const": "warn",
      },
      
    },
  },
  {
    files: ["**/*.{js,mjs,cjs}"], // JavaScript files
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      eqeqeq: "off",
      "no-unused-vars": "error",
      "prefer-const": ["error", { ignoreReadBeforeAssign: true }],
    },
  },
  pluginJs.configs.recommended, // JavaScript recommended rules
];
