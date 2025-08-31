import { test, expect } from '@playwright/test';

test.describe('Collections Page Slideout Panel', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the collections page
    await page.goto('/collections');
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
  });

  test('slideout panel opens with Claude-style smooth animation', async ({ page }) => {
    // Look for video items in the grid (should have video thumbnails or cards)
    const videoCards = page.locator('[data-testid*="video"], .video-card, [class*="video"]').first();
    
    // If no video cards are found, try looking for any clickable items in the grid
    const gridItems = page.locator('.grid [role="button"], .grid button, .grid [data-testid*="card"]').first();
    
    // Wait for at least one interactive element to appear
    await expect(videoCards.or(gridItems)).toBeVisible({ timeout: 10000 });

    // Get initial slideout panel state (should not be visible)
    const slideoutPanel = page.locator('[class*="slideout"], [data-testid="slideout"], .fixed.z-50');
    await expect(slideoutPanel).not.toBeVisible();

    // Click on the first video/grid item to open the slideout
    await videoCards.or(gridItems).click();

    // Wait for slideout to appear with animation
    await expect(slideoutPanel).toBeVisible({ timeout: 5000 });

    // Check that the slideout has Claude-style transition classes
    const slideoutElement = await slideoutPanel.first();
    const classList = await slideoutElement.getAttribute('class') || '';
    
    // Verify Claude animation classes are present
    expect(classList).toContain('slideout-claude-transition');
    expect(classList).toContain('opening');
    expect(classList).toContain('translate-x-0'); // Should be fully visible

    // Verify the slideout content is visible
    await expect(slideoutPanel.locator('.slideout-content, [class*="content"]')).toBeVisible();

    // Verify header is present with standardized height (52px)
    const header = slideoutPanel.locator('[class*="header"], .border-b').first();
    await expect(header).toBeVisible();
    
    // Check header height (should be 52px from our standardization)
    const headerBox = await header.boundingBox();
    expect(headerBox?.height).toBeCloseTo(52, 5); // Allow 5px tolerance

    // Verify close button with chevron icon is present
    const closeButton = slideoutPanel.locator('button[aria-label*="Close"], button svg[class*="chevron"]').first();
    await expect(closeButton).toBeVisible();
  });

  test('slideout panel closes with smooth animation', async ({ page }) => {
    // First open a slideout panel
    const gridItems = page.locator('.grid [role="button"], .grid button, [data-testid*="video"], .video-card').first();
    await gridItems.waitFor({ timeout: 10000 });
    await gridItems.click();

    // Wait for slideout to be visible
    const slideoutPanel = page.locator('[class*="slideout"], [data-testid="slideout"], .fixed.z-50');
    await expect(slideoutPanel).toBeVisible({ timeout: 5000 });

    // Find and click the close button
    const closeButton = slideoutPanel.locator('button[aria-label*="Close"], button svg[class*="chevron"], button').first();
    await expect(closeButton).toBeVisible();
    await closeButton.click();

    // Check transition classes during closing
    const slideoutElement = await slideoutPanel.first();
    
    // Wait a bit for the closing animation to start
    await page.waitForTimeout(100);
    
    // Verify closing animation classes
    const classList = await slideoutElement.getAttribute('class') || '';
    expect(classList).toContain('slideout-claude-transition');
    expect(classList).toContain('closing');

    // Verify panel eventually becomes hidden
    await expect(slideoutPanel).not.toBeVisible({ timeout: 5000 });
  });

  test('slideout panel has proper width and positioning', async ({ page }) => {
    // Open slideout
    const gridItems = page.locator('.grid [role="button"], .grid button, [data-testid*="video"], .video-card').first();
    await gridItems.waitFor({ timeout: 10000 });
    await gridItems.click();

    const slideoutPanel = page.locator('[class*="slideout"], [data-testid="slideout"], .fixed.z-50');
    await expect(slideoutPanel).toBeVisible({ timeout: 5000 });

    // Check positioning (should be on the right side)
    const panelBox = await slideoutPanel.boundingBox();
    const viewportSize = page.viewportSize() || { width: 1200, height: 800 };
    
    // Panel should be positioned on the right side
    expect(panelBox?.x || 0).toBeGreaterThan(viewportSize.width * 0.3); // At least 30% from left

    // Check width is appropriate (should be 600px for 'lg' width on desktop)
    const expectedWidth = 600; // 'lg' width from our config
    expect(panelBox?.width || 0).toBeCloseTo(expectedWidth, 50); // Allow 50px tolerance
  });

  test('slideout panel responds to keyboard interaction', async ({ page }) => {
    // Open slideout
    const gridItems = page.locator('.grid [role="button"], .grid button, [data-testid*="video"], .video-card').first();
    await gridItems.waitFor({ timeout: 10000 });
    await gridItems.click();

    const slideoutPanel = page.locator('[class*="slideout"], [data-testid="slideout"], .fixed.z-50');
    await expect(slideoutPanel).toBeVisible({ timeout: 5000 });

    // Test Escape key closes the slideout
    await page.keyboard.press('Escape');
    await expect(slideoutPanel).not.toBeVisible({ timeout: 5000 });
  });

  test('slideout panel maintains consistent behavior on different viewport sizes', async ({ page }) => {
    const viewportSizes = [
      { width: 1200, height: 800 }, // Desktop
      { width: 768, height: 1024 }, // Tablet
      { width: 375, height: 667 }   // Mobile
    ];

    for (const viewport of viewportSizes) {
      await page.setViewportSize(viewport);
      await page.reload();
      await page.waitForLoadState('networkidle');

      // Open slideout
      const gridItems = page.locator('.grid [role="button"], .grid button, [data-testid*="video"], .video-card').first();
      await gridItems.waitFor({ timeout: 10000 });
      await gridItems.click();

      const slideoutPanel = page.locator('[class*="slideout"], [data-testid="slideout"], .fixed.z-50');
      await expect(slideoutPanel).toBeVisible({ timeout: 5000 });

      // Verify animation classes are present regardless of viewport
      const slideoutElement = await slideoutPanel.first();
      const classList = await slideoutElement.getAttribute('class') || '';
      expect(classList).toContain('slideout-claude-transition');

      // Close slideout for next iteration
      await page.keyboard.press('Escape');
      await expect(slideoutPanel).not.toBeVisible({ timeout: 5000 });
    }
  });

  test('multiple slideout interactions work smoothly', async ({ page }) => {
    // Test opening and closing slideout multiple times
    const gridItems = page.locator('.grid [role="button"], .grid button, [data-testid*="video"], .video-card');
    const firstItem = gridItems.first();
    await firstItem.waitFor({ timeout: 10000 });

    const slideoutPanel = page.locator('[class*="slideout"], [data-testid="slideout"], .fixed.z-50');

    // Open and close slideout 3 times to test animation consistency
    for (let i = 0; i < 3; i++) {
      // Open
      await firstItem.click();
      await expect(slideoutPanel).toBeVisible({ timeout: 5000 });

      // Verify animation classes
      const slideoutElement = await slideoutPanel.first();
      const classList = await slideoutElement.getAttribute('class') || '';
      expect(classList).toContain('slideout-claude-transition');
      expect(classList).toContain('opening');

      // Close
      await page.keyboard.press('Escape');
      await expect(slideoutPanel).not.toBeVisible({ timeout: 5000 });

      // Small delay between iterations
      await page.waitForTimeout(200);
    }
  });
});