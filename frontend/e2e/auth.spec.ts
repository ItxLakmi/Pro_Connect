import { test, expect, Page } from '@playwright/test';

// ─── Helper: Login ─────────────────────────────────────────────────────────
async function loginUser(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/(feed|dashboard|home)/, { timeout: 10000 });
}

// ─── Register Page Tests ────────────────────────────────────────────────────
test.describe('Registration Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should load register page with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/Pro.?Connect|Register/i);
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible();
  });

  test('should show validation errors on empty submit', async ({ page }) => {
    await page.locator('button[type="submit"]').click();
    // Expect at least one error message to appear
    const errors = page.locator('[class*="error"], [role="alert"], p:has-text("required")');
    await expect(errors.first()).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to login page via link', async ({ page }) => {
    const loginLink = page.locator('a[href*="login"]').first();
    await expect(loginLink).toBeVisible();
    await loginLink.click();
    await expect(page).toHaveURL(/login/);
  });

  test('should register a new user successfully', async ({ page }) => {
    const uniqueEmail = `playwright_${Date.now()}@test.com`;
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]').first();

    await emailInput.fill(uniqueEmail);
    await passwordInput.fill('Test@1234');

    // Fill name fields if they exist
    const firstNameInput = page.locator('input[placeholder*="first" i], input[name*="first" i]');
    if (await firstNameInput.isVisible()) {
      await firstNameInput.fill('Playwright');
    }
    const lastNameInput = page.locator('input[placeholder*="last" i], input[name*="last" i]');
    if (await lastNameInput.isVisible()) {
      await lastNameInput.fill('Test');
    }

    await page.locator('button[type="submit"]').click();
    // After register, should redirect away from register page
    await expect(page).not.toHaveURL(/register/, { timeout: 10000 });
  });
});

// ─── Login Page Tests ───────────────────────────────────────────────────────
test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should load login page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Pro.?Connect|Login|Sign/i);
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should show error for empty form submission', async ({ page }) => {
    await page.locator('button[type="submit"]').click();
    const error = page.locator('[class*="error"], [role="alert"], p:has-text("required")');
    await expect(error.first()).toBeVisible({ timeout: 5000 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.locator('input[type="email"]').fill('notexist@example.com');
    await page.locator('input[type="password"]').fill('WrongPassword123');
    await page.locator('button[type="submit"]').click();

    const error = page.locator('[class*="error"], [role="alert"], p:has-text(/invalid|incorrect|wrong/i)');
    await expect(error.first()).toBeVisible({ timeout: 8000 });
  });

  test('should navigate to register page', async ({ page }) => {
    const registerLink = page.locator('a[href*="register"]').first();
    await expect(registerLink).toBeVisible();
    await registerLink.click();
    await expect(page).toHaveURL(/register/);
  });

  test('email field should reject invalid email format', async ({ page }) => {
    await page.locator('input[type="email"]').fill('not-an-email');
    await page.locator('button[type="submit"]').click();
    // HTML5 validation or custom validation should kick in
    const isInvalid = await page.locator('input[type="email"]').evaluate(
      (el: HTMLInputElement) => !el.validity.valid
    );
    expect(isInvalid).toBe(true);
  });
});
