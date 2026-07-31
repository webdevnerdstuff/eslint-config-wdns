import { beforeAll, describe, expect, it } from 'vitest';
import { builtinRules } from 'eslint/use-at-your-own-risk';
import { ESLint } from 'eslint';
import config from '../index.mjs';


// -- helpers ----------------------------------------------------------------

/** The config entries this package defines itself, as opposed to preset ones. */
const OUR_CONFIGS = ['app/wdns-files-to-lint', 'app/wdns-javascript-opt-out'];

const FIXTURES = new URL('./fixtures/', import.meta.url).pathname;

/** Every plugin registered anywhere in the exported config, keyed by prefix. */
const registeredPlugins = Object.assign({}, ...config.map((entry) => entry?.plugins ?? {}));

/** Resolve a configured rule id to its module, or null if it does not exist. */
function resolveRule(ruleId: string) {
	if (!ruleId.includes('/')) {
		return builtinRules.get(ruleId) ?? null;
	}

	// Plugin prefixes may themselves contain a slash (`@scope/plugin/rule`).
	const lastSlash = ruleId.lastIndexOf('/');
	const prefix = ruleId.slice(0, lastSlash);
	const name = ruleId.slice(lastSlash + 1);

	return registeredPlugins[prefix]?.rules?.[name] ?? null;
}

/** The rule ids this config sets itself, ignoring those inherited from presets. */
function ourRuleIds(): string[] {
	return config
		.filter((entry) => OUR_CONFIGS.includes(entry?.name))
		.flatMap((entry) => Object.keys(entry.rules ?? {}));
}

let linter: ESLint;

/** Lint one fixture file and return the rule ids it reported. */
async function rulesFiredFor(fixture: string): Promise<string[]> {
	const [result] = await linter.lintFiles(`${FIXTURES}${fixture}`);

	// Surface parse errors loudly -- they have a null ruleId and would otherwise
	// look like "no rules fired".
	const fatal = result.messages.filter((m) => m.fatal);
	if (fatal.length) {
		throw new Error(`${fixture} failed to parse: ${fatal.map((m) => m.message).join('; ')}`);
	}

	return result.messages.map((m) => m.ruleId as string);
}

beforeAll(() => {
	linter = new ESLint({
		cwd: FIXTURES,
		overrideConfig: config,
		overrideConfigFile: true,
	});
});


// -- config shape -----------------------------------------------------------

describe('config shape', () => {
	it('exports a spreadable array so consumers can do [...wdnsConfig]', () => {
		expect(Array.isArray(config)).toBe(true);
		expect(config.length).toBeGreaterThan(0);
	});

	it('contains only flat config objects', () => {
		for (const entry of config) {
			expect(entry, 'entries must be objects').toBeTypeOf('object');
			expect(entry).not.toBeNull();
			expect(Array.isArray(entry), 'nested arrays must be flattened').toBe(false);
		}
	});

	it('registers each plugin under exactly one prefix', () => {
		// Guards the v1 bug where eslint-plugin-vue was registered as both
		// `vue` and `pluginVue`.
		const seen = new Map<string, string>();

		for (const entry of config) {
			for (const [prefix, plugin] of Object.entries(entry?.plugins ?? {})) {
				const name = (plugin as { meta?: { name?: string } })?.meta?.name;
				if (!name) {
					continue;
				}

				expect(seen.get(name) ?? prefix, `${name} registered twice`).toBe(prefix);
				seen.set(name, prefix);
			}
		}
	});

	it('keeps import-x under the `import` prefix so consumer overrides keep working', () => {
		expect(registeredPlugins.import?.meta?.name).toBe('eslint-plugin-import-x');
	});
});


// -- rule integrity ---------------------------------------------------------
// These would have caught `vue/component-tags-order` being removed in
// eslint-plugin-vue v10, which silently broke the v1 config.

describe('rule integrity', () => {
	it('every configured rule exists in a registered plugin', () => {
		expect(ourRuleIds().filter((id) => resolveRule(id) === null)).toEqual([]);
	});

	it('configures no deprecated rule', () => {
		expect(ourRuleIds().filter((id) => resolveRule(id)?.meta?.deprecated)).toEqual([]);
	});

	it('configures no core formatting rule (those moved to @stylistic in v2)', () => {
		const core = ourRuleIds()
			.filter((id) => !id.includes('/'))
			.filter((id) => builtinRules.get(id)?.meta?.deprecated);

		expect(core).toEqual([]);
	});
});


// -- behaviour --------------------------------------------------------------

describe('typescript', () => {
	it('reports nothing for compliant source', async () => {
		expect(await rulesFiredFor('clean.ts')).toEqual([]);
	});

	it('enforces the stylistic rules', async () => {
		expect(await rulesFiredFor('dirty.ts')).toEqual(
			expect.arrayContaining([
				'@stylistic/indent',
				'@stylistic/quotes',
				'@stylistic/semi',
				'@stylistic/space-before-function-paren',
			]),
		);
	});

	it('enforces import/order', async () => {
		expect(await rulesFiredFor('order.ts')).toContain('import/order');
	});

	it('allows _-prefixed unused vars', async () => {
		expect(await rulesFiredFor('underscore.ts')).not.toContain('@typescript-eslint/no-unused-vars');
	});

	// Regression: v2.0.0 re-enabled the core rule, which reports every named
	// parameter in an interface method signature as unused. Unused-variable
	// checking belongs to @typescript-eslint/no-unused-vars alone.
	it('leaves the core no-unused-vars off so declaration contexts are not flagged', async () => {
		expect(await rulesFiredFor('interface.ts')).toEqual([]);
	});

	it('does not enable both no-unused-vars implementations at once', async () => {
		const active = await linter.calculateConfigForFile(`${FIXTURES}clean.ts`);
		const severity = (v: unknown) => (Array.isArray(v) ? v[0] : v);

		expect(severity(active.rules['no-unused-vars'])).toBe(0);
		expect(severity(active.rules['@typescript-eslint/no-unused-vars'])).toBe(2);
	});
});

describe('vue', () => {
	it('reports nothing for compliant source', async () => {
		expect(await rulesFiredFor('Good.vue')).toEqual([]);
	});

	it('enforces vue/block-order (which replaced vue/component-tags-order)', async () => {
		expect(await rulesFiredFor('Bad.vue')).toContain('vue/block-order');
	});
});

describe('javascript', () => {
	// Regression guard: .mjs sat outside the `files` glob until v2.
	it('lints .mjs with the stylistic rules', async () => {
		expect(await rulesFiredFor('dirty.mjs')).toEqual(
			expect.arrayContaining(['@stylistic/quotes', '@stylistic/semi']),
		);
	});

	it('reports nothing for compliant .mjs', async () => {
		expect(await rulesFiredFor('clean.mjs')).toEqual([]);
	});

	it('leaves plain .js alone', async () => {
		expect(await rulesFiredFor('plain.js')).toEqual([]);
	});

	it('allows require() in .cjs', async () => {
		expect(await rulesFiredFor('legacy.cjs')).toEqual([]);
	});

	// The typescript-eslint presets ship unscoped, so their rules reach files
	// this config never opts in. None may survive there.
	it.each(['vite.config.js', 'tailwind.config.cjs'])('applies no typescript-eslint rule to %s', async (file) => {
		const active = await linter.calculateConfigForFile(`${FIXTURES}${file}`);
		const leaked = Object.entries(active.rules)
			.filter(([id]) => id.startsWith('@typescript-eslint/'))
			.filter(([, value]) => (Array.isArray(value) ? value[0] : value) !== 0)
			.map(([id]) => id);

		expect(leaked).toEqual([]);
	});
});

describe('ignores', () => {
	it.each([
		'dist/bundle.ts',
		'coverage/report.ts',
		'thing.spec.ts',
		'old.bk.vue',
	])('ignores %s', async (path) => {
		expect(await linter.isPathIgnored(`${FIXTURES}${path}`)).toBe(true);
	});
});
