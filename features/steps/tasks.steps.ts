import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { When, Then } = createBdd();
let createdTaskTitle = '';
let editedTaskTitle = '';
let createdTaskCardTestId = '';

When('I create a new dashboard task', async ({ page }) => {
  createdTaskTitle = `Tarea e2e ${Date.now()}`;
  editedTaskTitle = `${createdTaskTitle} editada`;

  await page.getByPlaceholder('Ej. Revisar riego del invernadero').fill(createdTaskTitle);
  await page.getByPlaceholder('Ej. Invernadero norte').fill('Parcela e2e');
  await page.getByRole('button', { name: 'Guardar tarea' }).click();

  const taskCard = page.locator('[data-testid^="task-card-"]').filter({ hasText: createdTaskTitle }).first();
  await expect(taskCard).toBeVisible();
  createdTaskCardTestId = (await taskCard.getAttribute('data-testid')) ?? '';
});

When('I mark the created task as done', async ({ page }) => {
  const taskCard = page.locator(`[data-testid="${createdTaskCardTestId}"]`);
  await taskCard.locator(`[data-testid^="task-status-"]`).selectOption('done');
});

Then('I see the created task as done in the dashboard', async ({ page }) => {
  const taskCard = page.locator(`[data-testid="${createdTaskCardTestId}"]`);
  await expect(taskCard).toContainText(createdTaskTitle);
  await expect(taskCard.locator(`[data-testid^="task-status-"]`)).toHaveValue('done');
});

When('I edit the created task', async ({ page }) => {
  const taskCard = page.locator(`[data-testid="${createdTaskCardTestId}"]`);
  await taskCard.locator(`[data-testid^="edit-task-"]`).click();
  await taskCard.locator(`[data-testid^="edit-title-"]`).fill(editedTaskTitle);
  await taskCard.locator(`[data-testid^="edit-area-"]`).fill('Parcela editada');
  await taskCard.locator(`[data-testid^="save-task-"]`).click();
  await expect(taskCard).toContainText(editedTaskTitle);
});

When('I delete the edited task', async ({ page }) => {
  const taskCard = page.locator(`[data-testid="${createdTaskCardTestId}"]`);
  await taskCard.locator(`[data-testid^="delete-task-"]`).click();
});

Then('I do not see the edited task in the dashboard', async ({ page }) => {
  await expect(page.getByText(editedTaskTitle)).toHaveCount(0);
});
