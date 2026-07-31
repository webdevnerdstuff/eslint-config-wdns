# eslint-config-wdns
>
> An opinionated eslint config for WebDevNerdStuff.

### 📋 Requirements

- ESLint `^10.0.0`
- Node.js `^20.19.0 || ^22.13.0 || >=24`
- A `tsconfig.json` covering your `.ts`/`.vue` files — this config enables type-aware
  linting via `projectService`, and files outside the project will fail to parse.

### 💿 Install

```bash
pnpm add -D @wdns/eslint-config-wdns eslint
```

### 🚀 Usage

Update your `eslint.config.js` flat config to _extend_ wdns:

```js
import wdnsConfig from '@wdns/eslint-config-wdns';

export default [
  ...wdnsConfig,
]
```

### ⚠️ Migrating from v1

- **ESLint 10 is now required.** ESLint 9 and the legacy `.eslintrc` formats are no longer supported.
- **Formatting rules moved to [`@stylistic`](https://eslint.style).** ESLint deprecated and froze its core
  formatting rules, so they now live under the `@stylistic/` prefix. If you override any of these in your own
  config, rename them:

  `arrow-spacing`, `brace-style`, `comma-dangle`, `function-paren-newline`, `implicit-arrow-linebreak`,
  `indent`, `linebreak-style`, `max-len`, `no-multiple-empty-lines`, `no-tabs`, `object-curly-newline`,
  `operator-linebreak`, `quotes`, `semi`, `space-before-function-paren`

  ```diff
  - 'indent': ['error', 'tab'],
  + '@stylistic/indent': ['error', 'tab'],
  ```

- **`vue/component-tags-order` → `vue/block-order`.** The old rule was removed in `eslint-plugin-vue` v10.
- **`eslint-plugin-import` → `eslint-plugin-import-x`.** The original plugin has no ESLint 10 support. The
  replacement is still registered under the `import` plugin key, so rule names such as `import/order` and any
  overrides you already have keep working unchanged.
- **Prettier was removed.** `eslint-plugin-prettier` and `eslint-config-prettier` are no longer dependencies —
  no prettier rule was ever enabled, and prettier conflicts with the formatting rules this config enforces.
- **`.mjs` files are now linted.** The lint glob is `**/*.{mjs,ts,mts,tsx,vue}`. Plain `.js` and `.cjs` are
  deliberately left alone — v1 half-linted them, applying `@typescript-eslint` rules while silently skipping
  every override in this config.

### 🧪 Development

```bash
pnpm install
pnpm test
```

Tests lint real fixture files in `tests/fixtures/` through the exported config. They assert that every
configured rule still exists and is not deprecated — the check that would have caught
`vue/component-tags-order` being removed in `eslint-plugin-vue` v10.

### 📑 License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2024-present WebDevNerdStuff
