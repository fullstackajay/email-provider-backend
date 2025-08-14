import { defineConfig } from 'tsup'

export default defineConfig(options => ({
	entry: ['src/server.ts'],
	outDir: 'dist',
	format: ['esm'],
	target: 'es2022',
	platform: 'node',
	shims: true,
	splitting: false,
	sourcemap: true,
	dts: {
		resolve: true
	},
	clean: true,
	minify: !options.watch
	// esbuildPlugins: [],    // Add any esbuild plugins if needed
}))
