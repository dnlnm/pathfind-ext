import { getServerConfig } from '@/lib/storage';

async function checkAndSetBadge(tabId: number, url: string) {
  const { serverUrl, apiToken } = await getServerConfig();
  if (!serverUrl || !apiToken) {
    await browser.action.setBadgeText({ text: '', tabId });
    return;
  }

  // Skip non-http URLs
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    await browser.action.setBadgeText({ text: '', tabId });
    return;
  }

  try {
    const res = await fetch(
      `${serverUrl}/api/bookmarks/check?url=${encodeURIComponent(url)}`,
      {
        headers: { Authorization: `Bearer ${apiToken}` },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (data.bookmarked) {
        await browser.action.setBadgeText({ text: '✓', tabId });
        await browser.action.setBadgeBackgroundColor({ color: '#22c55e', tabId });
      } else {
        await browser.action.setBadgeText({ text: '', tabId });
      }
    } else {
      await browser.action.setBadgeText({ text: '', tabId });
    }
  } catch {
    await browser.action.setBadgeText({ text: '', tabId });
  }
}

export default defineBackground(() => {
  // Check bookmark status when tab is activated
  browser.tabs.onActivated.addListener(async (activeInfo) => {
    try {
      const tab = await browser.tabs.get(activeInfo.tabId);
      if (tab.url) {
        await checkAndSetBadge(activeInfo.tabId, tab.url);
      }
    } catch {
      // Tab may have been closed
    }
  });

  // Check bookmark status when tab URL changes
  browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      await checkAndSetBadge(tabId, tab.url);
    }
  });

  // Context menu: "Save to PathFind"
  browser.contextMenus.create({
    id: 'save-to-pathfind',
    title: 'Save to PathFind',
    contexts: ['page', 'link'],
  });

  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId !== 'save-to-pathfind') return;

    const urlToSave = info.linkUrl || info.pageUrl;
    if (!urlToSave) return;

    const { serverUrl, apiToken } = await getServerConfig();
    if (!serverUrl || !apiToken) {
      // Could show a notification prompting config
      return;
    }

    try {
      const res = await fetch(`${serverUrl}/api/bookmarks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: urlToSave }),
      });

      if (res.ok) {
        // Update badge for current tab
        if (tab?.id && tab.url === urlToSave) {
          await browser.action.setBadgeText({ text: '✓', tabId: tab.id });
          await browser.action.setBadgeBackgroundColor({ color: '#22c55e', tabId: tab.id });
        }
      }
    } catch {
      // Silently fail — user can retry
    }
  });

  // Handle messages from content scripts (avoids mixed-content issues)
  browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.type === 'searchBookmarks') {
      (async () => {
        const { serverUrl, apiToken } = await getServerConfig();
        if (!serverUrl || !apiToken) {
          sendResponse({ bookmarks: [] });
          return;
        }
        try {
          const params = new URLSearchParams({ q: message.query, limit: String(message.limit || 5) });
          const res = await fetch(`${serverUrl}/api/bookmarks?${params}`, {
            headers: { Authorization: `Bearer ${apiToken}` },
          });
          if (res.ok) {
            const data = await res.json();
            sendResponse({ bookmarks: data.bookmarks || [] });
          } else {
            sendResponse({ bookmarks: [] });
          }
        } catch {
          sendResponse({ bookmarks: [] });
        }
      })();
      return true; // keeps the message channel open for async sendResponse
    }
  });
});

