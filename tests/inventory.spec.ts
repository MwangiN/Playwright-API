import { test, expect } from '../fixtures';
import { products } from '../test-data/products';

test.describe('Inventory', () => {
  test.describe('product listing', () => {
    test('shows all six products @smoke', async ({ loggedInInventory }) => {
      await expect(loggedInInventory.items).toHaveCount(products.length);
      expect(await loggedInInventory.names()).toEqual(expect.arrayContaining(products.map((p) => p.name)));
    });

    for (const product of products) {
      test(`${product.name} shows name, description, price and image`, async ({ loggedInInventory }) => {
        const card = loggedInInventory.item(product.name);
        await expect(card.getByTestId('inventory-item-desc')).not.toBeEmpty();
        await expect(card.getByTestId('inventory-item-price')).toHaveText(`$${product.price}`);
        await expect(card.getByRole('img')).toBeVisible();
      });
    }

    test('prices are valid positive amounts with two decimals', async ({ loggedInInventory }) => {
      const raw = await loggedInInventory.itemPrices.allTextContents();
      for (const price of raw) expect(price).toMatch(/^\$\d+\.\d{2}$/);
      for (const price of await loggedInInventory.prices()) expect(price).toBeGreaterThan(0);
    });
  });

  test.describe('sorting', () => {
    test('defaults to name A-Z', async ({ loggedInInventory }) => {
      await expect(loggedInInventory.sortDropdown).toHaveValue('az');
      const names = await loggedInInventory.names();
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
    });

    test('name Z-A', async ({ loggedInInventory }) => {
      await loggedInInventory.sortBy('za');
      const names = await loggedInInventory.names();
      expect(names).toEqual([...names].sort((a, b) => b.localeCompare(a)));
    });

    test('price low to high', async ({ loggedInInventory }) => {
      await loggedInInventory.sortBy('lohi');
      const prices = await loggedInInventory.prices();
      expect(prices).toEqual([...prices].sort((a, b) => a - b));
    });

    test('price high to low', async ({ loggedInInventory }) => {
      await loggedInInventory.sortBy('hilo');
      const prices = await loggedInInventory.prices();
      expect(prices).toEqual([...prices].sort((a, b) => b - a));
    });

    test('sorting keeps all products', async ({ loggedInInventory }) => {
      await loggedInInventory.sortBy('hilo');
      await expect(loggedInInventory.items).toHaveCount(products.length);
    });
  });

  test.describe('add to cart', () => {
    const target = products[0].name;

    test('button toggles to Remove and cart badge shows 1 @smoke', async ({ loggedInInventory }) => {
      await loggedInInventory.addToCartButton(target).click();
      await expect(loggedInInventory.removeButton(target)).toBeVisible();
      await expect(loggedInInventory.addToCartButton(target)).toBeHidden();
      await expect(loggedInInventory.cartBadge).toHaveText('1');
    });

    test('Remove restores Add to cart and clears the badge', async ({ loggedInInventory }) => {
      await loggedInInventory.addToCartButton(target).click();
      await loggedInInventory.removeButton(target).click();
      await expect(loggedInInventory.addToCartButton(target)).toBeVisible();
      await expect(loggedInInventory.cartBadge).toBeHidden();
    });

    test('badge counts multiple items', async ({ loggedInInventory }) => {
      await loggedInInventory.addToCartButton(products[0].name).click();
      await loggedInInventory.addToCartButton(products[1].name).click();
      await loggedInInventory.addToCartButton(products[2].name).click();
      await expect(loggedInInventory.cartBadge).toHaveText('3');
    });

    test('cart state survives a reload', async ({ page, loggedInInventory }) => {
      await loggedInInventory.addToCartButton(target).click();
      await page.reload();
      await expect(loggedInInventory.removeButton(target)).toBeVisible();
      await expect(loggedInInventory.cartBadge).toHaveText('1');
    });
  });

  test.describe('product navigation', () => {
    test('clicking a product name opens its detail page', async ({ page, loggedInInventory }) => {
      const { name, price } = products[1];
      await loggedInInventory.openProduct(name);
      await expect(page).toHaveURL(/\/inventory-item\.html\?id=\d+$/);
      await expect(page.getByTestId('inventory-item-name')).toHaveText(name);
      await expect(page.getByTestId('inventory-item-price')).toHaveText(`$${price}`);
    });

    test('back to products returns to the inventory', async ({ page, loggedInInventory }) => {
      await loggedInInventory.openProduct(products[0].name);
      await page.getByTestId('back-to-products').click();
      await loggedInInventory.expectLoaded();
    });
  });
});
