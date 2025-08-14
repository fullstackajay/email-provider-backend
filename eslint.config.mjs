import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import prettierConfig from 'eslint-config-prettier'
import { defineConfig } from 'eslint/config'
import simpleImportSort from 'eslint-plugin-simple-import-sort'

export default defineConfig([
	{
		ignores: ['dist', 'node_modules']
	},
	// Base ESLint configurations
	{
		files: ['**/*.{js,mjs,cjs,ts}'],
		plugins: { js, 'simple-import-sort': simpleImportSort },
		extends: ['js/recommended']
	},
	{ files: ['**/*.{js,mjs,cjs,ts}'], languageOptions: { globals: globals.node } },

	// TypeScript configurations with strict type checking
	{
		files: ['**/*.ts'],
		extends: [...tseslint.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: process.cwd()
			}
		},
		rules: {
			// Enforce explicit return types
			'@typescript-eslint/explicit-function-return-type': 'error',

			// Strict null checks
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-non-null-assertion': 'error',

			// Prevent potential runtime errors
			'@typescript-eslint/no-floating-promises': 'error',
			'@typescript-eslint/no-misused-promises': 'error',
			'@typescript-eslint/await-thenable': 'error',

			// Code quality
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/consistent-type-imports': 'error',
			'no-restricted-properties': [
				'error',
				{
					object: 'process',
					property: 'env',
					message:
						'Direct access to process.env is forbidden. Import configuration from src/config/env.ts instead.'
				}
			]
		}
	},

	// Override for src/config/env.ts to ALLOW process.env
	{
		files: ['src/config/env.ts'], // Be specific to your env file path
		rules: {
			'no-restricted-properties': 'off' // Turn off the restriction for this file
		}
	},

	{
		files: ['eslint.config.js', 'tsup.config.ts', '*.config.js', '*.config.ts'],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: null
			},
			globals: {
				...globals.node
			}
		},
		rules: {
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-var-requires': 'off', // Config files might use require()
			'@typescript-eslint/explicit-function-return-type': 'off',

			'no-restricted-properties': 'off' // Config files might need process.env
		}
	},

	// Prettier config must be last to disable conflicting rules
	prettierConfig
])
