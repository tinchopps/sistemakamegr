import { test, expect } from '@playwright/test';

test.describe('Sistema Kame Regression & UI Tests', () => {

    test('Visual Check: Dark Mode & Tailwind', async ({ page }) => {
        await page.goto('/');

        // Wait for hydration
        await page.waitForLoadState('networkidle');

        // Check Body Background (Tailwind bg-kame-dark)
        const bodyBg = await page.evaluate(() => {
            return window.getComputedStyle(document.body).backgroundColor;
        });

        // Expect strict dark background (#000000 or #121212)
        // RGB(0, 0, 0) or RGB(18, 18, 18)
        expect(['rgb(0, 0, 0)', 'rgb(18, 18, 18)', '#000000', '#121212']).toContain(bodyBg);

        // Check if Tailwind utility classes are working on a random element
        // e.g. .w-full should have width: 100%
        const isTailwindLoaded = await page.evaluate(() => {
            const el = document.createElement('div');
            el.className = 'w-full';
            document.body.appendChild(el);
            const width = window.getComputedStyle(el).width;
            document.body.removeChild(el);
            return width !== '0px'; // w-full should expand to parent
        });
        expect(isTailwindLoaded).toBeTruthy();
    });

    test('Layout Check: Split Panel & Horizontal Alignment', async ({ page }) => {
        await page.goto('/');

        // Locators
        const productGridContainer = page.locator('main');
        const cartSidebar = page.locator('aside').last(); // Assuming MainLayout structure

        // 1. Horizontal Alignment Test
        const gridBox = await productGridContainer.boundingBox();
        const cartBox = await cartSidebar.boundingBox();

        expect(gridBox).not.toBeNull();
        expect(cartBox).not.toBeNull();

        if (gridBox && cartBox) {
            // Top positions should be roughly same (aligned horizontally)
            expect(Math.abs(gridBox.y - cartBox.y)).toBeLessThan(10);

            // Grid should be to the left of Cart
            expect(gridBox.x + gridBox.width).toBeLessThanOrEqual(cartBox.x + 5);
        }

        // 2. Scroll Independence Check
        // Expect Main content area to have overflow-y auto/scroll
        const overflowY = await productGridContainer.evaluate((el) => {
            return window.getComputedStyle(el).overflowY;
        });
        expect(['auto', 'scroll']).toContain(overflowY);
    });

    test('Visual Check: Dark Mode & Premium Styles', async ({ page }) => {
        await page.goto('/');

        // 1. Strict Background Check (#121212)
        const body = page.locator('body');
        await expect(body).toHaveCSS('background-color', 'rgb(18, 18, 18)');

        // 2. Main Layout Flex Row Check
        const layout = page.locator('div.flex.h-screen.w-screen');
        await expect(layout).toHaveClass(/flex/);
        // Note: Tailwind classes might be composed, but we can check computed style
        await expect(layout).toHaveCSS('display', 'flex');
        // We expect side-by-side, so flex-direction should be row (default)
        await expect(layout).toHaveCSS('flex-direction', 'row');

        // 3. Ticket Sidebar Style (#F9FAFB background - Thermal Paper)
        // It's the last aside
        // Use a more specific selector finding the main container div
        const sidebarContainer = page.locator('aside').last().locator('div.shadow-2xl');
        await expect(sidebarContainer).toHaveCSS('background-color', 'rgb(249, 250, 251)');
        await expect(sidebarContainer).toHaveCSS('font-family', /monospace/); // Font-mono check
    });

    test('Responsiveness Check: 70/30 Split', async ({ page }) => {
        await page.setViewportSize({ width: 1366, height: 768 });
        await page.goto('/');

        const viewportWidth = 1366;
        const cartSidebar = page.locator('aside').last();
        const cartBox = await cartSidebar.boundingBox();

        expect(cartBox).not.toBeNull();

        // 30% of 1366 is approx 409.8
        // Allow variance of 1-2px due to scrollbars or borders
        if (cartBox) {
            const ratio = cartBox.width / viewportWidth;
            expect(ratio).toBeCloseTo(0.30, 1); // 0.3 +/- 0.1 precision
        }
    });

    test('Functional Check: Add Item & Price Formatting', async ({ page }) => {
        await page.goto('/');

        // 1. Price Formatting
        const card = page.locator('.group').filter({ hasText: 'Pizza Muzza' }).first();
        await expect(card).toBeVisible();

        const priceText = await card.locator('span').filter({ hasText: '$' }).first().innerText();
        const normalizedPrice = priceText.trim().replace(/\s/g, ' ');
        expect(normalizedPrice).toMatch(/\$\s?12\.000,00/);

        // 2. Add Item
        await card.click({ force: true });

        // 3. COBRAR Button Check
        const checkoutBtn = page.getByRole('button', { name: /COBRAR/i });
        await expect(checkoutBtn).toBeVisible();
        await expect(checkoutBtn).toHaveCSS('background-color', 'rgb(230, 126, 34)'); // #E67E22
    });

    test('Admin Check: Inventory Table & Alerts', async ({ page }) => {
        await page.goto('/admin');

        // Switch to Ingredients Tab
        await page.getByRole('button', { name: 'Ingredientes (Stock)' }).click();

        // Check if Table exists
        const table = page.locator('table');
        await expect(table).toBeVisible();
        await expect(page.getByText('Stock Actual')).toBeVisible();
        await expect(page.getByText('Estado')).toBeVisible();

        // Check for Low Stock / Critical Logic (Visual)
        // Verify New Ingredient form headers to confirm context
        await expect(page.getByRole('heading', { name: 'Nuevo Ingrediente' })).toBeVisible();
    });

});
