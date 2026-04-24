import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();

const E2E_AUTHORIZED_FILE_ANALYSIS_USER = {
  uid: 'XuOjXcOBssPwJxdcPzzmf0VoP0r1',
  displayName: 'Usuario análisis e2e',
  email: 'javitid@gmail.com',
  isAnonymous: false
} as const;

const E2E_OTHER_USER = {
  uid: 'e2e-file-analysis-other',
  displayName: 'Usuario sin acceso',
  email: 'no-access@huerto.local',
  isAnonymous: false
} as const;

function dashboardUploadPanel(page: Page) {
  return page.locator('[data-testid="dashboard-upload-input"]');
}

async function authenticateForDashboard(page: Page, user: typeof E2E_AUTHORIZED_FILE_ANALYSIS_USER | typeof E2E_OTHER_USER): Promise<void> {
  await page.goto('/#/login');
  await page.evaluate((currentUser) => {
    window.localStorage.setItem('huerto.e2e.authUser', JSON.stringify(currentUser));
    window.localStorage.removeItem(`huerto.e2e.tasks.${currentUser.uid}`);
  }, user);

  await page.reload();
  await page.goto('/#/dashboard');
}

Given('I am on the dashboard as the authorized file analysis user', async ({ page }) => {
  await authenticateForDashboard(page, E2E_AUTHORIZED_FILE_ANALYSIS_USER);
});

Given('I am on the dashboard as another user', async ({ page }) => {
  await authenticateForDashboard(page, E2E_OTHER_USER);
});

Then('I see the file analysis panel', async ({ page }) => {
  await expect(dashboardUploadPanel(page)).toBeVisible();
  await expect(page.getByTestId('dashboard-upload-submit')).toBeVisible();
});

When('I select a PDF bill for analysis', async ({ page }) => {
  await page.setInputFiles('[data-testid="dashboard-upload-input"]', {
    name: 'factura-luz.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 test bill')
  });
});

Then('I see the selected file in the file analysis panel', async ({ page }) => {
  await expect(page.getByText('Fichero seleccionado: factura-luz.pdf')).toBeVisible();
});

Then('I do not see the file analysis panel', async ({ page }) => {
  await expect(dashboardUploadPanel(page)).toHaveCount(0);
  await expect(page.getByTestId('dashboard-upload-submit')).toHaveCount(0);
  await expect(page.getByText('El análisis de facturas está desactivado por ahora')).toBeVisible();
});
