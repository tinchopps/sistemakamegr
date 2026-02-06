import { test } from '@playwright/test';

test('Capture Gold Standard Visuals', async ({ page }) => {
    // 1. Home / Split View
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'gold_standard_home.png', fullPage: true });

    // 2. Admin / Inventory
    await page.goto('/admin');
    await page.getByRole('button', { name: 'Ingredientes (Stock)' }).click();
    await page.waitForSelector('table');
    await page.screenshot({ path: 'gold_standard_admin.png', fullPage: true });
});
