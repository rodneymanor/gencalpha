import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = 'playwright/.auth/user.json';

setup('authenticate with Google', async ({ page }) => {
  console.log('Setting up authentication...');
  
  // Navigate to your app
  await page.goto('/collections');
  
  // If already logged in, save the state and exit
  try {
    await page.waitForURL('/collections', { timeout: 5000 });
    console.log('Already authenticated, saving state...');
    await page.context().storageState({ path: authFile });
    return;
  } catch {
    console.log('Not authenticated, proceeding with login...');
  }
  
  // Wait for Google login redirect or login button
  console.log('Waiting for login flow...');
  
  // This will pause the script so you can manually log in
  // The browser will stay open for you to complete the authentication
  await page.pause();
  
  // After you manually log in and get redirected to /collections
  // Wait for successful login
  await page.waitForURL('/collections', { timeout: 120000 }); // 2 minutes timeout
  
  // Verify we're logged in by checking for user-specific content
  await expect(page.locator('body')).not.toContain('Sign in');
  
  console.log('Authentication successful! Saving session...');
  
  // Save the authentication state
  await page.context().storageState({ path: authFile });
  
  console.log('Authentication state saved to:', authFile);
});