import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'PathFind',
    description: 'Save bookmarks to your self-hosted PathFind instance',
    permissions: ['activeTab', 'contextMenus', 'storage'],
    host_permissions: ['<all_urls>'],
  },
});
