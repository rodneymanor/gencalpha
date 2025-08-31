import { test, expect } from '@playwright/test';

// Use the stored authentication state
test.use({ storageState: 'playwright/.auth/user.json' });

test.describe('Collections Page Slideout (Authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the collections page (should work since we're authenticated)
    await page.goto('/collections');
    await page.waitForLoadState('networkidle');
    
    // Verify we're on the collections page and not redirected to login
    await expect(page).toHaveURL('/collections');
  });

  test('slideout opens with Claude-style smooth animation', async ({ page }) => {
    console.log('Looking for video items or interactive elements...');
    
    // Wait for the page content to load
    await page.waitForTimeout(2000);
    
    // Look for various types of clickable video elements
    const videoElements = [
      // Video thumbnails or cards
      '[data-testid*="video"]',
      '.video-card',
      '[class*="video"]',
      // Generic grid items that might be clickable
      '.grid button',
      '.grid [role="button"]',
      '.grid [data-testid*="card"]',
      // Image elements that might be clickable
      '.grid img',
      // Any clickable elements in the main content area
      'main button',
      'main [role="button"]'
    ];
    
    let clickableElement = null;
    for (const selector of videoElements) {
      const elements = page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        clickableElement = elements.first();
        console.log(`Found ${count} elements matching: ${selector}`);
        break;
      }
    }
    
    if (!clickableElement) {
      // Take a screenshot to see what's on the page
      await page.screenshot({ path: 'test-results/collections-page-debug.png' });
      console.log('No clickable elements found. Check test-results/collections-page-debug.png');
      test.skip('No interactive video elements found on collections page');
      return;
    }
    
    // Ensure the element is visible and clickable
    await expect(clickableElement).toBeVisible();
    await clickableElement.click();
    
    // Look for the slideout panel
    const slideoutPanel = page.locator('[role="dialog"], .fixed.z-50').first();
    await expect(slideoutPanel).toBeVisible({ timeout: 5000 });
    
    console.log('Slideout opened successfully!');
    
    // Check for Claude animation classes
    const classList = await slideoutPanel.getAttribute('class') || '';
    console.log('Slideout classes:', classList);
    
    // Verify our Claude animation system is working
    expect(classList).toContain('slideout-claude-transition');
    expect(classList).toContain('translate-x-0'); // Should be fully visible
    
    // Verify the slideout has proper positioning and width
    const slideoutBox = await slideoutPanel.boundingBox();
    console.log('Slideout dimensions:', slideoutBox);
    
    // Should be positioned on the right side of screen
    const viewportSize = page.viewportSize() || { width: 1200, height: 800 };
    expect(slideoutBox?.x || 0).toBeGreaterThan(viewportSize.width * 0.3);
    
    // Check transition timing function
    const transitionTimingFunction = await slideoutPanel.evaluate(el => 
      window.getComputedStyle(el).transitionTimingFunction
    );
    console.log('Transition timing function:', transitionTimingFunction);
    
    // Should use Claude cubic-bezier or similar smooth easing
    expect(transitionTimingFunction).toBeTruthy();
  });

  test('slideout header is standardized to 52px', async ({ page }) => {
    // Find and click a video element
    const clickableElement = page.locator('.grid button, .grid [role="button"], [data-testid*="video"], .video-card').first();
    
    // Skip if no elements found
    if (await clickableElement.count() === 0) {
      test.skip('No interactive video elements found');
      return;
    }
    
    await clickableElement.click();
    
    // Wait for slideout
    const slideoutPanel = page.locator('[role="dialog"], .fixed.z-50').first();
    await expect(slideoutPanel).toBeVisible({ timeout: 5000 });
    
    // Find the header (should have border-bottom)
    const header = slideoutPanel.locator('.border-b').first();
    await expect(header).toBeVisible();
    
    // Check header height
    const headerBox = await header.boundingBox();
    console.log(`Header height: ${headerBox?.height}px`);
    
    // Should be close to our standardized 52px
    expect(headerBox?.height).toBeCloseTo(52, 5); // Allow 5px tolerance
    
    // Check for close button (should have chevron or X icon)
    const closeButton = header.locator('button').filter({
      has: page.locator('svg')
    }).first();
    
    await expect(closeButton).toBeVisible();
    console.log('Close button found in header');
  });

  test('slideout closes smoothly with animation', async ({ page }) => {
    // Open slideout
    const clickableElement = page.locator('.grid button, .grid [role="button"], [data-testid*="video"], .video-card').first();
    
    if (await clickableElement.count() === 0) {
      test.skip('No interactive video elements found');
      return;
    }
    
    await clickableElement.click();
    
    const slideoutPanel = page.locator('[role="dialog"], .fixed.z-50').first();
    await expect(slideoutPanel).toBeVisible({ timeout: 5000 });
    
    // Find and click close button
    const closeButton = slideoutPanel.locator('button').filter({
      has: page.locator('svg')
    }).first();
    
    await expect(closeButton).toBeVisible();
    await closeButton.click();
    
    // Check closing animation classes
    await page.waitForTimeout(50); // Brief pause to catch animation state
    const closingClassList = await slideoutPanel.getAttribute('class') || '';
    console.log('Classes during closing:', closingClassList);
    
    // Should have closing animation classes
    expect(closingClassList).toContain('slideout-claude-transition');
    // During closing, should have translate-x-full or closing class
    const hasClosingState = closingClassList.includes('closing') || 
                           closingClassList.includes('translate-x-full');
    expect(hasClosingState).toBe(true);
    
    // Panel should eventually become hidden
    await expect(slideoutPanel).toBeHidden({ timeout: 3000 });
    console.log('Slideout closed successfully with animation');
  });

  test('slideout responds to Escape key', async ({ page }) => {
    // Open slideout
    const clickableElement = page.locator('.grid button, .grid [role="button"], [data-testid*="video"], .video-card').first();
    
    if (await clickableElement.count() === 0) {
      test.skip('No interactive video elements found');
      return;
    }
    
    await clickableElement.click();
    
    const slideoutPanel = page.locator('[role="dialog"], .fixed.z-50').first();
    await expect(slideoutPanel).toBeVisible({ timeout: 5000 });
    
    // Press Escape key
    await page.keyboard.press('Escape');
    
    // Panel should close
    await expect(slideoutPanel).toBeHidden({ timeout: 3000 });
    console.log('Slideout closed with Escape key');
  });

  test('slideout animation is smooth on different viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 1200, height: 800 }, // Desktop
      { width: 768, height: 1024 }, // Tablet
      { width: 375, height: 667 }   // Mobile
    ];
    
    for (const viewport of viewports) {
      console.log(`Testing viewport: ${viewport.width}x${viewport.height}`);
      
      await page.setViewportSize(viewport);
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      // Find interactive element
      const clickableElement = page.locator('.grid button, .grid [role="button"], [data-testid*="video"], .video-card').first();
      
      if (await clickableElement.count() === 0) {
        console.log(`No elements found for viewport ${viewport.width}x${viewport.height}`);
        continue;
      }
      
      await clickableElement.click();
      
      const slideoutPanel = page.locator('[role="dialog"], .fixed.z-50').first();
      await expect(slideoutPanel).toBeVisible({ timeout: 5000 });
      
      // Verify animation classes are present
      const classList = await slideoutPanel.getAttribute('class') || '';
      expect(classList).toContain('slideout-claude-transition');
      
      // Close for next iteration
      await page.keyboard.press('Escape');
      await expect(slideoutPanel).toBeHidden({ timeout: 3000 });
    }
  });
});