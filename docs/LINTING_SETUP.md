# Linting Setup Documentation

## Overview

This project uses a comprehensive linting system with ESLint, Prettier, and Husky to maintain code quality and consistency.

## Tools Used

### 1. ESLint
- **Version**: 9.31.0
- **Configuration**: Modern flat config (`eslint.config.mjs`)
- **Plugins**:
  - `@eslint/js` - Base JavaScript rules
  - `typescript-eslint` - TypeScript support
  - `eslint-plugin-import` - Import/export rules
  - `eslint-plugin-react` - React-specific rules
  - `eslint-plugin-security` - Security best practices
  - `eslint-plugin-unicorn` - Additional best practices
  - `eslint-plugin-sonarjs` - Code quality rules
  - `eslint-plugin-prettier` - Prettier integration
  - `eslint-plugin-unused-imports` - Remove unused imports

### 2. Prettier
- **Version**: 3.6.2
- **Configuration**: `.prettierrc`
- **Plugins**:
  - `prettier-plugin-tailwindcss` - Tailwind CSS class sorting

### 3. Husky
- **Version**: 9.1.7
- **Purpose**: Git hooks for pre-commit quality checks

### 4. lint-staged
- **Version**: 15.5.2
- **Purpose**: Run linters on staged files only

## Configuration Files

### ESLint Configuration (`eslint.config.mjs`)
- Modern flat configuration format
- Comprehensive rule set for code quality
- Special exceptions for complex files (API routes, services)
- TypeScript and React optimizations

### Prettier Configuration (`.prettierrc`)
- Consistent code formatting
- Tailwind CSS class sorting
- 120 character line width
- Double quotes for strings

### Ignore Files
- `.eslintignore` - Files/directories to exclude from ESLint
- `.prettierignore` - Files/directories to exclude from Prettier

## Available Scripts

### Linting Scripts
```bash
# Basic linting
npm run lint

# Lint with auto-fix
npm run lint:fix

# Strict linting (no warnings allowed)
npm run lint:strict

# Type checking
npm run type-check

# Complete quality check
npm run quality-check
```

### Formatting Scripts
```bash
# Format all files
npm run format

# Check formatting without changes
npm run format:check

# Format and fix linting issues
npm run format:fix
```

## Pre-commit Hooks

The project uses Husky to run quality checks before commits:

1. **Pre-commit Hook** (`.husky/pre-commit`):
   - Generates theme presets
   - Runs lint-staged on staged files
   - Ensures code quality before commits

2. **lint-staged Configuration**:
   - Runs ESLint with auto-fix on staged JS/TS files
   - Runs Prettier on staged files
   - Formats JSON, MD, YAML files

## Rule Categories

### Code Quality Rules
- **Complexity**: Max 10 (relaxed for complex files)
- **Line Limits**: Max 300 lines (relaxed for complex files)
- **Depth**: Max 4 levels (relaxed for complex files)
- **Naming**: kebab-case for files, PascalCase for components

### Import/Export Rules
- **Order**: Built-in → External → Internal → Parent → Sibling → Index
- **Grouping**: React and Next.js imports first
- **Spacing**: Newlines between groups
- **Alphabetization**: Case-insensitive

### TypeScript Rules
- **Nullish Coalescing**: Prefer `??` over `||`
- **Type Assertions**: Warn on unnecessary assertions
- **Any Usage**: Warn on `any` type usage
- **Unused Variables**: Warn on unused variables

### React Rules
- **JSX Pascal Case**: Components must be PascalCase
- **Nested Components**: Prevent unstable nesting
- **Context Values**: Ensure memoized context values
- **Array Keys**: Warn on array index keys

### Security Rules
- **Object Injection**: Warn on potential injection
- **Regex Safety**: Warn on unsafe regex patterns
- **Non-literal Regex**: Warn on dynamic regex

## File-Specific Exceptions

### Complex Files (Rules Relaxed)
- API routes (`src/app/api/**/**/*.ts`)
- Service files (`src/lib/services/**/*.ts`)
- Complex utilities (`src/lib/instagram-downloader.ts`, etc.)
- Script generation files (`src/lib/script-generation/**/*.ts`)

### Data Files
- `src/data/**/*.ts` - Relaxed security rules
- `src/types/**/*.ts` - Relaxed TypeScript rules

## Ignored Files/Directories

### ESLint Ignores
- `node_modules/`, `.next/`, `out/`, `build/`, `dist/`
- Configuration files (`*.config.ts`, `*.config.mjs`)
- UI components (`src/components/ui/`)
- Generated files (`src/types/preferences/theme.ts`)

### Prettier Ignores
- Build outputs and dependencies
- Configuration files
- Documentation and media files
- Git and Husky directories

## Best Practices

### For Developers
1. **Run Quality Checks**: Use `npm run quality-check` before pushing
2. **Auto-fix Issues**: Use `npm run format:fix` to fix formatting and linting
3. **Pre-commit**: Let Husky handle pre-commit quality checks
4. **Type Safety**: Run `npm run type-check` for TypeScript validation

### For Complex Files
- API routes and services have relaxed complexity rules
- Use comments to explain complex logic
- Consider breaking down large functions
- Document complex business logic

### For New Files
- Follow the established naming conventions
- Use proper import ordering
- Include proper TypeScript types
- Follow React best practices

## Troubleshooting

### Common Issues
1. **Import Resolution**: Check TypeScript path mapping in `tsconfig.json`
2. **Prettier Conflicts**: Run `npm run format:fix` to resolve
3. **Complexity Warnings**: Consider refactoring or adding file exceptions
4. **Type Errors**: Run `npm run type-check` for detailed TypeScript errors

### Performance
- ESLint uses flat config for better performance
- Prettier runs only on staged files in pre-commit
- TypeScript checking is separate from linting

## Integration with IDEs

### VS Code
- Install ESLint and Prettier extensions
- Enable "Format on Save" with Prettier
- Enable "Fix on Save" with ESLint

### Other IDEs
- Configure ESLint and Prettier plugins
- Set up format on save
- Use project-specific settings

## Continuous Integration

The linting system is designed to work with CI/CD:
- `npm run quality-check` for CI validation
- `npm run lint:strict` for zero-tolerance environments
- `npm run type-check` for TypeScript validation

## Maintenance

### Updating Rules
1. Modify `eslint.config.mjs` for ESLint rules
2. Update `.prettierrc` for formatting rules
3. Test with `npm run quality-check`
4. Update documentation

### Adding New Plugins
1. Install the plugin package
2. Add to ESLint configuration
3. Configure rules as needed
4. Update documentation

### Performance Optimization
- Monitor linting times
- Consider excluding more files if needed
- Use targeted linting for specific directories 