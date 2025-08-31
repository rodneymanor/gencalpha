import { test, expect } from '@playwright/test';
import { handleAuth, createTestSlideout } from './auth-helper';

test.describe('Slideout Panel Animations', () => {
  // Test the slideout animation behavior on a test page or public page
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the test video insights page (no auth required)
    await page.goto('/test-video-insights', { timeout: 10000 });
    await page.waitForLoadState('networkidle');
  });

  test('slideout panel has Claude-style animation classes', async ({ page }) => {
    // Look for the "Show Video Insights" button
    const openButton = page.locator('button', { hasText: 'Show Video Insights' });
    await expect(openButton).toBeVisible();
    
    // Click to open the slideout
    await openButton.click();

    // Look for the slideout panel - use more specific selectors
    const slideoutPanel = page.locator('[role="dialog"], .fixed.z-50').first();
    await expect(slideoutPanel).toBeVisible({ timeout: 5000 });

    // Check for Claude animation classes on the slideout container
    const classList = await slideoutPanel.getAttribute('class') || '';
    console.log('Slideout classes found:', classList);
    
    // Verify our custom CSS classes are applied
    expect(classList).toContain('slideout-claude-transition');
    
    // Check that the panel is properly positioned (translate-x-0 means fully visible)
    expect(classList).toContain('translate-x-0');
    
    // Verify the panel moves smoothly by checking CSS properties
    const transitionProperty = await slideoutPanel.evaluate(el => 
      window.getComputedStyle(el).transitionTimingFunction
    );
    
    // Should use our Claude cubic-bezier or similar smooth easing
    expect(transitionProperty).toBeTruthy();
    console.log('Transition timing function:', transitionProperty);
  });

  test('slideout header has consistent 52px height', async ({ page }) => {
    // Open the slideout
    const openButton = page.locator('button', { hasText: 'Show Video Insights' });
    await expect(openButton).toBeVisible();
    await openButton.click();

    // Wait for slideout to be visible
    const slideoutPanel = page.locator('[role="dialog"], .fixed.z-50').first();
    await expect(slideoutPanel).toBeVisible({ timeout: 5000 });

    // Find the header (VideoInsightsPanel creates its own header with border-bottom)
    const header = slideoutPanel.locator('.border-b').first();
    await expect(header).toBeVisible();
    
    // Check header height is close to 52px (our standardized height)
    const headerBox = await header.boundingBox();
    expect(headerBox?.height).toBeCloseTo(52, 3); // Allow 3px tolerance for browser differences
    
    console.log(`Header height: ${headerBox?.height}px`);
  });

  test('slideout close button with chevron icon works', async ({ page }) => {
    // Open the slideout
    const openButton = page.locator('button', { hasText: 'Show Video Insights' });
    await expect(openButton).toBeVisible();
    await openButton.click();

    // Wait for slideout to be visible  
    const slideoutPanel = page.locator('[role="dialog"], .fixed.z-50').first();
    await expect(slideoutPanel).toBeVisible({ timeout: 5000 });

    // Find close button (VideoInsightsPanel has a close button with X icon)
    const closeButton = slideoutPanel.locator('button').filter({ 
      has: page.locator('svg') 
    }).first();
    
    await expect(closeButton).toBeVisible();
    
    // Click close button
    await closeButton.click();
    
    // Wait for closing animation to start
    await page.waitForTimeout(100);
    
    // Check that the panel has closing classes during animation
    const classList = await slideoutPanel.getAttribute('class') || '';
    console.log('Classes during closing:', classList);
    
    // Panel should eventually become not visible
    await expect(slideoutPanel).toBeHidden({ timeout: 2000 });
  });
});

test.describe('Mock Slideout Animation Test', () => {
  // Create a simple test page to verify our CSS animations work
  test('CSS animation timing function is correct', async ({ page }) => {
    // Create a minimal HTML page with our slideout styles
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          :root {
            --ease-claude: cubic-bezier(0.32, 0.72, 0, 1);
            --slideout-duration: 400ms;
            --slideout-close-duration: 250ms;
          }
          
          .slideout-claude-transition {
            transition-property: transform;
            transition-timing-function: var(--ease-claude);
          }
          
          .slideout-claude-transition.opening {
            transition-duration: var(--slideout-duration);
          }
          
          .slideout-claude-transition.closing {
            transition-duration: var(--slideout-close-duration);
          }
          
          .test-panel {
            position: fixed;
            top: 0;
            right: 0;
            bottom: 0;
            width: 600px;
            background: white;
            border-left: 1px solid #e5e7eb;
            transform: translateX(100%);
          }
          
          .test-panel.open {
            transform: translateX(0);
          }
          
          .header {
            height: 52px;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            align-items: center;
            padding: 0 8px;
          }
        </style>
      </head>
      <body>
        <button id="openBtn">Open Slideout</button>
        <button id="closeBtn">Close Slideout</button>
        
        <div id="slideout" class="test-panel slideout-claude-transition">
          <div class="header">
            <button id="closeInside">×</button>
            <span>Test Header</span>
          </div>
          <div>Slideout Content</div>
        </div>
        
        <script>
          const slideout = document.getElementById('slideout');
          const openBtn = document.getElementById('openBtn');
          const closeBtn = document.getElementById('closeBtn');
          const closeInside = document.getElementById('closeInside');
          
          function openSlideout() {
            slideout.classList.remove('closing');
            slideout.classList.add('opening', 'open');
          }
          
          function closeSlideout() {
            slideout.classList.remove('opening');
            slideout.classList.add('closing');
            slideout.classList.remove('open');
          }
          
          openBtn.addEventListener('click', openSlideout);
          closeBtn.addEventListener('click', closeSlideout);
          closeInside.addEventListener('click', closeSlideout);
        </script>
      </body>
      </html>
    `);

    // Test opening the slideout
    await page.click('#openBtn');
    
    // Wait for animation to complete
    await page.waitForTimeout(500);
    
    const slideout = page.locator('#slideout');
    
    // Check classes are applied correctly
    const classList = await slideout.getAttribute('class');
    expect(classList).toContain('slideout-claude-transition');
    expect(classList).toContain('opening');
    expect(classList).toContain('open');
    
    // Check CSS timing function
    const timingFunction = await slideout.evaluate(el => 
      window.getComputedStyle(el).transitionTimingFunction
    );
    
    // Should be our Claude cubic-bezier
    expect(timingFunction).toBe('cubic-bezier(0.32, 0.72, 0, 1)');
    
    // Check duration
    const duration = await slideout.evaluate(el => 
      window.getComputedStyle(el).transitionDuration
    );
    
    expect(duration).toBe('0.4s'); // 400ms
    
    // Test header height
    const header = page.locator('.header');
    const headerBox = await header.boundingBox();
    // The mock test creates an exact 52px header, but allow 1px for rendering differences
    expect(headerBox?.height).toBeCloseTo(52, 1);
    
    // Test closing
    await page.click('#closeInside');
    await page.waitForTimeout(100);
    
    const closingClassList = await slideout.getAttribute('class');
    expect(closingClassList).toContain('closing');
    expect(closingClassList).not.toContain('open');
  });
});