export default {
	// Extend the standard conventional commit config.
	// This brings in a set of widely accepted rules for formatting.
	extends: ['@commitlint/config-conventional'],

	// Add or override rules from the extended config.
	rules: {
		// Enforce the commit type (e.g., feat, fix, chore) to be one of these values.
		// This list overrides the default list provided by config-conventional.
		'type-enum': [
			2, // Level: Error (commit will fail)
			'always', // Applicability: Must be present
			['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert', 'update'] // Standard conventional commit types + 'init' is common
		],

		// Subject rules:
		'subject-empty': [2, 'never'], // Subject must not be empty
		'subject-full-stop': [2, 'never', '.'], // Subject must not end with a period
		'subject-case': [
			2,
			'always',
			'lower-case' // Enforce lowercase first letter for imperative mood (e.g., "add feature")
			// Alternative: 'sentence-case' if you prefer "Add feature" style
		],
		'header-max-length': [2, 'always', 60], // Header (subject line) max length (common limit: 50 or 72)

		// Body rules (optional, but good practice for detailed commits):
		'body-leading-blank': [2, 'always'], // Require a blank line between subject and body
		'body-max-line-length': [2, 'always', 72], // Max line length for the body (common: 72 or 100)

		// Footer rules (optional, used for BREAKING CHANGE or issue references):
		'footer-leading-blank': [2, 'always'], // Require a blank line between body/subject and footer
		'footer-max-line-length': [2, 'always', 72] // Max line length for the footer (common: 72 or 100)

		// Scope rules (optional, depends on if you use scopes like feat(auth):):
		// 'scope-case': [2, 'always', 'kebab-case'], // e.g., feat(authentication) -> feat(authentication)
		// 'scope-empty': [2, 'never'], // Require a scope (if your team mandates scopes)
		// 'scope-enum': [2, 'always', ['auth', 'user', 'product', 'order']] // Define allowed scopes
	}
}
