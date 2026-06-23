# Command: next-task

Read AGENTS.md and PLAN.md. Identify the next unchecked item in the
Feature Implementation Checklist that has a completed design doc in
`.agents/decisions/`.

Output:

1. The next task name
2. Which design doc to read
3. Which agent role to activate (architect if no design doc, builder if design doc exists)
4. One-paragraph summary of what needs to be done

If the next task has no design doc yet, output the architect prompt
the user should paste to start the design session.

If the next task has a design doc, output the builder prompt
the user should paste to start the implementation session.
