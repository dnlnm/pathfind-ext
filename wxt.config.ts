import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Pathfind',
    description: 'Save bookmarks to your self-hosted Pathfind instance',
    permissions: ['activeTab', 'contextMenus', 'storage'],
    host_permissions: ['<all_urls>'],
  },
});
