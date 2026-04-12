import {test, expect, Locator} from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await expect(page).toHaveTitle(/People Admin Application/);
});

test('has search', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await expect(page.getByTestId('search-field').locator('label')).toHaveText('Search');
});

test('has table', async ({ page }) => {
  await page.goto('http://localhost:8080/');
  await expect(page.locator('table thead tr button span').nth(1)).toHaveText('Delete');
  await expect(page.locator('table th')).toHaveText(['', 'Firstname', 'Lastname', 'Street', '']);
  await expect(page.locator('table tbody tr').nth(0).locator('td')).toHaveText([' ', 'Jackie', 'Rau', 'Waelchi Orchard', 'arrow_drop_down']);
});


