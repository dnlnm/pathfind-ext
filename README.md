# PathFind Browser Extension

Browser extension for the PathFind bookmark manager. This extension allows you to easily save links to your self-hosted PathFind instance directly from your browser.

## Features

- **Quick Save (Popup)**: Click the extension icon to quickly save the current tab to your PathFind instance.
- **Context Menu Integration**: Right-click on any page or link and use the "Save to PathFind" option to save it immediately.
- **Bookmark Status Indicator**: Displays a visual badge (✓) on the extension icon whenever you visit a URL that is already saved in your PathFind instance.
- **Custom Configuration**: Setup your custom PathFind Server URL and API Token for seamless integration with your self-hosted instance.

## Tech Stack

- [WXT](https://wxt.dev/) - Next-gen Web Extension Framework
- [React](https://react.dev/) - UI Library
- [Tailwind CSS](https://tailwindcss.com/) - utility-first CSS framework
- [Radix UI](https://www.radix-ui.com/) / shadcn-like components - Headless UI primitives

## Getting Started

### Prerequisites

- Node.js (v18 or newer recommended)
- npm (`npm install`)

### Installation

1. Clone the repository and navigate to the extension directory:
   ```bash
   cd pathfind-ext
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```

### Development

To start the development server with Hot Module Replacement (HMR):

- For Chrome/Edge/Brave:
  ```bash
  npm run dev
  ```
- For Firefox:
  ```bash
  npm run dev:firefox
  ```

### Build and Package

To build the extension for production:

- For Chrome:
  ```bash
  npm run build
  ```
- For Firefox:
  ```bash
  npm run build:firefox
  ```

To create a `.zip` file for web store distribution:

- For Chrome:
  ```bash
  npm run zip
  ```
- For Firefox:
  ```bash
  npm run zip:firefox
  ```

The packaged files will be available in the `.output` directory.
