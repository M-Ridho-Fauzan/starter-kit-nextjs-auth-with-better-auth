# Command: write-docs

Activate the docs-writer agent role.

Steps:

1. Identify which feature was just completed (check AGENTS.md checklist
   for the most recently checked item, or ask the user)
2. Read the feature's source files from `src/`
3. Read the design doc from `.agents/decisions/[feature]-design.md`
4. Generate `docs/[feature].md` following the docs-writer agent format
5. Update `docs/index.md` table of contents
6. Confirm completion with: "Docs complete: [feature]"
