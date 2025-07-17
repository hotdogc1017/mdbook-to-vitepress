# mdbook-to-vitepress

A tool to migrate mdbook projects to VitePress.

English | [简体中文](README.zh-CN.md)

## Installation

```bash
npm install -g mdbook-to-vitepress
```

## Usage

### Migrate an existing mdbook project

```bash
# Full migration (including VitePress configuration and structure)
# Migrate from current directory
mdbook-to-vitepress migrate /path/to/vitepress/project

# Migrate from a specific directory
mdbook-to-vitepress migrate /path/to/vitepress/project /path/to/mdbook/project

# Convert markdown files only (from current directory)
mdbook-to-vitepress migrate /path/to/output/directory --files-only

# Convert markdown files only (from a specific directory)
mdbook-to-vitepress migrate /path/to/output/directory /path/to/mdbook/project --files-only
```

### Options

- `-p, --preserve-structure`: Preserve original directory structure
- `-n, --generate-nav`: Generate navigation menu (default: true)
- `-f, --files-only`: Convert files only, don't generate VitePress structure

## Features

- Converts mdbook `book.toml` configuration to VitePress config
- Migrates markdown files from mdbook `src/` directory
- Generates VitePress sidebar from `SUMMARY.md`
- Creates appropriate `package.json` for VitePress project
- Supports basic TOML parsing for mdbook configuration
- **Files-only mode**: Convert markdown files without generating a complete VitePress project structure
- **Static asset handling**: Processes static assets according to VitePress specifications, copying images to the `public` directory
- **Image reference conversion**: Automatically converts image references in markdown and HTML
- **Proper configuration generation**: Generates correctly formatted VitePress configuration files
- **mdBook syntax extension support**:
  - Hidden code lines (`# comment` → `// comment`) (Note: custom hide prefixes not yet supported)
  - Include files (`{{#include file.rs}}` → `<<< file.rs`)
    - Supports line ranges (`{{#include file.rs:10:20}}` → `<<< file.rs{10-20}`)
    - Supports from line to end of file (`{{#include file.rs:10}}` → `<<< file.rs{10-}`)
    - Supports from start to specific line (`{{#include file.rs::10}}` → `<<< file.rs{1-10}`)
    - Supports all mdBook anchor tag formats:
      - Direct anchors: `{{#include file.rs:component}}`
      - In code blocks: ```rust\n{{#include file.rs:component}}\n```
    - Supports both ANCHOR/ANCHOR_END and #region/#endregion comment formats for marking sections
    - Automatically extracts content from source files based on anchors
  - Rust doc comment includes (`{{#rustdoc_include file.rs}}` → `<<< file.rs`)
  - MathJax support (automatically configures VitePress)
  - HTML attributes (preserves heading IDs, adds comments for other attributes)

### File Conversion Features

When using the `--files-only` parameter, the tool will:

- Convert mdbook-specific link syntax to standard markdown format
- Convert HTML `<img>` tags to Markdown format and correct image paths
- Convert mdbook's `{{#include}}` syntax to VitePress code snippet import syntax
- Convert mdbook's alert box syntax to VitePress custom containers
- Convert quote blocks to VitePress info containers
- Process static assets according to VitePress specifications: copy images to the `public` directory
- Maintain directory structure and recursively process all files
- **Not** create VitePress configuration files or project structure

This feature is particularly useful for integrating an mdbook project as a module into an existing VitePress project, only needing to convert file content without creating a new VitePress configuration.

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run in development mode
npm run dev

# Test the CLI
npm run start migrate ./example-mdbook ./example-vitepress
```

## Project Structure

```
src/
├── cli.ts          # Command line interface
├── index.ts        # Main entry point
├── migrator.ts     # Migration logic
├── parser.ts       # mdbook configuration parser
├── converter.ts    # mdbook syntax converter (main class)
├── toml-parser.ts  # TOML parser
├── types.ts        # Type definitions
└── transformers/   # Modular Markdown transformers
    ├── index.ts                # Transformer registry and exports
    ├── types.ts                # Transformer type definitions
    ├── hidden-code-lines.ts    # Hidden code lines transformer
    ├── html-attributes.ts      # HTML attributes transformer
    ├── image-references.ts     # Image references transformer
    ├── include-files.ts        # Include files transformer
    ├── mathjax.ts              # MathJax support
    ├── quote-blocks.ts         # Quote blocks transformer
    └── rust-playground.ts      # Rust Playground integration
```

## License

MIT