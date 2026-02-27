export default defineContentScript({
  matches: ['<all_urls>'],
  main() {
    // Content script kept minimal.
    // Badge indicator is handled entirely by the background worker.
    // This entry point is reserved for future content-level features
    // (e.g., highlight bookmarked links on a page).
  },
});
