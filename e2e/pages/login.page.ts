import { expect, Page } from '@playwright/test';

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.page.getByRole('heading', { name: 'Welcome to Attendix' })).toBeVisible();
    await expect(this.page.getByLabel('Email')).toBeVisible();
    await expect(this.page.getByLabel('Password')).toBeVisible();
    await expect(this.page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  }

  async login(email: string, password: string): Promise<void> {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }
}
