# Definition of Done

A story is done only when **all** are true:

1. Acceptance criteria met and demonstrated.
2. Unit tests added for new logic; e2e test for new user flows. All tests green.
3. `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` pass locally and in CI.
4. `qa-tester` review: `VERDICT: APPROVE` (security audit included for auth, cron, or input-handling changes).
5. `ui-ux` review: `VERDICT: APPROVE` for any story touching UI.
6. Docs updated (requirements, architecture, ADR, design system) when behavior or design changed.
7. Vercel preview deployment checked.
8. Conventional Commit messages; PR squash-merged into `main` with the story ID in the title.

# Definition of Ready
A story enters a sprint only when it has: an ID, a user-story sentence, testable acceptance criteria, an estimate (story points), and no unresolved blockers.
