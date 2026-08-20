import { test, expect } from '@playwright/test';

test.describe('Homepage & Navigation', () => {
  test('should load homepage without errors', async ({ page }) => {
    const res = await page.goto('/');
    expect(res?.status()).toBe(200);
  });

  test('should have correct page title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Pro.?Connect/i);
  });

  test('should have no console errors on load', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // Filter out known non-critical errors (e.g. favicon 404)
    const criticalErrors = consoleErrors.filter(
      (e) => !e.includes('favicon') && !e.includes('404')
    );
    expect(criticalErrors).toHaveLength(0);
  });

  test('should have a navigation bar', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav, header, [role="navigation"]').first();
    await expect(nav).toBeVisible();
  });

  test('should have login / sign-up links on homepage', async ({ page }) => {
    await page.goto('/');
    const loginLink = page.locator(
      'a[href*="login"], button:has-text("Login"), a:has-text("Sign In")'
    ).first();
    await expect(loginLink).toBeVisible({ timeout: 5000 });
  });

  test('should be responsive — no horizontal overflow on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // 5px tolerance
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 798, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const nav = page.locator('nav, header').first();
    await expect(nav).toBeVisible();
  });
});

test.describe('404 Page', () => {
  test('should show 404 page for unknown routes', async ({ page }) => {
    const res = await page.goto('/this-page-does-not-exist-at-all');
    // Next.js returns 404
    expect(res?.status()).toBe(404);
  });
});

test.describe('Privacy Page', () => {
  test('should load privacy page', async ({ page }) => {
    const res = await page.goto('/privacy');
    expect(res?.status()).toBeLessThan(400);
  });
});
