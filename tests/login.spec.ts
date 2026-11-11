import { test, expect } from '../fixtures';
import { users, errorMessages } from '../test-data/users';

test.describe('Login', () => {
  test.describe('successful login', () => {
    test('standard user lands on inventory page @smoke', async ({ loginPage, inventoryPage }) => {
      await loginPage.login(users.standard.username, users.standard.password);
      await inventoryPage.expectLoaded();
    });

    for (const [name, user] of [
      ['problem', users.problem],
      ['performance glitch', users.performanceGlitch],
      ['error', users.error],
      ['visual', users.visual],
    ] as const) {
      test(`${name} user can log in`, async ({ loginPage, inventoryPage }) => {
        await loginPage.login(user.username, user.password);
        await inventoryPage.expectLoaded();
      });
    }

    test('session persists after reload', async ({ page, loginPage, inventoryPage }) => {
      await loginPage.login(users.standard.username, users.standard.password);
      await inventoryPage.expectLoaded();
      await page.reload();
      await inventoryPage.expectLoaded();
    });
  });

  test.describe('failed login', () => {
    test('locked out user sees locked out error @smoke', async ({ page, loginPage }) => {
      await loginPage.login(users.lockedOut.username, users.lockedOut.password);
      await loginPage.expectError(errorMessages.lockedOut);
      await expect(page).toHaveURL('/');
    });

    test('invalid password is rejected', async ({ loginPage }) => {
      await loginPage.login(users.standard.username, 'wrong_password');
      await loginPage.expectError(errorMessages.invalidCredentials);
    });

    test('unknown username is rejected', async ({ loginPage }) => {
      await loginPage.login('not_a_user', users.standard.password);
      await loginPage.expectError(errorMessages.invalidCredentials);
    });

    test('usernames are case sensitive', async ({ loginPage }) => {
      await loginPage.login('STANDARD_USER', users.standard.password);
      await loginPage.expectError(errorMessages.invalidCredentials);
    });

    test('empty form requires username', async ({ loginPage }) => {
      await loginPage.loginButton.click();
      await loginPage.expectError(errorMessages.usernameRequired);
    });

    test('missing password requires password', async ({ loginPage }) => {
      await loginPage.login(users.standard.username, '');
      await loginPage.expectError(errorMessages.passwordRequired);
    });

    test('missing username requires username', async ({ loginPage }) => {
      await loginPage.login('', users.standard.password);
      await loginPage.expectError(errorMessages.usernameRequired);
    });

    test('error message can be dismissed', async ({ loginPage }) => {
      await loginPage.loginButton.click();
      await expect(loginPage.error).toBeVisible();
      await loginPage.errorDismiss.click();
      await expect(loginPage.error).toBeHidden();
    });

    test('SQL-injection-style input is rejected safely', async ({ loginPage }) => {
      await loginPage.login(`' OR '1'='1`, `' OR '1'='1`);
      await loginPage.expectError(errorMessages.invalidCredentials);
    });
  });

  test.describe('form behaviour', () => {
    test('password field is masked', async ({ loginPage }) => {
      await expect(loginPage.password).toHaveAttribute('type', 'password');
    });

    test('can submit with Enter key', async ({ loginPage, inventoryPage }) => {
      await loginPage.username.fill(users.standard.username);
      await loginPage.password.fill(users.standard.password);
      await loginPage.password.press('Enter');
      await inventoryPage.expectLoaded();
    });
  });

  test.describe('access control & logout', () => {
    test('inventory page redirects to login when unauthenticated', async ({ page, loginPage }) => {
      await page.goto('/inventory.html');
      await expect(page).toHaveURL('/');
      await loginPage.expectError(errorMessages.notLoggedIn('inventory.html'));
    });

    test('logout returns to login and blocks back-navigation @smoke', async ({ page, loginPage, inventoryPage }) => {
      await loginPage.login(users.standard.username, users.standard.password);
      await inventoryPage.expectLoaded();
      await inventoryPage.logout();
      await expect(page).toHaveURL('/');
      await expect(loginPage.loginButton).toBeVisible();
      await page.goBack();
      await expect(loginPage.error).toBeVisible();
    });
  });
});
