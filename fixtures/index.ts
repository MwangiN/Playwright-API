import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { users } from '../test-data/users';

type Pages = {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  /** Inventory page after logging in as the standard user. */
  loggedInInventory: InventoryPage;
};

// Page objects are injected per test; login page is pre-navigated.
export const test = base.extend<Pages>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await use(loginPage);
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  loggedInInventory: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
    const inventory = new InventoryPage(page);
    await inventory.expectLoaded();
    await use(inventory);
  },
});

export { expect };
