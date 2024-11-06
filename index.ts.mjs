import wdnsConfig from './index.js.mjs';
import tseslint from 'typescript-eslint';
import typescript from '@typescript-eslint/eslint-plugin';
import vueTsEslintConfig from '@vue/eslint-config-typescript';

export default tseslint.config(
  ...wdnsConfig,
  ...tseslint.configs.recommended,
  ...vueTsEslintConfig(),

  {
    name: 'app/files-to-ignore',
    ignores: [
      '**/*.bk.vue',
      '**/*.spec.ts',
      '**/*.test.ts',
      '**/coverage/**',
      '**/dist-ssr/**',
      '**/dist/**',
    ],
  },

  {
    name: 'app/ts-files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        project: './tsconfig.json',
        extraFileExtensions: ['.vue'],
        sourceType: 'module',
      },
    },
    plugins: {
      'typescript-eslint': tseslint.plugin,
    },
    rules: {
      // TypeScript rules //
      ...typescript.configs.recommended.rules,
      ...typescript.configs['recommended-type-checked'].rules,

      '@typescript-eslint/ban-ts-comment': 0,
      '@typescript-eslint/no-empty-function': 0,
      '@typescript-eslint/no-empty-object-type': 0,
      '@typescript-eslint/no-explicit-any': 0,
      '@typescript-eslint/no-unsafe-assignment': 0,
      '@typescript-eslint/no-unsafe-member-access': 0,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
  },
);
