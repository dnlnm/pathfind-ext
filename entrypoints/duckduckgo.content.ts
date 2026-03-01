import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { getServerConfig, getSearchInjectorEnabled } from '@/lib/storage';
import { SearchInjectorPanel } from '@/components/SearchInjectorPanel';
import type { Root } from 'react-dom/client';

/**
 * Extracts the search query from DuckDuckGo's URL.
 * DDG uses ?q= for all its search pages.
 */
function getDDGQuery(): string {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
}

/**
 * Finds or creates a mount point in DuckDuckGo's layout.
 * DDG has a sidebar column: .results--sidebar (classic layout).
 */
function getOrCreateMountPoint(): HTMLElement | null {
    const existing = document.getElementById('pf-sidebar-mount');
    if (existing) return existing;

    const mount = document.createElement('div');
    mount.id = 'pf-sidebar-mount';

    // Classic DDG sidebar
    const sidebar =
        document.querySelector<HTMLElement>('.results--sidebar') ||
        document.querySelector<HTMLElement>('.js-react-sidebar') ||
        document.querySelector<HTMLElement>('[data-testid="sidebar"]');

    if (sidebar) {
        sidebar.prepend(mount);
        return mount;
    }

    // Fallback: inject into the links wrapper as a float-right block
    const linksWrapper =
        document.getElementById('links_wrapper') ||
        document.getElementById('react-layout');

    if (linksWrapper) {
        mount.style.cssText = `
            margin-bottom: 16px;
            width: 289px;
            float: right;
            clear: right;
        `;
        linksWrapper.prepend(mount);
        return mount;
    }

    return null;
}

export default defineContentScript({
    matches: ['*://duckduckgo.com/*'],
    cssInjectionMode: 'ui',
    async main(ctx) {
        const [{ serverUrl, apiToken }, injectorEnabled] = await Promise.all([
            getServerConfig(),
            getSearchInjectorEnabled(),
        ]);

        if (!serverUrl || !apiToken || !injectorEnabled) return;

        const query = getDDGQuery();
        if (!query) return;

        const mountPoint = getOrCreateMountPoint();
        if (!mountPoint) return;

        const ui = await createShadowRootUi<Root>(ctx, {
            name: 'pf-ddg-injector',
            position: 'inline',
            anchor: mountPoint,
            append: 'first',
            onMount(uiContainer: HTMLElement) {
                const root = createRoot(uiContainer);
                root.render(createElement(SearchInjectorPanel, { query, serverUrl }));
                return root;
            },
            onRemove(root) {
                root?.unmount();
            },
        });

        ui.mount();
    },
});
