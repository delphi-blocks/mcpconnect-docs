# MCPConnect Documentation

This repository contains the official documentation for [MCPConnect](https://github.com/delphi-blocks/mcpconnect-docs), a powerful, attribute-driven Delphi library for building Model Context Protocol (MCP) servers. MCPConnect lets you expose existing Delphi classes as MCP tools, resources, and prompts with minimal boilerplate, supporting multiple transports (HTTP via WebBroker/Indy and STDIO) and full JSON-RPC 2.0 compliance.

## Documentation Build with VitePress

The MCPConnect documentation is built using [VitePress](https://vitepress.dev/), a modern, fast static site generator powered by Vite and Vue.js. Below are the steps to set up the environment, build the documentation, and serve it locally.

### Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) version 18 or higher.
- Terminal for accessing VitePress via its command line interface (CLI).

### Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/delphi-blocks/mcpconnect-docs.git
   cd mcpconnect-docs
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

### Running the Documentation Locally

To run the documentation on a local server for development purposes, use the following command:

```bash
npm run docs:dev
```

This will start a local server, and the documentation will be available at `http://localhost:5173/`. VitePress will automatically reload when changes are made to the documentation files.

### Building the Documentation for Production

To generate a production build of the documentation, run the following command:

```bash
npm run docs:build
```

This command will create a static version of the site in the `docs/.vitepress/dist` directory. The documentation is published at [https://mcpconnect.delphiblocks.dev/](https://mcpconnect.delphiblocks.dev/).

## Contributions

We welcome contributions to both the MCPConnect documentation and its underlying build process. If you have suggestions or improvements, feel free to open a pull request or file an issue. Let’s work together to keep the documentation clear and up-to-date!

---

- [MCPConnect repository](https://github.com/delphi-blocks/mcpconnect) — the main library
- [mcpconnect-docs repository](https://github.com/delphi-blocks/mcpconnect-docs) — this documentation project
- [https://mcpconnect.delphiblocks.dev/](https://mcpconnect.delphiblocks.dev/) — the official documentation site