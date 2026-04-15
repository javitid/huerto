import { expect } from '@playwright/test';
import { createBdd } from 'playwright-bdd';

const { Given, When, Then } = createBdd();
const E2E_TASK_USER = {
  uid: 'e2e-task-user',
  displayName: 'Usuario e2e',
  email: 'e2e@huerto.local',
  isAnonymous: false
};
const FILTER_TASKS = {
  pending: {
    id: 'e2e-filter-pending',
    title: 'Filtro pendiente e2e',
    area: 'Parcela pendiente',
    status: 'pending'
  },
  inProgress: {
    id: 'e2e-filter-in-progress',
    title: 'Filtro en curso e2e',
    area: 'Parcela en curso',
    status: 'in-progress'
  },
  done: {
    id: 'e2e-filter-done',
    title: 'Filtro hecha e2e',
    area: 'Parcela hecha',
    status: 'done'
  }
} as const;

let createdTaskTitle = '';
let editedTaskTitle = '';
let createdTaskCardTestId = '';

function getFilterButtonTestId(statusLabel: string): string {
  if (statusLabel === 'Pendiente') {
    return 'task-filter-pending';
  }

  if (statusLabel === 'En curso') {
    return 'task-filter-in-progress';
  }

  return 'task-filter-done';
}

function getTaskFixtureTitles(statusLabel: string): { visible: string; hidden: string[] } {
  if (statusLabel === 'Pendiente') {
    return {
      visible: FILTER_TASKS.pending.title,
      hidden: [FILTER_TASKS.inProgress.title, FILTER_TASKS.done.title]
    };
  }

  if (statusLabel === 'En curso') {
    return {
      visible: FILTER_TASKS.inProgress.title,
      hidden: [FILTER_TASKS.pending.title, FILTER_TASKS.done.title]
    };
  }

  return {
    visible: FILTER_TASKS.done.title,
    hidden: [FILTER_TASKS.pending.title, FILTER_TASKS.inProgress.title]
  };
}

Given('I am on the login page for task management', async ({ page }) => {
  await page.goto('/#/login');
});

When('I access the dashboard task board with e2e permissions', async ({ page }) => {
  await page.evaluate((user) => {
    window.localStorage.setItem('huerto.e2e.authUser', JSON.stringify(user));
    window.localStorage.removeItem(`huerto.e2e.tasks.${user.uid}`);
  }, E2E_TASK_USER);

  await page.reload();
  await page.goto('/#/dashboard');
});

When('the dashboard has tasks in every status', async ({ page }) => {
  await page.evaluate(({ user, tasks }) => {
    window.localStorage.setItem(`huerto.e2e.tasks.${user.uid}`, JSON.stringify(tasks));
  }, {
    user: E2E_TASK_USER,
    tasks: [
      {
        ...FILTER_TASKS.done,
        createdAt: new Date('2026-04-15T10:00:00.000Z')
      },
      {
        ...FILTER_TASKS.inProgress,
        createdAt: new Date('2026-04-15T09:00:00.000Z')
      },
      {
        ...FILTER_TASKS.pending,
        createdAt: new Date('2026-04-15T08:00:00.000Z')
      }
    ]
  });

  await page.reload();
  await expect(page.locator('[data-testid^="task-card-"]')).toHaveCount(3);
});

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
  await taskCard.getByRole('combobox').click();
  await page.getByRole('listbox', { name: 'Option List' }).getByText('Hecha').click();
});

Then('I see the created task as done in the dashboard', async ({ page }) => {
  const taskCard = page.locator(`[data-testid="${createdTaskCardTestId}"]`);
  await expect(taskCard).toContainText(createdTaskTitle);
  await expect(taskCard.locator(`[data-testid^="task-status-"]`)).toContainText('Hecha');
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

When('I activate the {string} task filter', async ({ page }, statusLabel: string) => {
  await page.getByTestId(getFilterButtonTestId(statusLabel)).click();
});

Then('I only see tasks with status {string} in the dashboard', async ({ page }, statusLabel: string) => {
  const taskTitles = getTaskFixtureTitles(statusLabel);

  await expect(page.getByText(taskTitles.visible)).toBeVisible();

  for (const hiddenTitle of taskTitles.hidden) {
    await expect(page.getByText(hiddenTitle)).toHaveCount(0);
  }

  await expect(page.locator('[data-testid^="task-card-"]')).toHaveCount(1);
});

Then('only the {string} task filter is active', async ({ page }, statusLabel: string) => {
  const activeTestId = getFilterButtonTestId(statusLabel);
  const allFilterTestIds = ['task-filter-pending', 'task-filter-in-progress', 'task-filter-done'];

  for (const filterTestId of allFilterTestIds) {
    const expectedPressed = filterTestId === activeTestId ? 'true' : 'false';
    await expect(page.getByTestId(filterTestId)).toHaveAttribute('aria-pressed', expectedPressed);
  }
});

Then('I see tasks from every status in the dashboard', async ({ page }) => {
  await expect(page.getByText(FILTER_TASKS.pending.title)).toBeVisible();
  await expect(page.getByText(FILTER_TASKS.inProgress.title)).toBeVisible();
  await expect(page.getByText(FILTER_TASKS.done.title)).toBeVisible();
  await expect(page.locator('[data-testid^="task-card-"]')).toHaveCount(3);
});

Then('no task filter is active', async ({ page }) => {
  for (const filterTestId of ['task-filter-pending', 'task-filter-in-progress', 'task-filter-done']) {
    await expect(page.getByTestId(filterTestId)).toHaveAttribute('aria-pressed', 'false');
  }
});
