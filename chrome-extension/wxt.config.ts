import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'GenC Extension',
    description: 'Quick actions for Gen C API',
    permissions: ['storage', 'contextMenus'],
    host_permissions: ['http://localhost:3000/*', 'https://gencpro.app/*'],
    options_ui: {
      page: 'options.html',
      open_in_tab: true,
    },
    action: {
      default_title: 'GenC',
    },
  },
});
