import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { getServerConfig, getSearchInjectorEnabled } from '@/lib/storage';
import { SearchInjectorPanel } from '@/components/SearchInjectorPanel';
import type { Root } from 'react-dom/client';

/**
 * Extracts the search query from the current Google search URL.
 * Google uses ?q= for desktop searches.
 */
function getGoogleQuery(): string {
    const params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
}

/**
 * Finds or creates an anchor element to mount the PathFind panel into.
 * On Google, we inject before the sidebar (#rhs) if it exists, or create a
 * dedicated container near the start of the results column.
 */
function getOrCreateMountPoint(): HTMLElement | null {
    const existing = document.getElementById('pf-sidebar-mount');
    if (existing) return existing;

    const mount = document.createElement('div');
    mount.id = 'pf-sidebar-mount';

    // When Google has a right-hand sidebar, prepend into it.
    const rhs = document.getElementById('rhs');
    if (rhs) {
        rhs.prepend(mount);
        return mount;
    }

    // Fallback: inject a floating container to the right of the results column.
    const centerCol = document.getElementById('center_col');
    if (centerCol) {
        mount.style.cssText = `
            position: absolute;
            top: 0;
            left: calc(100% + 24px);
            width: 360px;
        `;
        centerCol.style.position = 'relative';
        centerCol.prepend(mount);
        return mount;
    }

    return null;
}

export default defineContentScript({
    matches: ['*://www.google.com/search*'],
    cssInjectionMode: 'ui',
    async main(ctx) {
        const [{ serverUrl, apiToken }, injectorEnabled] = await Promise.all([
            getServerConfig(),
            getSearchInjectorEnabled(),
        ]);

        if (!serverUrl || !apiToken || !injectorEnabled) return;

        const query = getGoogleQuery();
        if (!query) return;

        const mountPoint = getOrCreateMountPoint();
        if (!mountPoint) return;

        const ui = await createShadowRootUi<Root>(ctx, {
            name: 'pf-google-injector',
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
