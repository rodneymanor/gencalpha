import { FlatCompat } from "@eslint/eslintrc";
import pluginJs from "@eslint/js";
import pluginImport from "eslint-plugin-import";
import pluginReact from "eslint-plugin-react";
import globals from "globals";
import tseslint from "typescript-eslint";
import securityPlugin from "eslint-plugin-security";
import prettier from "eslint-plugin-prettier";
import unicorn from "eslint-plugin-unicorn";
import sonarjs from "eslint-plugin-sonarjs";
import unusedImports from "eslint-plugin-unused-imports";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

/** @type {import('eslint').Linter.Config[]} */
export default [
  { 
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    ignores: [
      ".github/",
      ".husky/", 
      "node_modules/", 
      ".next/", 
      "src/components/ui", 
      "*.config.ts", 
      "*.mjs",
      "*.config.js",
      "components.json",
      "package.json",
      "package-lock.json",
      "README.md",
      "tsconfig.json",
      "postcss.config.mjs",
      "next.config.mjs",
      "src/types/preferences/theme.ts",
      "*.log",
      ".env*",
      ".DS_Store",
      "out/",
      "build/",
      "dist/"
    ]
  },
  {
    languageOptions: {
      globals: globals.browser,
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    plugins: {
      import: pluginImport,
      security: securityPlugin,
      prettier: prettier,
      unicorn: unicorn,
      react: pluginReact,
      sonarjs: sonarjs,
      "unused-imports": unusedImports,
    },
  },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  securityPlugin.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Prettier integration rules
      "prettier/prettier": "warn",

      // Unused imports
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],

      // File Naming
      "unicorn/filename-case": [
        "error",
        {
          case: "kebabCase",
          ignore: ["^.*\\.config\\.(js|ts|mjs)$", "^.*\\.d\\.ts$"],
        },
      ],

      // Custom Rules (Not covered by plugins)
      "spaced-comment": ["error", "always", { exceptions: ["-", "+"] }],
      "key-spacing": ["error", { beforeColon: false, afterColon: true }],
      "no-useless-rename": "error",

      // Import/Export Rules
      "import/no-mutable-exports": "error",
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
            {
              pattern: "{next,next/**}",
              group: "external",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: [],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      "import/newline-after-import": "error",
      "import/no-unresolved": [
        "error",
        {
          caseSensitive: true,
        },
      ],
      "no-duplicate-imports": ["error", { includeExports: true }],
      "import/no-cycle": ["error", { maxDepth: 2 }],

      // Whitespace and Punctuation (Style Rules)
      "no-trailing-spaces": "error",
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1 }],
      "space-before-function-paren": [
        "error",
        {
          anonymous: "always",
          named: "never",
          asyncArrow: "always",
        },
      ],
      "space-in-parens": ["error", "never"],
      "array-bracket-spacing": ["error", "never"],
      "object-curly-spacing": ["error", "always"],
      "func-call-spacing": ["error", "never"],
      "computed-property-spacing": ["error", "never"],

      // Naming Conventions
      "no-underscore-dangle": ["error", { allow: ["_id", "__dirname"] }],

      // Complexity - Relaxed for API routes and complex services
      complexity: ["error", { max: 15 }],
      "max-lines": ["error", { max: 500, skipBlankLines: true, skipComments: true }],
      "max-depth": ["error", 4],

      // TypeScript-Specific Rules (customized)
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      "@typescript-eslint/no-unnecessary-condition": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn"],

      // React unnecessary import rules
      "react/jsx-no-useless-fragment": ["warn", { allowExpressions: true }],

      // React JSX Pascal Case Rule
      "react/jsx-pascal-case": [
        "error",
        {
          allowAllCaps: false,
          ignore: [],
        },
      ],

      // React: Prevent nesting component definitions inside another component
      "react/no-unstable-nested-components": ["error", { allowAsProps: true }],

      // React: Prevent re-renders by ensuring context values are memoized
      "react/jsx-no-constructed-context-values": "error",

      // React: Disallow array index as key in JSX
      "react/no-array-index-key": "warn",

      // SonarJS: Detect commented-out code
      "sonarjs/no-commented-code": "warn",

      // Security rules - relaxed for development
      "security/detect-non-literal-regexp": "warn",
      "security/detect-object-injection": "warn",
      "security/detect-unsafe-regex": "warn",
    },
  },
  // Special exceptions for complex API routes and services
  {
    files: [
      "src/app/api/**/**/*.ts",
      "src/lib/instagram-downloader.ts",
      "src/lib/contextual-actions.ts",
      "src/lib/credits-service.ts",
      "src/lib/enhanced-readability-service.ts",
      "src/lib/feature-flags.ts",
      "src/lib/prompts/**/*.ts",
      "src/lib/script-analysis.ts",
      "src/lib/script-generation/**/*.ts",
      "src/lib/services/**/*.ts",
      "src/lib/validation/input-validator.ts",
      "src/lib/video-insights-service.ts",
      "src/lib/tiktok-downloader.ts",
      "src/lib/transcript-title-generator.ts",
      "src/lib/simple-video-queue.ts",
      "src/lib/video-processing-queue.ts",
    ],
    rules: {
      complexity: "off",
      "max-lines": "off",
      "max-depth": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "security/detect-object-injection": "off",
      "security/detect-non-literal-regexp": "off",
      "sonarjs/no-commented-code": "off",
    },
  },
  // Special exceptions for data files
  {
    files: ["src/data/**/*.ts"],
    rules: {
      "security/detect-non-literal-regexp": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
  // Special exceptions for type definition files
  {
    files: ["src/types/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
];
