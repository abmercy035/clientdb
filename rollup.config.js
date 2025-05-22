import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser'; // Corrected import for the modern plugin
import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json'; // Import package.json to get version, main, module etc.

// Define external dependencies that should not be bundled into the library
// These will be expected to be installed by the consumer of your library
const external = ['localforage', 'uuid'];

export default [
	// UMD build for browser and direct script tag use (unminified)
	{
		input: 'src/index.ts', // Your main entry file
		output: {
			name: 'localclientdb', // The global variable name when loaded via script tag
			file: pkg.browser || 'dist/localclientdb.umd.js', // Use pkg.browser if defined, or default
			format: 'umd',
			sourcemap: true,
			globals: {
				'localforage': 'localforage', // Specify the global variable for localforage
				'uuid': 'uuid' // Specify the global variable for uuid if it's external in UMD
			},
		},
		// For UMD, you might want to bundle dependencies or declare them as globals.
		// Here, we're keeping them external and expecting them to be available globally.
		external: external,
		plugins: [
			typescript({
				tsconfig: 'tsconfig.json', // Ensures Rollup uses your tsconfig
				useTsconfigDeclarationDir: true, // Tells it to put .d.ts files in declarationDir
			}),
			resolve(),   // Locates modules in node_modules
			commonjs(),  // Converts CommonJS modules to ES6
		],
	},

	// Minified UMD build
	{
		input: 'src/index.ts',
		output: {
			name: 'localclientdb',
			file: 'dist/localclientdb.umd.min.js', // Separate minified UMD file
			format: 'umd',
			sourcemap: true,
			globals: {
				'localforage': 'localforage',
				'uuid': 'uuid'
			},
		},
		external: external,
		plugins: [
			typescript({
				tsconfig: 'tsconfig.json',
				useTsconfigDeclarationDir: true,
			}),
			resolve(),
			commonjs(),
			terser({ // Minify the output
				ecma: 2020,
				compress: {
					drop_console: true, // Remove console.log statements
				},
				output: {
					comments: false, // Remove all comments
				},
			}),
		],
	},

	// ES module build (for bundlers like Webpack, Rollup, Parcel)
	{
		input: 'src/index.ts',
		output: {
			file: pkg.module || 'dist/localclientdb.esm.js', // Use pkg.module if defined, or default
			format: 'es',
			sourcemap: true,
		},
		external: external, // Mark localforage and uuid as external for ES modules
		plugins: [
			typescript({
				tsconfig: 'tsconfig.json',
				useTsconfigDeclarationDir: true,
			}),
			resolve(),
			commonjs(),
		],
	},

	// CommonJS build (for Node.js environments)
	{
		input: 'src/index.ts',
		output: {
			file: pkg.main || 'dist/localclientdb.cjs.js', // Use pkg.main if defined, or default
			format: 'cjs',
			sourcemap: true,
		},
		external: external, // Mark localforage and uuid as external for CommonJS
		plugins: [
			typescript({
				tsconfig: 'tsconfig.json',
				useTsconfigDeclarationDir: true,
			}),
			resolve(),
			commonjs(),
		],
	}
];
