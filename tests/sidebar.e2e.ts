import { test, expect } from '@playwright/test';

test('sidebar toggle test', async ({ page }) => {
  await page.goto('http://localhost:3000/en/dashboard');

  // Wait for the toggle button to be visible
  const toggleBtn = page.getByTitle('Toggle Sidebar');
  await expect(toggleBtn).toBeVisible();

  // Get text content of the button before click
  const textBefore = await toggleBtn.textContent();
  console.log('Button text before:', textBefore);

  // Click the toggle button
  await toggleBtn.click();

  // Wait for a short time for state to update
  await page.waitForTimeout(500);

  // Get text content of the button after click
  const textAfter = await toggleBtn.textContent();
  console.log('Button text after:', textAfter);

  // Check the aside width
  const aside = page.locator('aside');
  const width = await aside.evaluate((el) => window.getComputedStyle(el).width);
  console.log('Aside width after click:', width);
});
