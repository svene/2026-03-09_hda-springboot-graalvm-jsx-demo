import {test, expect} from '@playwright/test';

const BASE_URL = 'http://localhost:8080';
const PAGE_URL = BASE_URL + '/component/Page';

// Seed data (Faker with seed 0): first person is Jackie Rau, Waelchi Orchard
const FIRST_PERSON = { firstName: 'Jackie', lastName: 'Rau', street: 'Waelchi Orchard' };

// URL predicates — use exact-suffix regex to avoid false matches between
// /details, /detailsrow and /detailscard
const isDetailsUrl     = (url: string) => /\/component\/PersonDetails/.test(url);
const isDetailsRowUrl  = (url: string) => /\/component\/PersondetailsRow/.test(url);
const isDetailsCardUrl = (url: string) => /\/component\/PersondetailsCard/.test(url);
const isEditUrl        = (url: string) => /\/component\/PersonEditor/.test(url);
const isRowUrl         = (url: string) => /\/component\/PersonRow/.test(url);

test('has title', async ({ page }) => {
  await page.goto(BASE_URL + '/');
  await expect(page).toHaveTitle(/People Admin Application/);
});

test('has search', async ({ page }) => {
  await page.goto(BASE_URL + '/');
  await expect(page.getByTestId('search-field').locator('label')).toHaveText('Search');
});

test('has table', async ({ page }) => {
  await page.goto(BASE_URL + '/');
  await expect(page.locator('table thead tr button span').nth(1)).toHaveText('Delete');
  await expect(page.locator('table th')).toHaveText(['', 'Firstname', 'Lastname', 'Street', '']);
  await expect(page.locator('table tbody tr').nth(0).locator('td')).toHaveText([' ', 'Jackie', 'Rau', 'Waelchi Orchard', 'arrow_drop_down']);
  //await expect(page).toHaveScreenshot();
});

test('shows row count below table', async ({ page }) => {
  await page.goto(PAGE_URL);
  const countText = await page.locator('#result-table > div').textContent();
  expect(countText).toMatch(/\d+ of total \d+/);
});

test('search filters the table', async ({ page }) => {
  await page.goto(PAGE_URL);

  const initialRowCount = await page.locator('table tbody tr').count();

  const searchInput = page.locator('input[name="search"]');
  await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/component/PersonTable')),
    searchInput.fill(FIRST_PERSON.firstName),
  ]);

  const filteredCount = await page.locator('table tbody tr').count();
  expect(filteredCount).toBeLessThan(initialRowCount);

  // Every visible row should match the search term
  const rows = page.locator('table tbody tr');
  for (let i = 0; i < await rows.count(); i++) {
    const rowText = await rows.nth(i).textContent();
    expect(rowText?.toLowerCase()).toContain(FIRST_PERSON.firstName.toLowerCase());
  }
});

test('clearing search restores full list', async ({ page }) => {
  await page.goto(PAGE_URL);

  const initialRowCount = await page.locator('table tbody tr').count();

  const searchInput = page.locator('input[name="search"]');
  await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/component/PersonTable')),
    searchInput.fill(FIRST_PERSON.firstName),
  ]);
  await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/component/PersonTable')),
    searchInput.clear(),
  ]);

  const restoredCount = await page.locator('table tbody tr').count();
  expect(restoredCount).toBe(initialRowCount);
});

test('clicking a row expands the details card', async ({ page }) => {
  await page.goto(PAGE_URL);

  const firstRow = page.locator('table tbody tr').first();
  await expect(firstRow.locator('td').last()).toContainText('arrow_drop_down');

  await Promise.all([
    page.waitForResponse(resp => isDetailsUrl(resp.url())),
    firstRow.click(),
  ]);

  // The header row now shows the collapse icon
  await expect(page.locator('table tbody tr').first().locator('td').last()).toContainText('arrow_drop_up');

  // A details card with address info appears as the next row
  const detailsCard = page.locator('table tbody tr').nth(1).locator('.card');
  await expect(detailsCard).toBeVisible();
  await expect(detailsCard).toContainText('Street:');
  await expect(detailsCard).toContainText('City:');
  await expect(detailsCard).toContainText('Phone:');
});

test('clicking the expanded row header collapses the details card', async ({ page }) => {
  await page.goto(PAGE_URL);

  // Expand
  await Promise.all([
    page.waitForResponse(resp => isDetailsUrl(resp.url())),
    page.locator('table tbody tr').first().click(),
  ]);

  // Collapse by clicking the header row again
  await Promise.all([
    page.waitForResponse(resp => isRowUrl(resp.url())),
    page.locator('table tbody tr').first().click(),
  ]);

  // Back to collapsed state
  await expect(page.locator('table tbody tr').first().locator('td').last()).toContainText('arrow_drop_down');
  // Details card is gone
  await expect(page.locator('table tbody tr').nth(1).locator('.card')).not.toBeVisible();
});

test('clicking the details card opens the edit form', async ({ page }) => {
  await page.goto(PAGE_URL);

  await Promise.all([
    page.waitForResponse(resp => isDetailsUrl(resp.url())),
    page.locator('table tbody tr').first().click(),
  ]);

  await Promise.all([
    page.waitForResponse(resp => isEditUrl(resp.url())),
    page.locator('table tbody tr').nth(1).click(),
  ]);

  const editRow = page.locator('table tbody tr').nth(1);
  await expect(editRow.locator('input[name="firstName"]')).toBeVisible();
  await expect(editRow.locator('input[name="lastName"]')).toBeVisible();
  await expect(editRow.locator('input[name="streetName"]')).toBeVisible();
  await expect(editRow.locator('button', { hasText: '< Back' })).toBeVisible();
  await expect(editRow.locator('button', { hasText: 'Save' })).toBeVisible();
});

test('edit form pre-fills current values', async ({ page }) => {
  await page.goto(PAGE_URL);

  // Read the displayed values from the table instead of hardcoding seed data
  const firstRow = page.locator('table tbody tr').first();
  const expectedFirstName = (await firstRow.locator('td').nth(1).textContent())!.trim();
  const expectedLastName  = (await firstRow.locator('td').nth(2).textContent())!.trim();
  const expectedStreet    = (await firstRow.locator('td').nth(3).textContent())!.trim();

  await Promise.all([
    page.waitForResponse(resp => isDetailsUrl(resp.url())),
    firstRow.click(),
  ]);

  await Promise.all([
    page.waitForResponse(resp => isEditUrl(resp.url())),
    page.locator('table tbody tr').nth(1).click(),
  ]);

  const editRow = page.locator('table tbody tr').nth(1);
  await expect(editRow.locator('input[name="firstName"]')).toHaveValue(expectedFirstName);
  await expect(editRow.locator('input[name="lastName"]')).toHaveValue(expectedLastName);
  await expect(editRow.locator('input[name="streetName"]')).toHaveValue(expectedStreet);
});

test('Back button in edit form returns to details card', async ({ page }) => {
  await page.goto(PAGE_URL);

  await Promise.all([
    page.waitForResponse(resp => isDetailsUrl(resp.url())),
    page.locator('table tbody tr').first().click(),
  ]);

  await Promise.all([
    page.waitForResponse(resp => isEditUrl(resp.url())),
    page.locator('table tbody tr').nth(1).click(),
  ]);

  await Promise.all([
    page.waitForResponse(resp => isDetailsCardUrl(resp.url())),
    page.locator('table tbody tr').nth(1).locator('button', { hasText: '< Back' }).click(),
  ]);

  // Details card is visible again, edit form is gone
  await expect(page.locator('table tbody tr').nth(1).locator('.card')).toBeVisible();
  await expect(page.locator('table tbody tr').nth(1).locator('input[name="firstName"]')).not.toBeVisible();
});

test('saving an edit updates the row in the table', async ({ page }) => {
  await page.goto(PAGE_URL);

  await Promise.all([
    page.waitForResponse(resp => isDetailsUrl(resp.url())),
    page.locator('table tbody tr').first().click(),
  ]);

  await Promise.all([
    page.waitForResponse(resp => isEditUrl(resp.url())),
    page.locator('table tbody tr').nth(1).click(),
  ]);

  // Read the original first name so we can restore it afterwards
  const originalFirstName = await page.locator('table tbody tr').nth(1).locator('input[name="firstName"]').inputValue();
  const newFirstName = 'UpdatedName';

  const firstNameInput = page.locator('table tbody tr').nth(1).locator('input[name="firstName"]');
  await firstNameInput.clear();
  await firstNameInput.fill(newFirstName);

  // Register the detailsrow listener BEFORE clicking Save so we cannot miss the
  // response that fires immediately after the PUT (via the PERSON_UPDATED HTMX event).
  const detailsRowResponse = page.waitForResponse(resp => isDetailsRowUrl(resp.url()));
  await Promise.all([
    page.waitForResponse(resp => resp.request().method() === 'PUT' && resp.url().includes('/person/')),
    page.locator('table tbody tr').nth(1).locator('button', { hasText: 'Save' }).click(),
  ]);
  // After the PUT the backend fires a PERSON_UPDATED event; PersondetailsRow reloads itself
  await detailsRowResponse;

  // The header row should reflect the updated name
  await expect(page.locator('table tbody tr').first().locator('td').nth(1)).toHaveText(newFirstName);

  // Restore original name
  await Promise.all([
    page.waitForResponse(resp => isEditUrl(resp.url())),
    page.locator('table tbody tr').nth(1).click(),
  ]);
  const restoreInput = page.locator('table tbody tr').nth(1).locator('input[name="firstName"]');
  await restoreInput.clear();
  await restoreInput.fill(originalFirstName);
  await Promise.all([
    page.waitForResponse(resp => resp.request().method() === 'PUT' && resp.url().includes('/person/')),
    page.locator('table tbody tr').nth(1).locator('button', { hasText: 'Save' }).click(),
  ]);
  await page.waitForResponse(resp => isDetailsRowUrl(resp.url()));
});

// Note: this test is destructive — it permanently deletes rows from the DB.
// Run it last or against a fresh DB instance.
test('bulk delete removes multiple selected rows', async ({ page }) => {
  await page.goto(PAGE_URL);

  // Capture the names of the two rows to be deleted
  const [row0, row1] = await Promise.all(
    [0, 1].map(async i => ({
      firstName: (await page.locator('table tbody tr').nth(i).locator('td').nth(1).textContent())!.trim(),
      lastName:  (await page.locator('table tbody tr').nth(i).locator('td').nth(2).textContent())!.trim(),
    }))
  );

  // Check the first two rows' checkboxes
  await page.locator('table tbody tr').nth(0).locator('input[type="checkbox"]').check();
  await page.locator('table tbody tr').nth(1).locator('input[type="checkbox"]').check();

  // Click Delete — backend responds with HX-Redirect to PAGE_URL.
  // waitForURL would resolve immediately (already at PAGE_URL), so use waitForNavigation instead.
  await Promise.all([
    page.waitForNavigation(),
    page.locator('table thead button', { hasText: 'Delete' }).click(),
  ]);
  await page.waitForSelector('table tbody tr');

  // The table (with fresh data filled in) must not contain either deleted person
  const tableText = await page.locator('table tbody').textContent();
  for (const { firstName, lastName } of [row0, row1]) {
    expect(tableText).not.toContain(firstName);
    expect(tableText).not.toContain(lastName);
  }
});
