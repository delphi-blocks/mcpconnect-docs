# Testing

MCPConnect servers can be tested using different approaches, depending on your needs.

## Low-Level Testing with HTTP Clients

For low-level protocol testing, use standard HTTP clients like **Bruno** or **Postman** to send JSON-RPC requests directly to your MCP server endpoint.

Example test files for Bruno are available in the `demo/api` directory of the repository. These files demonstrate how to structure JSON-RPC calls for testing various MCP operations.

## Testing with MCPJam Inspector

For a more specialized experience, use **MCPJam Inspector** — a tool specifically designed for testing and debugging MCP servers. It provides a web-based interface to explore your server's capabilities and test tools interactively.

### Quick Start

```bash
npx @mcpjam/inspector@latest
```

This command will:
1. Download the latest version of MCPJam Inspector
2. Start a local server
3. Open a web interface where you can add and test your MCP server

From the web interface, add your Delphi MCP server by providing its endpoint URL (e.g., `http://localhost:8080/mcp`) and start testing your tools immediately.
