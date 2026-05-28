# E2E Test Structure

## Folder layout

- `e2e/fixtures`: environment/config helpers.
- `e2e/pages`: page objects for reusable UI flows.
- `e2e/specs/smoke`: fast checks for critical page rendering.
- `e2e/specs/auth`: authentication and protected-route flows.

## Environment variables

Create a local shell env (or CI secrets) for authenticated tests:

- `E2E_EMAIL`
- `E2E_PASSWORD`
- `E2E_BASE_URL` (optional, defaults to `https://development.web-attendix.razz-dev.com`)
- `PW_USE_LOCAL_WEBSERVER=true` (optional; starts Angular dev server at `http://127.0.0.1:4200`)

## Commands

- `npm run e2e`
- `npm run e2e:ui`
- `npm run e2e:debug`
- `npm run e2e:report`

## Notes

- `login-flow.spec.ts` auto-skips when login credentials are not provided.
- Keep selectors stable by preferring `getByRole`, `getByLabel`, and `data-testid` for dynamic elements.
