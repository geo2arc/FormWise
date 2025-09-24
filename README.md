# FormWise AI: Intelligent Form Autofill

A beautiful, minimalist, and intelligent Chrome extension that autofills web forms with one click using AI-powered data profiles.

[cloudflarebutton]

## ✨ Key Features

-   **One-Click Autofill:** Intelligently fills web forms using your saved data profiles.
-   **Profile Management:** Create, edit, and manage multiple data profiles (e.g., 'Personal', 'Work') with ease.
-   **Secure Local Storage:** All your profile data is stored securely on your device using `chrome.storage.local`.
-   **Sleek & Minimalist UI:** A clean, intuitive, and visually stunning interface built for a delightful user experience.
-   **Quick Access Popup:** A compact popup to quickly select a profile and fill forms on the current page.
-   **Comprehensive Options Page:** A full-page interface for detailed profile management and settings configuration.

## 🚀 Technology Stack

-   **Framework:** [React](https://react.dev/)
-   **Build Tool:** [Vite](https://vitejs.dev/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
-   **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
-   **Icons:** [Lucide React](https://lucide.dev/)
-   **Animation:** [Framer Motion](https://www.framer.com/motion/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Platform:** [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)

## 🔧 Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have [Bun](https://bun.sh/) installed on your system.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/formwise_ai.git
    cd formwise_ai
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

## 🛠️ Development

To start the development server and build the extension for testing:

1.  **Build the extension in watch mode:**
    This command will watch for file changes and rebuild the extension automatically.
    ```bash
    bun build --watch
    ```
    This will create a `dist` directory containing the unpacked extension files.

2.  **Load the extension in Chrome:**
    -   Open Google Chrome and navigate to `chrome://extensions`.
    -   Enable "Developer mode" using the toggle in the top-right corner.
    -   Click on the "Load unpacked" button.
    -   Select the `dist` directory from the project folder.

The FormWise AI extension icon should now appear in your Chrome toolbar. Any changes you make to the source code will be automatically rebuilt, and you can reload the extension from the `chrome://extensions` page to see the updates.

## 📦 Building for Production

To create an optimized production build of the extension, run:

```bash
bun build
```

This will generate the final production-ready files in the `dist` directory, which you can then package into a `.zip` file for submission to the Chrome Web Store.

## ☁️ Deployment

While the core of this project is a Chrome Extension, it may include a Cloudflare Worker for backend functionalities in later phases.

To deploy the worker component to Cloudflare:

1.  **Login to Wrangler:**
    ```bash
    bun wrangler login
    ```

2.  **Deploy the worker:**
    ```bash
    bun deploy
    ```

This command will build and deploy the worker defined in `worker/index.ts` to your Cloudflare account.

[cloudflarebutton]

## 🏛️ Architecture

The extension is built with a modern Chrome Extension architecture:

-   **Popup:** A React UI for quick interactions, allowing users to select profiles and trigger form filling.
-   **Options Page:** A full-page React application for comprehensive profile and settings management (CRUD).
-   **Content Script:** A script injected into web pages to interact with forms (reading and writing data).
-   **Background Service Worker:** A central script that manages state, handles events, and orchestrates communication between different parts of the extension.

All user data is persisted in `chrome.storage.local`, ensuring it remains secure and private on the user's device.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.