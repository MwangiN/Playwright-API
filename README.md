# SauceDemo Login Tests (Playwright + TypeScript)

Functional login test suite for https://www.saucedemo.com/.

## Getting started
```bash
npm install
npx playwright install chromium
npm test                # run all tests
npm run test:smoke      # run @smoke subset
npm run test:headed     # watch the browser
npm run report          # open HTML report
npm run test:allure     # run tests + generate Allure report
npm run allure:open     # open the Allure report
npm run typecheck       # TypeScript check
```

> **Run commands from the repo root** (the folder containing `playwright.config.ts`). Running from `tests/` or another folder skips the config, so `baseURL` is missing and you get `page.goto: Cannot navigate to invalid URL`.

Optional environment variables (via shell or a `.env` file): `BASE_URL` (default `https://www.saucedemo.com`), `SAUCE_PASSWORD` (default `secret_sauce`, the public demo password).

## Structure
```
pages/          Page objects: LoginPage, InventoryPage
fixtures/       Custom Playwright fixtures that inject page objects
test-data/      Users and expected error messages
tests/          login.spec.ts
playwright.config.ts
```

## Test coverage (19 tests)

| Area | Scenarios | Why |
|---|---|---|
| Successful login | Standard user lands on inventory (`@smoke`); problem, performance_glitch, error and visual users can log in; session persists after reload | Confirms the happy path for every accepted account type, and that the session survives a refresh |
| Failed login | Locked-out user (`@smoke`); wrong password; unknown username; case-sensitive username; empty form; missing username; missing password; error banner can be dismissed; SQL-injection-style input | Covers each validation message and the negative paths users and attackers are most likely to hit |
| Form behaviour | Password field is masked; Enter key submits | Basic security and usability expectations of a login form |
| Access control & logout | Unauthenticated access to `/inventory.html` redirects to login with an error; logout returns to login and back-navigation does not restore the session (`@smoke`) | Verifies that protected pages are actually protected and that logout ends the session |

Out of scope: cart, checkout, sorting and other post-login features.

## Design decisions and reasons

- **Page Object Model**: locators and actions live in one place, so a UI change means one fix, not many. Assertions stay in the specs so tests read as intent.
- **Custom fixtures**: `loginPage` (pre-navigated) and `inventoryPage` are injected per test. This removes repeated setup and keeps tests independent, so they run safely in parallel.
- **Centralised test data**: credentials and expected error strings are defined once in `test-data/users.ts`, avoiding magic strings and making environment overrides easy.
- **`data-test` attribute locators**: `testIdAttribute` is set to `data-test`, which SauceDemo provides. `getByTestId` is more stable than CSS or text selectors. Role-based locators are used where an accessible name exists (menu button).
- **Data-driven tests**: the four extra user types share one parameterised test instead of four copies.
- **Web-first assertions**: Playwright auto-waits and retries assertions, so no hard-coded sleeps. This matters for `performance_glitch_user`, which is deliberately slow.
- **Config**: fully parallel; 2 retries and `forbidOnly` on CI; trace on first retry; screenshot and video kept only on failure to keep artifacts small; HTML report generated.
- **Chromium only**: login is simple and a single browser keeps runs fast. Add Firefox/WebKit as extra entries in `projects` when cross-browser coverage is needed.
- **Strict TypeScript**: catches mistakes at compile time (`npm run typecheck`).

## Possible next steps
- Add a CI workflow (GitHub Actions) running `npm test`.
- Add a `storageState` setup project once tests need an authenticated session (cart, checkout).
- Add Firefox and WebKit projects.

## CI & Allure report
GitHub Actions (`.github/workflows/playwright.yml`) runs the suite on every push/PR, uploads the Allure report as an artifact, and on `main` publishes it to GitHub Pages. One-time setup: repo **Settings → Pages → Source: GitHub Actions**.
