import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'GenC Extension',
    description: 'Save videos and content to your GenC workspace',
    permissions: ['storage', 'contextMenus', 'activeTab', 'scripting'],
    host_permissions: [
      'http://localhost:3000/*', 
      'https://www.gencapp.pro/*',
      'https://gencapp.pro/*'
    ],
    options_ui: {
      page: 'options.html',
      open_in_tab: true,
    },
    action: {
      default_title: 'GenC - Save to Collections',
    },
  },
  // Define environment variables
  vite: () => ({
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.PRODUCTION_URL': JSON.stringify('https://www.gencapp.pro'),
    },
  }),
});
