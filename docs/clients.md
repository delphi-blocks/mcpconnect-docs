# Connecting LLM Clients

Once your MCP server is running, configure your LLM client to connect to it.

## Prerequisites

Before configuring any client, ensure:
1. Your MCP server is running and accessible (e.g., `http://localhost:8080/mcp`)
2. You know the authentication token if your server requires one
3. The endpoint path matches your `TJRPCDispatcher.PathInfo` setting

## LM Studio

LM Studio supports HTTP-based MCP servers natively.

**Configuration file location:**
- Windows: `%USERPROFILE%\.lmstudio\mcp.json`
- macOS/Linux: `~/.lmstudio/mcp.json`

```json
{
  "mcpServers": {
    "delphi-mcp-server": {
      "url": "http://localhost:8080/mcp",
      "headers": {
        "Authorization": "Bearer my-secret-token"
      }
    }
  }
}
```

| Parameter | Description |
|-----------|-------------|
| `delphi-mcp-server` | A unique identifier for your server (any name) |
| `url` | The full URL to your MCP server endpoint |
| `headers` | Optional HTTP headers (e.g., for authentication) |

After saving the configuration, restart LM Studio to load the new MCP server.

## Claude Desktop

Claude Desktop currently requires an intermediate tool called `mcp-remote` to connect to HTTP-based MCP servers.

### Step 1: Test the Connection

Before configuring Claude Desktop, verify that `mcp-remote` can connect to your server:

```bash
npx mcp-remote http://localhost:8080/mcp --header "Authorization: Bearer my-secret-token"
```

If successful, you should see your server's capabilities listed.

### Step 2: Configure Claude Desktop

**Configuration file location:**
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "my-demo-server": {
      "command": "C:\\Program Files\\nodejs\\npx",
      "args": [
        "-y",
        "mcp-remote",
        "http://localhost:8080/mcp",
        "--header",
        "Authorization: Bearer my-secret-token"
      ]
    }
  }
}
```

| Parameter | Description |
|-----------|-------------|
| `my-demo-server` | A unique identifier for your server |
| `command` | Path to `npx` (Windows: `C:\\Program Files\\nodejs\\npx`, macOS/Linux: `npx`) |
| `-y` | Auto-confirm package installation |
| `mcp-remote` | Bridge tool for HTTP transport |

### Step 3: Restart Claude Desktop

After saving the configuration, restart Claude Desktop to load the MCP server connection.
