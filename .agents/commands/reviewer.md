# Command: reviewer

Activate the reviewer agent role.

Steps:

1. Ask which feature to review (or review all if not specified)
2. Run through the full Review Checklist from `.agents/agents/reviewer.md`
3. Output results to `.agents/reviews/[feature]-review.md`
4. If FAIL: list required changes clearly and stop
5. If PASS: update AGENTS.md checklist item and confirm

Do not approve a feature that fails any TypeScript or test check.
