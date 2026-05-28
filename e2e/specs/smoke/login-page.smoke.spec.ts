import { test } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';

test.describe('Login page smoke', () => {
  test('renders login screen', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();
    await loginPage.expectLoaded();
  });
});
