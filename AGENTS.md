# Project Guidelines

- Act as a senior developer. Understand the task and root cause before editing.
- Follow the existing architecture, naming, design system and coding patterns.
- Inspect relevant files only. Keep changes focused on the requested task.
- Write simple, human-readable code that another developer can easily understand and edit.
- Use descriptive names, consistent formatting and one statement per line. Avoid compressed functions and dense nested expressions.
- Keep functions focused. Use straightforward conditions and early returns instead of unnecessary nesting or clever shortcuts.
- Reuse existing widgets, helpers, services and styles. Do not repeat the same implementation across screens.
- Extract small shared functions or components when code genuinely repeats. Keep distinct behavior explicit; avoid speculative abstractions or generic frameworks.
- Use comments to explain non-obvious intent, not to repeat the code.
- Preserve approved UI, copy and behavior during cleanup. Follow DESIGN.md; do not redesign Home or Question Bank unless explicitly requested.
- Proceed autonomously for clear, small changes using existing patterns.
- Ask before significant architecture, dependency, API/data-model, security or destructive changes, or when scope is unclear.
- Run relevant checks, review the diff and report changes and validation limits. Technical checks alone do not prove visual parity.
- Write all Markdown documentation in English.
