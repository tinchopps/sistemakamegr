import { test, expect } from '@playwright/test';

test('navigation flow between POS and Admin', async ({ page }) => {
  // 1. Load the app (POS)
  await page.goto('/');

  await expect(page).toHaveURL('/');

  // Verify we are on POS (Check for Heading specifically)
  await expect(page.getByRole('heading', { name: 'Menú' })).toBeVisible();

  // 2. Navigate to Admin
  await page.getByTestId('nav-admin').click();

  // 3. Verify Admin Page
  await expect(page).toHaveURL('/admin');
  await expect(page.getByRole('heading', { name: 'Panel de Administración' })).toBeVisible();

  // 4. Navigate back to POS
  await page.getByTestId('nav-pos').click();

  // 5. Verify back on POS
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: 'Menú' })).toBeVisible();
});
