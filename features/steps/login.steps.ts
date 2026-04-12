import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('I am on the login page', async ({ page }) => {
  await page.goto('http://localhost:4200/login');
});

When('I enter valid credentials', async ({ page }) => {
  await page.fill('input[name="username"]', 'admin');
  await page.fill('input[name="password"]', 'password');
  await page.click('button[type="submit"]');
});

Then('I see the dashboard', async ({ page }) => {
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByRole('heading', { name: 'Panel principal' })).toHaveText('Panel principal');
});
