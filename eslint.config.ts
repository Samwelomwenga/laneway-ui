import antfu from "@antfu/eslint-config"
import betterTailwindcss from "eslint-plugin-better-tailwindcss"
import importX from "eslint-plugin-import-x"
import reactYouMightNotNeedAnEffect from "eslint-plugin-react-you-might-not-need-an-effect"

const GLOB_CODE = "**/*.?([cm])[jt]s?(x)"

export default antfu({
  ignores: [
    ".agents/**",
    ".claude/**",
    ".next/**",
    ".scratch/**",
    "build/**",
    "next-env.d.ts",
    "out/**",
    "skills-lock.json",
  ],
  nextjs: true,
  react: true,
  formatters: true,
  typescript: {
    tsconfigPath: "tsconfig.json",
  },
  jsx: {
    a11y: true,
  },
  stylistic: {
    indent: 2,
    quotes: "double",
    semi: false,
  },
}, reactYouMightNotNeedAnEffect.configs.recommended, {
  files: [GLOB_CODE],
  plugins: {
    "import-x": importX,
  },
  settings: importX.flatConfigs.typescript.settings,
  rules: {
    "import-x/no-cycle": [
      "error",
      { ignoreExternal: true },
    ],
  },
}, {
  files: [GLOB_CODE],
  plugins: {
    "better-tailwindcss": betterTailwindcss,
  },
  settings: {
    "better-tailwindcss": {
      entryPoint: "src/app/globals.css",
    },
  },
  rules: {
    "better-tailwindcss/enforce-consistent-class-order": "error",
    "better-tailwindcss/no-duplicate-classes": "error",
    "better-tailwindcss/no-unknown-classes": "error",
  },
}, {
  files: ["src/**"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["./*", "../*"],
            message: "Import through the @/ alias instead.",
          },
        ],
      },
    ],
  },
}, {
  rules: {
    "eslint-comments/no-unlimited-disable": "error",
    "eslint-comments/require-description": "error",
    "no-console": "warn",
    "node/no-process-env": "error",
    "node/prefer-global/process": "off",
    "react-refresh/only-export-components": "off",
    "ts/consistent-type-definitions": ["error", "type"],
    "unicorn/filename-case": [
      "error",
      {
        case: "kebabCase",
        ignore: [
          "^README.*\\.md$",
          "^AGENTS\\.md$",
          "^CLAUDE\\.md$",
          "^GLOSSARY\\.md$",
        ],
      },
    ],
  },
})
