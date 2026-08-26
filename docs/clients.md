# Connecting LLM Clients

Once your MCP server is running, configure your LLM client to connect to it.

MCPConnect supports two transports, and the client configuration depends on which one your server uses:

| Transport | How it works | Authentication |
|-----------|-------------|----------------|
| **HTTP** (WebBroker, Indy) | The server runs as a standalone process listening on a port. The client connects to its URL. | API-Key or OAuth 2.1 |
| **STDIO** | The client launches the server executable as a child process and communicates over stdin/stdout pipes. | Not needed — the client owns the process |

## Prerequisites

**For HTTP servers:**
1. Your MCP server is running and accessible (e.g., `http://localhost:8080/mcp`)
2. You know the authentication token if your server requires one

**For STDIO servers:**
1. You have the full path to the compiled server executable (e.g., `C:\MyServers\MCPServerStdio.exe`)

## Claude Desktop

**Configuration file location:** `%APPDATA%\Claude\claude_desktop_config.json`

### STDIO transport

Claude Desktop launches the server as a child process — no network setup, no authentication:

```json
{
  "mcpServers": {
    "delphi-mcp-server": {
      "command": "C:\\MyServers\\MCPServerStdio.exe"
    }
  }
}
```

You can pass command-line arguments and environment variables:

```json
{
  "mcpServers": {
    "delphi-mcp-server": {
      "command": "C:\\MyServers\\MCPServerStdio.exe",
      "args": ["--verbose"],
      "env": {
        "DB_CONNECTION": "Server=localhost;Database=mydb"
      }
    }
  }
}
```

### HTTP transport

Claude Desktop requires the `mcp-remote` bridge to connect to HTTP-based MCP servers.

First, verify the connection:

```bash
npx mcp-remote http://localhost:8080/mcp --header "Authorization: Bearer my-secret-token"
```

Then configure:

```json
{
  "mcpServers": {
    "delphi-mcp-server": {
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
| `command` | Path to `npx` (e.g., `C:\\Program Files\\nodejs\\npx`) |
| `-y` | Auto-confirm package installation |
| `mcp-remote` | Bridge tool for HTTP transport |

After saving the configuration, restart Claude Desktop.

## Claude Code

Claude Code supports both transports natively.

### STDIO transport

```bash
claude mcp add delphi-mcp-server -e command -- C:\MyServers\MCPServerStdio.exe
```

### HTTP transport

```bash
claude mcp add delphi-mcp-server http://localhost:8080/mcp
```

To pass an authentication header:

```bash
claude mcp add delphi-mcp-server http://localhost:8080/mcp --header "Authorization: Bearer my-secret-token"
```

### Common options

Add `--scope project` to write the configuration to the project-level `.claude/settings.json` instead of the user-level `~/.claude/settings.json`:

```bash
claude mcp add --scope project delphi-mcp-server http://localhost:8080/mcp
```

To verify the connection:

```bash
claude mcp list
```

## OpenAI Codex CLI

### STDIO transport

Add the server to `~/.codex/config.json` (or `.codex/config.json` in the project root):

```json
{
  "mcpServers": {
    "delphi-mcp-server": {
      "command": "C:\\MyServers\\MCPServerStdio.exe"
    }
  }
}
```

### HTTP transport

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

Or via command-line flag:

```bash
codex --mcp-servers "http://localhost:8080/mcp"
```

## LM Studio

LM Studio supports HTTP-based MCP servers.

**Configuration file location:** `%USERPROFILE%\.lmstudio\mcp.json`

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
