import { defineConfig } from 'vitest/config';


export default defineConfig({
	test: {
		// Fixtures are lint targets, not tests -- some are deliberately malformed
		// and a couple are named to look like spec files on purpose.
		exclude: ['**/node_modules/**', 'tests/fixtures/**'],
		include: ['tests/**/*.test.ts'],
	},
});
