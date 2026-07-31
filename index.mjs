// eslint.config.js
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import eslint from '@eslint/js';
import globals from 'globals';
import importX from 'eslint-plugin-import-x';
import stylistic from '@stylistic/eslint-plugin';
import tseslint from 'typescript-eslint';
import vue from 'eslint-plugin-vue';


// `typescript-eslint`'s presets ship with no `files` scope, so every one of their
// rules applies to plain JS too -- while the overrides below, which are scoped to
// the lint glob, do not. Derived from the plugin registry so it can't drift.
const typescriptRulesOff = Object.fromEntries(
	Object.entries(tseslint.plugin.rules)
		.filter(([, rule]) => !rule.meta?.deprecated)
		.map(([name]) => [`@typescript-eslint/${name}`, 0]),
);


export default defineConfigWithVueTs(
	vue.configs['flat/essential'],
	vueTsConfigs.recommended,

	{
		name: 'app/wdns-files-to-ignore',
		ignores: [
			'**/*.bk.vue',
			'**/*.spec.js',
			'**/*.spec.ts',
			'**/*.test.js',
			'**/*.test.ts',
			'**/coverage/**',
			'**/dist-ssr/**',
			'**/dist/**',
		],
	},

	{
		name: 'app/wdns-files-to-lint',
		files: ['**/*.{mjs,ts,mts,tsx,vue}'],
		languageOptions: {
			globals: {
				...globals.node,
				...globals.browser,
			},
		},
		plugins: {
			'@stylistic': stylistic,
			// Registered under the `import` key (not `import-x`) so rule names and
			// consumer overrides stay `import/*`.
			import: importX,
		},
		rules: {
			// ESLint rules //
			...eslint.configs.recommended.rules,

			'default-case': [
				'error', {
					commentPattern: '^skip\\sdefault',
				},
			],
			'func-names': ['error', 'never'],
			'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
			'no-debugger': 0,
			'no-else-return': ['error', { allowElseIf: true }],
			'no-new': 0,
			'no-param-reassign': [
				'error', {
					ignorePropertyModificationsFor: ['field', 'model', 'el', 'item', 'state'],
					props: true,
				},
			],
			'no-plusplus': [
				'error', { allowForLoopAfterthoughts: true },
			],
			'no-undef': 'off',
			'no-underscore-dangle': [
				'error', {
					allow: ['_data', '__dirname', '__filename', '__name'],
					allowAfterThis: true,
				},
			],
			'no-unused-vars': 1,
			'no-useless-escape': 0,
			'prefer-destructuring': [
				'error', {
					array: false,
					object: false,
				},
				{
					enforceForRenamedProperties: false,
				},
			],
			'sort-imports': ['error', {
				'allowSeparatedGroups': true,
				'ignoreCase': false,
				'ignoreDeclarationSort': true,
				'ignoreMemberSort': false,
				'memberSyntaxSortOrder': [
					'none',
					'single',
					'all',
					'multiple',
				],
			}],

			// Stylistic rules //
			// Previously the core formatting rules, deprecated by ESLint and frozen
			// since v8.53. Moved to @stylistic so they stay maintained past ESLint v10.
			'@stylistic/arrow-spacing': ['error', { after: true, before: true }],
			'@stylistic/brace-style': ['error', 'stroustrup'],
			'@stylistic/comma-dangle': ['error', 'always-multiline'],
			'@stylistic/function-paren-newline': 0,
			'@stylistic/implicit-arrow-linebreak': ['warn', 'beside'],
			'@stylistic/indent': [2, 'tab', { SwitchCase: 1 }],
			'@stylistic/linebreak-style': 0,
			'@stylistic/max-len': 0,
			'@stylistic/no-multiple-empty-lines': ['error', { 'max': 2, 'maxEOF': 0 }],
			'@stylistic/no-tabs': [0, { allowIndentationTabs: true }],
			'@stylistic/object-curly-newline': ['error', {
				ExportDeclaration: { multiline: true },
				ImportDeclaration: { multiline: true },
				ObjectPattern: { multiline: true },
			}],
			'@stylistic/operator-linebreak': ['error', 'after'],
			'@stylistic/quotes': ['error', 'single', { avoidEscape: true }],
			'@stylistic/semi': ['error', 'always'],
			'@stylistic/space-before-function-paren': ['error', {
				anonymous: 'never',
				asyncArrow: 'always',
				named: 'never',
			}],

			// Import rules //
			'import/no-extraneous-dependencies': ['error', { 'devDependencies': true }],
			'import/no-self-import': 0,
			'import/order': [
				'error',
				{
					'groups': [
						'builtin',
						'external',
						'type',
						'internal',
						'parent',
						'sibling',
						'index',
					],
					'pathGroups': [
						{
							'pattern': '@',
							'group': 'internal'
						},
						{
							'pattern': '@Libraries/**',
							'group': 'internal'
						},
						{
							'pattern': '@Layouts/**',
							'group': 'internal'
						},
						{
							'pattern': '@Components/Layouts/**',
							'group': 'internal',
							'position': 'before'
						},
						{
							'pattern': '@Components/Elements/**',
							'group': 'internal',
							'position': 'before'
						},
						{
							'pattern': '@Components/Pages/**',
							'group': 'internal',
							'position': 'before'
						},
						{
							'pattern': '@Components/EasterEggs/**',
							'group': 'internal',
							'position': 'before'
						},
						{
							'pattern': '@Composables/**',
							'group': 'internal',
							'position': 'before'
						},
						{
							'pattern': '@Plugins/*',
							'group': 'internal',
							'position': 'before'
						},
						{
							'pattern': '@Stores/**',
							'group': 'internal',
							'position': 'before'
						},
						{
							'pattern': '@Types/**',
							'group': 'type'
						},
					],
					'pathGroupsExcludedImportTypes':
						['internal'],
					'alphabetize': {
						'order': 'asc',
						'caseInsensitive': true
					}
				}
			],
			'import/prefer-default-export': 0,

			// Vue rules //
			'vue/attributes-order': ['error', {
				'alphabetical': true,
				'order': [
					'DEFINITION',
					'LIST_RENDERING',
					'CONDITIONALS',
					'RENDER_MODIFIERS',
					'GLOBAL',
					['UNIQUE', 'SLOT'],
					'TWO_WAY_BINDING',
					'OTHER_DIRECTIVES',
					'OTHER_ATTR',
					'EVENTS',
					'CONTENT',
				],
			}],
			// Replaces `vue/component-tags-order`, removed in eslint-plugin-vue v10.
			'vue/block-order': ['error', {
				'order': ['template', 'script', 'style'],
			}],
			'vue/html-closing-bracket-newline': 0,
			'vue/html-comment-content-spacing': ['error',
				'always',
			],
			'vue/html-indent': 0,
			'vue/html-self-closing': 0,
			'vue/max-attributes-per-line': 0,
			'vue/multi-word-component-names': 0,
			'vue/no-multiple-template-root': 0,
			'vue/no-template-shadow': 0,
			'vue/no-v-for-template-key-on-child': 0,
			'vue/no-v-html': 0,
			'vue/no-v-text-v-html-on-component': 0,
			'vue/order-in-components': ['error', {
				'order': [
					'el',
					'name',
					'key',
					'parent',
					'functional',
					['delimiters', 'comments'],
					['components', 'directives', 'filters'],
					'extends',
					'mixins',
					['provide', 'inject'],
					'ROUTER_GUARDS',
					'layout',
					'middleware',
					'validate',
					'scrollToTop',
					'transition',
					'loading',
					'inheritAttrs',
					'model',
					['props', 'propsData'],
					'emits',
					'setup',
					'asyncData',
					'data',
					'fetch',
					'head',
					'computed',
					'watch',
					'watchQuery',
					'beforeCreate',
					'created',
					'beforeMount',
					'mounted',
					'beforeUpdate',
					'updated',
					'activated',
					'deactivated',
					'beforeUnmount',
					'unmounted',
					'beforeDestroy',
					'destroyed',
					'renderTracked',
					'renderTriggered',
					'errorCaptured',
					'methods',
					['template', 'render'],
					'renderError',
				],
			}],
			'vue/padding-line-between-blocks': 1,
			'vue/require-name-property': 1,
			'vue/singleline-html-element-content-newline': 0,
			'vue/sort-keys': ['warn', 'asc', {
				caseSensitive: true,
				ignoreChildrenOf: ['model', 'defineProps'],
				ignoreGrandchildrenOf: ['computed', 'directives', 'inject', 'props', 'watch', 'defineProps'],
				minKeys: 2,
				natural: true,
			}],

			// TypeScript rules //
			// The base recommended set comes from `vueTsConfigs.recommended` above.
			'@typescript-eslint/ban-ts-comment': 0,
			'@typescript-eslint/no-empty-function': 0,
			'@typescript-eslint/no-empty-object-type': 0,
			'@typescript-eslint/no-explicit-any': 0,
			'@typescript-eslint/no-unsafe-assignment': 0,
			'@typescript-eslint/no-unsafe-member-access': 0,
			'@typescript-eslint/no-unused-vars': ['error', {
				argsIgnorePattern: '^_',
				caughtErrorsIgnorePattern: '^_',
				varsIgnorePattern: '^_',
			}],
		},
	},

	{
		// Plain JS is out of scope for this config -- but the typescript-eslint
		// presets would otherwise half-lint it (TS rules on, our overrides off).
		// Leave those files genuinely alone.
		name: 'app/wdns-javascript-opt-out',
		files: ['**/*.{js,cjs}'],
		languageOptions: {
			globals: {
				...globals.commonjs,
			},
		},
		rules: typescriptRulesOff,
	},
);
