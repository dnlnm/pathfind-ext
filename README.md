# PathFind Extension

[![WXT](https://img.shields.io/badge/Framework-WXT-blueviolet?style=for-the-badge&logo=wxt)](https://wxt.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

The official browser extension for the [PathFind](https://github.com/dnlnm/pathfind) bookmark manager. Save any web page to your self-hosted PathFind instance with just one click.

![PathFind Extension Mockup](pathfind_ext_mockup_1772558550168.png)

---

## 🌐 The PathFind Ecosystem

- **[PathFind Web](https://github.com/dnlnm/pathfind)**: The core self-hosted server and dashboard.
- **[PathFind Extension](https://github.com/dnlnm/pathfind-ext)**: Browser extension for Chrome, Edge, and Firefox.
- **[PathFind iOS](https://github.com/dnlnm/pathfind-ios)**: Native SwiftUI mobile app for iPhone.
- **[PathFind Android](https://github.com/dnlnm/pathfind-kt)**: Native Kotlin & Compose mobile app.

---

## ✨ Features

- **🚀 Quick Save**: Clip the current tab instantly via the extension popup.
- **🖱️ Context Menu**: Right-click on any link or image to save it directly to a specific collection.
- **✅ Status Indicator**: Visual icon badge indicates if the current URL is already saved in your PathFind instance.
- **📁 Smart Organization**: Choose collections and add tags directly from the popup.
- **🔒 Secure**: Connects via personal API tokens generated from your PathFind Settings.

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- A running [PathFind](https://github.com/dnlnm/pathfind) instance.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dnlnm/pathfind-ext.git
   cd pathfind-ext
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

To start the development server with Hot Module Replacement (HMR):

- **Chrome/Edge/Brave**: `npm run dev`
- **Firefox**: `npm run dev:firefox`

### Build

To build the extension for production:

- **Chrome**: `npm run build`
- **Firefox**: `npm run build:firefox`

The packaged files will be available in the `.output` directory.

---

## 🛠 Tech Stack

- **Framework**: [WXT](https://wxt.dev/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Components**: [Radix UI](https://www.radix-ui.com/)

---

## 📄 License

MIT © [dnlnm](https://github.com/dnlnm)

