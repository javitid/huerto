import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();
const E2E_TASK_USER = {
  uid: 'e2e-task-user',
  displayName: 'Usuario e2e',
  email: 'e2e@huerto.local',
  isAnonymous: false
};

Given('I am on the login page', async ({ page }) => {
  await page.goto('/#/login');
});

When('I continue as guest', async ({ page }) => {
  await page.getByRole('button', { name: 'Continuar como invitado' }).click();
});

When('I continue as guest using the keyboard', async ({ page }) => {
  await page.keyboard.press('Tab');
  await expect(page.getByRole('combobox', { name: 'Language selector' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Entrar con Google' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Continuar como invitado' })).toBeFocused();
  await page.keyboard.press('Enter');
});

When('I access the dashboard with e2e task permissions', async ({ page }) => {
  await page.evaluate((user) => {
    window.localStorage.setItem('huerto.e2e.authUser', JSON.stringify(user));
    window.localStorage.removeItem(`huerto.e2e.tasks.${user.uid}`);
  }, E2E_TASK_USER);

  await page.reload();
  await page.goto('/#/dashboard');
});

Then('I see the dashboard', async ({ page }) => {
  await expect(page).toHaveURL(/dashboard/);
  await expect(page.getByRole('heading', { name: 'Panel principal de cultivos' })).toBeVisible();
  await expect(page.getByText('Sesión iniciada correctamente')).toBeVisible();
});
