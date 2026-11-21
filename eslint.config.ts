import antfu from "@antfu/eslint-config"
import betterTailwindcss from "eslint-plugin-better-tailwindcss"
import importX from "eslint-plugin-import-x"
import reactYouMightNotNeedAnEffect from "eslint-plugin-react-you-might-not-need-an-effect"
import { configs as sonarjs } from "eslint-plugin-sonarjs"

const GLOB_CODE = "**/*.?([cm])[jt]s?(x)"
const GLOB_DTS = "**/*.d.?([cm])ts"
const GLOB_MARKDOWN_CODE = "**/*.md/**"
const PUBLIC_SECRET_MESSAGE = "Next inlines NEXT_PUBLIC_* values into the client bundle. Keep secrets out of them."
const PUBLIC_SECRET_NAME = "/^NEXT_PUBLIC_\\w*(SECRET|TOKEN|PASSWORD|PRIVATE)/"

const SONARJS_RULES_ANTFU_ALREADY_COVERS = {
  "sonarjs/block-scoped-var": "off",
  "sonarjs/concise-regex": "off",
  "sonarjs/duplicates-in-character-class": "off",
  "sonarjs/no-control-regex": "off",
  "sonarjs/no-delete-var": "off",
  "sonarjs/no-empty-alternatives": "off",
  "sonarjs/no-empty-character-class": "off",
  "sonarjs/no-empty-group": "off",
  "sonarjs/no-fallthrough": "off",
  "sonarjs/no-invalid-regexp": "off",
  "sonarjs/no-labels": "off",
  "sonarjs/no-misleading-character-class": "off",
  "sonarjs/no-regex-spaces": "off",
  "sonarjs/no-unused-vars": "off",
  "sonarjs/no-useless-catch": "off",
  "sonarjs/single-char-in-character-classes": "off",
  "sonarjs/slow-regex": "off",
  "sonarjs/unused-import": "off",
  "sonarjs/unused-named-groups": "off",
} as const

export default antfu({
  ignores: [
    ".agents/**",
    ".claude/**",
    ".scratch/**",
    "skills-lock.json",
    "src/lib/cn-tables.ts",
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
  ...sonarjs.recommended,
  files: [GLOB_CODE],
  ignores: [GLOB_DTS, GLOB_MARKDOWN_CODE],
}, {
  files: [GLOB_CODE],
  ignores: [GLOB_DTS, GLOB_MARKDOWN_CODE],
  rules: {
    ...SONARJS_RULES_ANTFU_ALREADY_COVERS,
    "sonarjs/cognitive-complexity": ["error", 15],
  },
}, {
  files: [GLOB_CODE],
  ignores: [GLOB_DTS, GLOB_MARKDOWN_CODE],
  rules: {
    // ESLint replaces a rule's options instead of merging them, so antfu's two selectors are repeated here.
    "no-restricted-syntax": [
      "error",
      "TSEnumDeclaration[const=true]",
      "TSExportAssignment",
      {
        selector: `MemberExpression[object.object.name='process'][object.property.name='env']:matches([property.name=${PUBLIC_SECRET_NAME}], [property.value=${PUBLIC_SECRET_NAME}])`,
        message: PUBLIC_SECRET_MESSAGE,
      },
      {
        selector: `VariableDeclarator[init.object.name='process'][init.property.name='env'] > ObjectPattern > Property[key.name=${PUBLIC_SECRET_NAME}]`,
        message: PUBLIC_SECRET_MESSAGE,
      },
    ],
  },
}, {
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
