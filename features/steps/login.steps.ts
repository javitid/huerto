import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

Given('I am on the login page', async ({ page }) => {
  await page.goto('/login');
});

When('I continue as guest', async ({ page }) => {
  await page.getByRole('button', { name: 'Continuar como invitado' }).click();
});

Then('I see the dashboard', async ({ page }) => {
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByRole('heading', { name: 'Panel principal de cultivos' })).toBeVisible();
  await expect(page.getByText('Sesión iniciada correctamente')).toBeVisible();
});
