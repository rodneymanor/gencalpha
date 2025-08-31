import { Page } from '@playwright/test';

// Helper function to handle authentication if needed
export async function handleAuth(page: Page) {
  try {
    // Check if we're on a login/auth page
    const isAuthPage = await page.locator('input[type="email"], input[type="password"], [data-testid*="login"], [data-testid*="auth"]').count() > 0;
    
    if (isAuthPage) {
      console.log('Authentication required - this test requires manual login or auth setup');
      return false;
    }
    
    return true;
  } catch (error) {
    console.log('Auth check failed:', error);
    return false;
  }
}

// Create a test slideout for animation testing
export async function createTestSlideout(page: Page) {
  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head>
      <script src="https://cdn.tailwindcss.com"></script>
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
      </style>
    </head>
    <body class="bg-gray-100">
      <div class="p-8">
        <h1 class="text-2xl font-bold mb-4">Slideout Animation Test</h1>
        <button id="openBtn" class="bg-blue-500 text-white px-4 py-2 rounded">
          Open Slideout
        </button>
      </div>
      
      <div 
        id="slideout" 
        class="fixed top-0 right-0 bottom-0 w-full md:w-[600px] bg-white border-l border-gray-200 transform translate-x-full slideout-claude-transition z-50"
      >
        <div class="h-[52px] border-b border-gray-200 flex items-center justify-between p-2">
          <div class="flex items-center gap-2">
            <button id="closeBtn" class="h-9 w-9 p-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <span class="text-sm font-semibold">Test Slideout</span>
          </div>
          <div class="flex items-center gap-2">
            <button class="bg-gray-100 border border-gray-200 rounded px-3 py-1.5 text-xs hover:bg-gray-200 transition-colors">
              Copy
            </button>
          </div>
        </div>
        
        <div class="p-6">
          <h2 class="text-lg font-semibold mb-4">Slideout Content</h2>
          <p class="text-gray-600 mb-4">
            This slideout demonstrates the Claude-style animation with:
          </p>
          <ul class="list-disc list-inside space-y-2 text-gray-600">
            <li>52px standardized header height</li>
            <li>Claude cubic-bezier easing (0.32, 0.72, 0, 1)</li>
            <li>400ms opening, 250ms closing duration</li>
            <li>Chevron close button on the left</li>
            <li>Consistent spacing and styling</li>
          </ul>
        </div>
      </div>
      
      <script>
        const slideout = document.getElementById('slideout');
        const openBtn = document.getElementById('openBtn');
        const closeBtn = document.getElementById('closeBtn');
        
        let isOpen = false;
        
        function openSlideout() {
          slideout.classList.remove('closing', 'translate-x-full');
          slideout.classList.add('opening', 'translate-x-0');
          isOpen = true;
        }
        
        function closeSlideout() {
          slideout.classList.remove('opening', 'translate-x-0');
          slideout.classList.add('closing', 'translate-x-full');
          isOpen = false;
        }
        
        openBtn.addEventListener('click', openSlideout);
        closeBtn.addEventListener('click', closeSlideout);
        
        // Close on Escape key
        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && isOpen) {
            closeSlideout();
          }
        });
      </script>
    </body>
    </html>
  `);
}