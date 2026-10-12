## Story

FLZ-<id>: <title> (see [docs/backlog.md](../blob/main/docs/backlog.md))

## Summary

<!-- What changed and why. Keep it short. -->

## Acceptance criteria

<!-- Copy the story's acceptance criteria from docs/backlog.md and tick each one. -->

- [ ] AC 1
- [ ] AC 2

## Test evidence

<!-- Commands run and their result, test output, or links to CI runs. -->

## Screenshots (UI)

<!-- Before/after screenshots for any UI change. Delete this section if not applicable. -->

## Definition of Done

See [docs/definition-of-done.md](../blob/main/docs/definition-of-done.md).

- [ ] Acceptance criteria met and demonstrated
- [ ] Unit tests added for new logic; e2e test for new user flows; all tests green
- [ ] `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` pass locally and in CI
- [ ] `qa-tester` review: `VERDICT: APPROVE` (security audit included for auth, cron, or input-handling changes)
- [ ] `ui-ux` review: `VERDICT: APPROVE` (stories touching UI)
- [ ] Docs updated (requirements, architecture, ADR, design system) when behavior or design changed
- [ ] Vercel preview deployment checked
- [ ] Conventional Commit messages; PR title includes the story ID; squash-merged into `main`
