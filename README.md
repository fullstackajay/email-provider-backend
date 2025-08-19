# Need more work

"rate-limiter-flexible": "^5.0.4",

- Logger
- Source map
- Database migrations not done
- Only allow relative path '@/...' in this code base to git

## Commit Message Guidelines

Clear commit messages help us track changes, generate release notes, and understand the project's history. We follow the [Conventional Commits specification](https://www.conventionalcommits.org/en/v1.0.0/).

All commit messages are automatically validated by `commitlint`.

### How to Commit

You have two main ways to create a commit message:

1.  **Using the Interactive Guide:**
    Run `pnpm cz`. This tool will prompt you step-by-step to build your commit message, helping you choose the correct type and format.

2.  **Writing Manually:**
    Use standard Git commands like `git commit` (opens your editor) or `git commit -m "docs: hello world"`. This requires you to know the format, but `commitlint` will check it for errors before the commit is finalized.

### Commit Message Format

The basic format is a **header**, optionally followed by a **body** and **footer**, separated by blank lines.

- **Header:** `type(scope): subject`
    - `type`: (Mandatory) Choose from a predefined list indicating the kind of change.
    - `(scope)`: (Optional) Briefly indicate the part of the codebase affected (e.g., `auth`, `ui`).
    - `subject`: (Mandatory) A short, imperative description (e.g., "add feature", "fix bug"). Keep it concise (under ~50 chars) and do not end with a period.

- **Body:** (Optional) Provide more details about the change – explain the 'why' rather than the 'what'. Separate from the header with a blank line. Wrap lines for readability.

- **Footer:** (Optional) Use for breaking changes (`BREAKING CHANGE:`) or referencing issues (e.g., `Closes #123`, `Fixes #456`). Separate from the body (or header) with a blank line.

### Standard Commit Types

Here are the allowed commit types and their general meaning:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting or style fixes (no code change)
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Code changes that improve performance
- `test`: Adding or correcting tests
- `build`: Changes affecting the build system or dependencies
- `ci`: Changes to CI configuration
- `chore`: Other changes that don't modify src or test files
- `revert`: Reverts a previous commit

Following these guidelines, whether using the interactive guide or writing manually, ensures a clean and informative Git history validated by `commitlint`.

## 📁 Project Structure

```bash
.
├── .editorconfig
├── .env.development
├── .env.keys
├── .env.production
├── .env.staging
├── .husky/
│   ├── commit-msg
│   └── pre-commit
├── commitlint.config.js
├── eslint.config.mjs
├── llm.txt
├── logs/
│   ├── .gitignore
│   ├── development.log
│   └── production.log
├── nginx/
│   ├── http.conf
│   └── https.conf
├── package.json
├── pnpm-lock.yaml
├── public/
│   └── .gitkeep
├── README.md
├── script/
│   ├── .gitkeep
│   └── tree.sh
├── src/
│   ├── app.ts
│   ├── config/
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   ├── env.ts
│   │   └── logger.ts
│   ├── controllers/
│   │   └── user.controller.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── globalErrorHandler.ts
│   ├── models/
│   │   └── user.model.ts
│   ├── routes/
│   │   └── user.routes.ts
│   ├── server.ts
│   ├── services/
│   │   └── user.service.ts
│   ├── utils/
│   │   ├── apiFeatures.ts
│   │   ├── appError.ts
│   │   ├── catchAsync.ts
│   │   ├── email.ts
│   │   └── token.util.ts
│   ├── validators/
│   │   └── user.validator.ts
│   └── views/
│       ├── emailVerificationCode.html
│       ├── passwordReset.html
│       ├── resetPasswordVerificationCode.html
│       ├── signInCode.html
│       └── welcome.html
├── test/
│   └── test.ts
├── tsconfig.json
├── tsup.config.ts
└── types/
    ├── express-xss-sanitizer.d.ts
    ├── express.d.ts
    └── README.md
```

## What to Do in Your Project Now?

1. No immediate code changes are required in logger.ts if you plan to use log shippers with your existing file/console JSON output. Your logger is already producing what's needed.
2. Decide on a CLM strategy:
    - Will you self-host ELK/Loki or use a SaaS?
    - How will logs be collected (agent, stdout capture, direct HTTP)?
3. If using an agent: Install and configure the agent (e.g., Filebeat) on your servers/as a sidecar to tail the JSON log files (e.g., /logs/app-_.log, /logs/error-_.log) or collect from stdout.
4. If using stdout in containers: Ensure your Docker/Kubernetes logging drivers are configured to send logs to your chosen CLM.

The key takeaway is that your current logger, by outputting structured JSON, is "CLM-ready." The next step is typically an operational one: setting up the CLM system itself and the log collection pipeline.

# To update a single package to the latest version

pnpm outdated
pnpm up zod@latest

# Websites we development

1. https://mailtrap.io/
2. Mongodb
