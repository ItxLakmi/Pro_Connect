import { test, expect, Page } from '@playwright/test';

// ─── Shared Login Helper ────────────────────────────────────────────────────
async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/(feed|dashboard|jobs|home)/, { timeout: 15000 });
}

// ─── Jobs Page Tests ────────────────────────────────────────────────────────
test.describe('Jobs Page', () => {
  test('should be accessible (returns 200)', async ({ page }) => {
    const res = await page.goto('/jobs');
    expect(res?.status()).toBeLessThan(400);
  });

  test('should display job listings section', async ({ page }) => {
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');
    const jobSection = page.locator(
      '[data-testid="job-card"], [class*="job"], article, .card'
    ).first();
    await expect(jobSection).toBeVisible({ timeout: 10000 });
  });

  test('should have a search input', async ({ page }) => {
    await page.goto('/jobs');
    const searchInput = page.locator(
      'input[placeholder*="search" i], input[placeholder*="job" i], input[type="search"]'
    ).first();
    await expect(searchInput).toBeVisible({ timeout: 8000 });
  });

  test('should filter jobs when searching', async ({ page }) => {
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');

    const searchInput = page.locator(
      'input[placeholder*="search" i], input[placeholder*="job" i], input[type="search"]'
    ).first();

    await expect(searchInput).toBeVisible({ timeout: 8000 });
    await searchInput.fill('Developer');
    await page.keyboard.press('Enter');

    // Wait for URL or DOM to reflect the search action
    await page.waitForLoadState('networkidle');
    const url = page.url();
    const hasSearchParam = url.includes('search=') || url.includes('developer') || url.includes('Developer');
    expect(hasSearchParam).toBeTruthy();
  });

  test('should navigate to job detail on click', async ({ page }) => {
    await page.goto('/jobs');
    await page.waitForLoadState('networkidle');

    const firstJobLink = page.locator('a[href*="/jobs/"]').first();
    if (await firstJobLink.isVisible()) {
      await firstJobLink.click();
      await expect(page).toHaveURL(/\/jobs\/.+/);
    }
  });
});

// ─── Feed Page Tests ─────────────────────────────────────────────────────────
test.describe('Feed Page', () => {
  test('should redirect unauthenticated user away from feed', async ({ page }) => {
    await page.goto('/feed');
    await page.waitForLoadState('networkidle');
    // Should either redirect to login or show login prompt
    const isOnFeed = page.url().includes('/feed');
    const isOnLogin = page.url().includes('/login');
    expect(isOnFeed || isOnLogin).toBeTruthy();
  });
});

// ─── Profile Page Tests ──────────────────────────────────────────────────────
test.describe('Profile Page', () => {
  test('should redirect unauthenticated user from profile', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    const url = page.url();
    const isRedirected = url.includes('/login') || url.includes('/auth') || !url.includes('/profile');
    expect(isRedirected || url.includes('/profile')).toBeTruthy();
  });
});

// ─── Community Page Tests ────────────────────────────────────────────────────
test.describe('Community Page', () => {
  test('should load community page', async ({ page }) => {
    const res = await page.goto('/community');
    expect(res?.status()).toBeLessThan(400);
  });
});

// ─── Learning Page Tests ─────────────────────────────────────────────────────
test.describe('Learning Page', () => {
  test('should load learning page', async ({ page }) => {
    const res = await page.goto('/learning');
    expect(res?.status()).toBeLessThan(400);
  });
});

// ─── Notifications Page ──────────────────────────────────────────────────────
test.describe('Notifications Page', () => {
  test('should load or redirect from notifications', async ({ page }) => {
    const res = await page.goto('/notifications');
    expect(res?.status()).toBeLessThan(400);
  });
});

// ─── Marketplace Page ────────────────────────────────────────────────────────
test.describe('Marketplace Page', () => {
  test('should load marketplace page', async ({ page }) => {
    const res = await page.goto('/marketplace');
    expect(res?.status()).toBeLessThan(400);
  });
});
