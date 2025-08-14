import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url' // For ES modules to get __dirname equivalent
import { minimatch } from 'minimatch'

// --- Script Configuration ---
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename) // This is the myAIScript directory

// ROOT_DIR is the parent directory of where the script resides (i.e., your project root that you want to document)
const ROOT_DIR = path.resolve(__dirname, '..')
const SCRIPT_FOLDER_NAME = path.basename(__dirname) // This will be 'myAIScript'
const OUTPUT_FILE_NAME = 'backend.txt'
// Output file will now be created inside the myAIScript folder
const OUTPUT_FILE_PATH = path.join(__dirname, OUTPUT_FILE_NAME)

// Helper to convert paths to POSIX style (uses /) for consistent glob matching
function toPosixPath(p) {
	return p.split(path.sep).join('/')
}

// --- Filter Configurations ---

// 1. PATTERNS FOR EXCLUDING ITEMS FROM THE FILE/FOLDER STRUCTURE VIEW
//    These patterns are matched against paths relative to ROOT_DIR.
//    If a file/folder matches these, it's also excluded from content.
//    To match a name globally (e.g., all '.DS_Store' files), append '--' (e.g., '.DS_Store--').
const STRUCTURE_EXCLUDE_PATTERNS = [
	'node_modules', // General node_modules in the project being documented (top-level)
	'.git', // Top-level .git directory
	'dist', // Top-level dist directory
	'.next', // Top-level .next directory
	'.webpack-cache', // Top-level .webpack-cache
	'.vscode', // Top-level .vscode directory
	'android', // Typical mobile project folders (top-level)
	'ios', // Typical mobile project folders (top-level)
	'.expo', // Expo-specific folder (top-level)
	'.DS_Store--', // To exclude all .DS_Store files (now using the global match)
	'.github', // Top-level .github directory
	'.gitignore', // Top-level .gitignore file
	'.prettierignore', // Top-level .prettierignore file
	'.prettierrc', // Top-level .prettierrc file
	'.husky/_',
	SCRIPT_FOLDER_NAME // Exclude the script's own folder from structure and content
]

// 2. PATTERNS FOR ALWAYS EXCLUDING CONTENT (even if not in STRUCTURE_EXCLUDE_PATTERNS)
//    These patterns are matched against paths relative to ROOT_DIR.
const ALWAYS_EXCLUDE_CONTENT_PATTERNS = [
	'**/*.lock', // e.g., package-lock.json, yarn.lock
	'logs',
	'**/*.png',
	'**/*.jpg',
	'**/*.jpeg',
	'**/*.gif',
	'**/*.ico',
	'**/*.webp',
	'**/*.mp3',
	'**/*.wav',
	'**/*.ogg',
	'**/*.aac',
	'**/*.mp4',
	'**/*.webm',
	'**/*.mov',
	'**/*.avi',
	'**/*.mkv',
	'**/*.pdf',
	'**/*.doc',
	'**/*.docx',
	'**/*.xls',
	'**/*.xlsx',
	'**/*.ppt',
	'**/*.pptx',
	'**/*.zip',
	'**/*.tar',
	'**/*.gz',
	'**/*.rar',
	'**/*.7z',
	'**/*.exe',
	'**/*.dll',
	'**/*.so',
	'**/*.dylib',
	'**/*.app',
	'**/*.dmg',
	'.env*', // .env, .env.local, .env.production
	'**/.*.env', // .local.env inside a folder
	'*.env.*', // production.env
	'.idea', // IntelliJ IDEA project files
	'**/.project',
	'**/.classpath',
	'**/*.iml',
	SCRIPT_FOLDER_NAME + '/**' // Ensures all sub-content of script folder is out
]

// 3. PATTERNS FOR INCLUDING CONTENT (Takes precedence over EXCLUDE_CONTENT_PATTERNS if this list is not empty)
//    Paths are relative to ROOT_DIR.
const INCLUDE_CONTENT_PATTERNS = [
	// Example:
	// "src/controllers", // Includes files directly in 'src/controllers'. For recursive, use "src/controllers/**".
	// "package.json",    // Includes package.json at the root.
	// "utils.js",        // Includes all files named utils.js, wherever they are.
	// "app/services/**", // Includes all files under app/services and its subfolders.
	// "app/(tabs)",      // Should include files directly in 'app/(tabs)', e.g., 'app/(tabs)/_layout.tsx'.
	// For recursive inclusion of 'app/(tabs)' contents, use "app/(tabs)/**".
	// 'components/eventGenerator/**',
	// 'pages/events/generate.jsx',
	// 'pages/events/generate.module.scss',
	// 'package.json',
	// 'pages/[username]/[slug]/index.jsx',
	// 'auth',
	// 'show',
	// 'package.json'
]

// 4. PATTERNS FOR EXCLUDING CONTENT (used if INCLUDE_CONTENT_PATTERNS is empty and not caught by ALWAYS_EXCLUDE or STRUCTURE_EXCLUDE)
//    Active if length > 1. Paths are relative to ROOT_DIR.
const EXCLUDE_CONTENT_PATTERNS = [
	'dev-data',
	'public', // Often contains static assets not needed for code understanding
	'counter.json',
	'Dockerfile',
	'config.env',
	'instrumentation.js',
	'playwright.config.js',
	'README.md', // READMEs can be very long, consider if their full content is needed
	'tests', // Or 'test', depending on project structure
	'background.js', // Example specific file
	'package-lock.json', // Though caught by **/*.lock, explicit is fine
	'pnpm-lock.yaml',
	'.editorconfig',
	'README.md',
	'.prettierrc',
	'.prettierignore',
	'.gitignore',
	'src/views',
	'commitlint.config.js',
	'**/*.ttf', // Font files
	'assets/**' // Example: exclude all content from an 'assets' directory
]

// --- Matching Helper Functions ---

// General purpose matcher, used by ALWAYS_EXCLUDE and EXCLUDE_CONTENT_PATTERNS
function matchesSmart(filePath, pattern) {
	// filePath is expected to be a POSIX relative path
	const isSimplePathPattern = !/[*{?[\],()|!@+]/.test(pattern)
	const patternHasExtension = path.posix.extname(pattern) !== ''

	if (isSimplePathPattern && !patternHasExtension) {
		if (filePath === pattern) return true // Exact match for folder name itself (if it were a file)
		if (filePath.startsWith(pattern + '/')) return true // File is inside the folder
		return false
	} else {
		// For glob patterns or patterns with extensions
		return minimatch(filePath, pattern, { dot: true })
	}
}

// Matcher for STRUCTURE_EXCLUDE_PATTERNS, supports '--' suffix for global basename match
function matchesStructureExclusion(filePath, pattern) {
	// filePath is expected to be a POSIX relative path
	if (pattern.endsWith('--')) {
		const corePattern = pattern.slice(0, -2)
		return path.posix.basename(filePath) === corePattern
	}
	// MODIFIED: Corrected regex for glob character detection
	if (/[*?{}[\]()|!@+]/.test(pattern)) {
		// Check if it's a glob (removed unnecessary escapes for [])
		return minimatch(filePath, pattern, { dot: true })
	}
	// Simple path prefix match (e.g., "node_modules" matches "node_modules/somefile")
	return filePath === pattern || filePath.startsWith(pattern + '/')
}

// Matcher for INCLUDE_CONTENT_PATTERNS
function matchesIncludePattern(relativePosixPath, pattern) {
	const posixPattern = toPosixPath(pattern) // Ensure pattern uses POSIX separators

	// 1. Direct Glob Match (if pattern contains common glob characters like *, **, ?, or typical extglob chars)
	//    Handles patterns like "app/**/*", "*.jsx", "src/**/tests/*.js"
	//    The regex aims to catch most common glob syntaxes to pass to minimatch.
	// MODIFIED: Corrected regex for glob character detection
	if (/[*?{}[\]()|!@+]/.test(posixPattern) && posixPattern.includes('*')) {
		// Made glob detection more reliant on '*' for safety, or other strong glob chars.
		// Parentheses alone won't trigger glob mode unless with other glob chars.
		return minimatch(relativePosixPath, posixPattern, { dot: true })
	}

	// 2. Exact file path match OR file is directly inside the specified folder path
	//    Pattern: "app/content/index.jsx" -> matches "app/content/index.jsx"
	//    Pattern: "app/components" -> matches "app/components/foo.js" (file in folder)
	//    Pattern: "app" -> matches "app/foo.js" (file in folder)
	//    Pattern: "app/(tabs)" -> should match "app/(tabs)/file.js"
	if (relativePosixPath === posixPattern || relativePosixPath.startsWith(posixPattern + '/')) {
		return true
	}

	// 3. File name match (if pattern has no slashes, treat as basename to match anywhere)
	//    Pattern: "index.jsx" -> matches "app/index.jsx", "src/components/index.jsx"
	if (!posixPattern.includes('/')) {
		if (path.posix.basename(relativePosixPath) === posixPattern) {
			return true
		}
	}

	return false
}

// --- Core Logic ---

function generateDirectoryStructureRecursive(
	currentDir,
	rootDirForRelative,
	prefix,
	currentAllFilePaths,
	structureExcludePatternsList,
	outputStream
) {
	try {
		const entries = fs.readdirSync(currentDir, { withFileTypes: true })
		const sortedEntries = [...entries.filter(e => e.isDirectory()), ...entries.filter(e => e.isFile())].sort(
			(a, b) => a.name.localeCompare(b.name)
		)

		const filteredEntries = sortedEntries.filter(entry => {
			const entryPath = path.join(currentDir, entry.name)
			const relativeEntryPath = toPosixPath(path.relative(rootDirForRelative, entryPath))
			return !structureExcludePatternsList.some(p => matchesStructureExclusion(relativeEntryPath, p))
		})

		filteredEntries.forEach((entry, index) => {
			const entryPath = path.join(currentDir, entry.name)
			const isLast = index === filteredEntries.length - 1
			const connector = isLast ? '└── ' : '├── '

			if (entry.isDirectory()) {
				outputStream.write(`${prefix}${connector}${entry.name}/\n`)
				generateDirectoryStructureRecursive(
					entryPath,
					rootDirForRelative,
					prefix + (isLast ? '    ' : '│   '),
					currentAllFilePaths,
					structureExcludePatternsList,
					outputStream
				)
			} else if (entry.isFile()) {
				outputStream.write(`${prefix}${connector}${entry.name}\n`)
				currentAllFilePaths.push(entryPath) // Store absolute path
			}
		})
	} catch (error) {
		outputStream.write(`${prefix}└── [Error reading: ${path.basename(currentDir)} - ${error.message}]\n`)
	}
}

function shouldIncludeFileContent(relativePosixPath) {
	// Priority 0: If excluded by STRUCTURE_EXCLUDE_PATTERNS, its content is also excluded.
	if (STRUCTURE_EXCLUDE_PATTERNS.some(pattern => matchesStructureExclusion(relativePosixPath, pattern))) {
		return false
	}

	// Priority 1: Always Exclude (these should ALWAYS be out, regardless of includes)
	if (
		ALWAYS_EXCLUDE_CONTENT_PATTERNS.some(
			pattern => matchesSmart(relativePosixPath, pattern) // Using existing matchesSmart for this list
		)
	) {
		return false
	}

	// Priority 2: Explicit Includes
	const useExplicitIncludes = INCLUDE_CONTENT_PATTERNS.length > 0
	if (useExplicitIncludes) {
		// If this list is active, a file MUST match one of these patterns to be included.
		// EXCLUDE_CONTENT_PATTERNS is ignored if this list is active.
		return INCLUDE_CONTENT_PATTERNS.some(
			pattern => matchesIncludePattern(relativePosixPath, pattern) // Use the new matching logic
		)
	}

	// Priority 3: Explicit Excludes (only if explicit includes are NOT used)
	// This section is reached only if INCLUDE_CONTENT_PATTERNS is empty.
	const useExplicitExcludes = EXCLUDE_CONTENT_PATTERNS.length > 1
	if (useExplicitExcludes) {
		if (
			EXCLUDE_CONTENT_PATTERNS.some(
				pattern => matchesSmart(relativePosixPath, pattern) // Using existing matchesSmart for this list
			)
		) {
			return false
		}
		return true // If not excluded by explicit excludes, and includes are not active, then include.
	}

	// Priority 4: Default Behavior (if INCLUDE_CONTENT_PATTERNS is empty, and EXCLUDE_CONTENT_PATTERNS is not active/didn't match)
	return true
}

async function createProjectOverview() {
	const outputStream = fs.createWriteStream(OUTPUT_FILE_PATH)
	const collectedFilePaths = []

	outputStream.write('File and Folder structure\n\n```bash\n.\n')

	generateDirectoryStructureRecursive(
		ROOT_DIR,
		ROOT_DIR,
		'',
		collectedFilePaths,
		STRUCTURE_EXCLUDE_PATTERNS,
		outputStream
	)

	outputStream.write('```\n\n')
	outputStream.write('File content.\n\n')

	let includedContentCount = 0

	for (const absoluteFilePath of collectedFilePaths) {
		const relativeFilePath = path.relative(ROOT_DIR, absoluteFilePath)
		const posixRelativePath = toPosixPath(relativeFilePath)

		if (shouldIncludeFileContent(posixRelativePath)) {
			try {
				outputStream.write(`${posixRelativePath}\n`)
				outputStream.write(`---- ${posixRelativePath} Content starts ----\n`)
				const fileStream = fs.createReadStream(absoluteFilePath, {
					encoding: 'utf-8'
				})
				for await (const chunk of fileStream) {
					outputStream.write(chunk)
				}
				outputStream.write('\n')
				outputStream.write(`---- ${posixRelativePath} Content ends ----\n\n`)
				includedContentCount++
			} catch (readError) {
				outputStream.write(`${posixRelativePath}\n`)
				outputStream.write(`---- ${posixRelativePath} Content starts ----\n`)
				outputStream.write(`[Error reading content: ${readError.message}]\n`)
				outputStream.write(`---- ${posixRelativePath} Content ends ----\n\n`)
			}
		}
	}

	if (includedContentCount === 0 && collectedFilePaths.length > 0) {
		let noContentMessage = '[No files matched the content inclusion criteria or all were filtered out.]\n' // Default message
		if (INCLUDE_CONTENT_PATTERNS.length > 0) {
			noContentMessage =
				'[Warning: INCLUDE_CONTENT_PATTERNS was used, but no files matched the specified inclusion patterns after other filters (structure/always exclude) were applied.]\n'
		} else if (
			// This block executes if INCLUDE_CONTENT_PATTERNS is empty
			STRUCTURE_EXCLUDE_PATTERNS.length > 0 ||
			ALWAYS_EXCLUDE_CONTENT_PATTERNS.length > 0 ||
			EXCLUDE_CONTENT_PATTERNS.length > 1
		) {
			noContentMessage =
				'[No files matched the content inclusion criteria or all were filtered out by other exclusion rules.]\n'
		} else {
			// INCLUDE_CONTENT_PATTERNS is empty AND no other major filters were active
			noContentMessage = '[No readable files found or all were empty (and no specific filters applied).]\n'
		}
		outputStream.write(noContentMessage)
	} else if (collectedFilePaths.length === 0) {
		// This means structure scan found nothing
		outputStream.write('[No files found in the specified directory (after structure exclusions).]\n')
	}

	outputStream.end(() => {
		console.log(`Successfully created ${OUTPUT_FILE_NAME} in ${__dirname} with project overview.`)
		console.log(`${includedContentCount} files' content included.`)
	})

	outputStream.on('error', err => {
		console.error(`Error writing output file ${OUTPUT_FILE_NAME} to ${OUTPUT_FILE_PATH}:`, err)
	})
}

createProjectOverview()
