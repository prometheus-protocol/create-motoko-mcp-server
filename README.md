# Create Motoko MCP Server

[![npm version](https://img.shields.io/npm/v/create-motoko-mcp-server.svg)](https://www.npmjs.com/package/create-motoko-mcp-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

The official command-line tool to bootstrap a new, production-ready Motoko MCP server for the [Prometheus Protocol](https://github.com/prometheus-protocol/prometheus-protocol).

This tool generates a complete, batteries-included project so you can skip the boilerplate and focus on building your application's core logic.

## Features

The generated project includes:

-   **Complete Project Structure:** A ready-to-use Motoko project with `dfx.json` and `mops.json` pre-configured.
-   **Prometheus SDKs:** All necessary ICRC standards (`ICRC-126`, `ICRC-127`, etc.) are included as dependencies.
-   **Built-in NPM Scripts:** Common tasks like deploying, testing, and starting a local replica are available out-of-the-box.
-   **App Store Integration:** Comes with `@prometheus-protocol/app-store-cli` as a dev dependency and pre-configured scripts for easy publishing.
-   **Optional Auth:** A commented-out code block to easily enable Prometheus OAuth for monetization.
-   **Sample Tool:** A simple "echo" tool to demonstrate the basic structure of an MCP server.
-   **Self-Documenting:** Generates a detailed `README.md` within your new project to guide you further.

## Prerequisites

Before you begin, make sure you have the following tools installed:

1.  **Node.js:** Version 18.0 or higher. [Download](https://nodejs.org/).
2.  **DFX:** The DFINITY Canister SDK. [Installation Guide](https://internetcomputer.org/docs/current/developer-docs/setup/install/).
3.  **MOPS:** The Motoko Package Manager. [Installation Guide](https://mops.one/docs/install).

## 🚀 Usage (Quick Start)

To create a new project, run the following command in your terminal:

```bash
npx create-motoko-mcp-server my-awesome-app
```

This will create a new directory called `my-awesome-app` with the complete project structure.

Then, navigate into your new project and install the dependencies:

```bash
cd my-awesome-app
npm install
npm run mops:install
```

Your new server is now ready to be deployed!

## What You Get

Your new project directory will have the following structure:

```
my-awesome-app/
├── src/
│   └── main.mo       <-- Your server's main logic lives here!
├── dfx.json          <-- DFINITY Canister SDK configuration
├── mops.json         <-- Motoko package manager configuration
├── package.json      <-- npm scripts and dependencies
└── README.md         <-- A detailed guide for your new project
```

## Next Steps: Your Project's Journey

Once your project is created, the generated `README.md` inside `my-awesome-app/` will guide you through the following steps:

1.  **Deploy Locally:**
    -   `npm run start` (Starts the local replica)
    -   `npm run deploy` (Deploys your canister)

2.  **Test with the Inspector:**
    -   `npm run inspector` (Launches the MCP Inspector tool to test your server's functionality)

3.  **Enable Monetization (Optional):**
    -   Uncomment the auth code in `src/main.mo` and redeploy.
    -   Register your server with the auth service using `npm run auth register`.

4.  **Publish to the App Store:**
    -   `npm run app-store init` (Creates your `prometheus.yml` manifest)
    -   `npm run app-store submit` (Submits your WASM for verification)
    -   `npm run app-store status` (Monitors the audit and DAO approval process)
    -   `npm run app-store -- publish --app-version "0.1.0"` (Publishes the final, verified version)

## Contributing

Contributions to `create-motoko-mcp-server` are welcome! Please open an issue or submit a pull request on our [GitHub repository](https://github.com/prometheus-protocol/create-motoko-mcp-server).

## License

This project is licensed under the MIT License.