import { expect, test } from '@playwright/test';
import { getE2EAdminCredentials } from '../../fixtures/env';
import { LoginPage } from '../../pages/login.page';

test.describe('Auth login flow', () => {
  test('logs in and redirects to an authenticated route', async ({ page }) => {
    const credentials = getE2EAdminCredentials();
    test.skip(!credentials, 'Missing E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD environment variables.');

    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.expectLoaded();
    await loginPage.login(credentials!.email, credentials!.password);

    await expect(page).toHaveURL(/\/(main|select-workspace)(\/|$)/);
  });
});
