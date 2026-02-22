# Server Setup

This guide walks through creating and configuring a new MCP server application using MCPConnect with WebBroker.

## Step 1: Create a WebBroker Application

In Delphi, create a new **WebBroker Application** project via **File → New → Other → Web → Web Server Application**.

Choose your preferred web server type (standalone, ISAPI, Apache, etc.). For development, a standalone application is recommended.

> **Note:** While you can use Indy components directly, WebBroker provides a simpler and more straightforward approach for HTTP-based MCP servers.

## Step 2: Configure the Server Components

In your WebModule's `OnCreate` event or constructor, create and configure `TJRPCServer` and `TJRPCDispatcher`:

```delphi
uses
  MCPConnect.JRPC.Server,
  MCPConnect.MCP.Server.Api,       // Registers the standard MCP API
  MCPConnect.Transport.WebBroker,
  MCPConnect.Configuration.MCP,
  MCPConnect.Content.Writers.RTL,
  MCPConnect.Content.Writers.VCL,
  Demo.HelpDeskService;            // Unit with your MCP classes

// Create the JSON-RPC Server
FJRPCServer := TJRPCServer.Create(Self);

FJRPCServer
  .Plugin.Configure<IMCPConfig>

    .Server
      .SetName('delphi-mcp-server')
      .SetVersion('2.0.0')
      .SetCapabilities([Tools, Resources])  // Declare which capabilities to expose
      .RegisterWriter(TMCPImageWriter)       // Register content writers for complex types
      .RegisterWriter(TMCPStreamWriter)
    .BackToMCP

    .Resources
      .SetBasePath(GetCurrentDir + '\data')
      .RegisterClass(TWeatherResource)       // Classes with [McpResource] methods
      .RegisterClass(TMyApp)                 // Classes with [McpApp] methods
      .RegisterFile('docs\readme.md', 'Documentation')
    .BackToMCP

    .Tools
      .RegisterClass(THelpDeskService)       // Classes with [McpTool] methods
    .BackToMCP;

// Create and configure the Dispatcher
FJRPCDispatcher := TJRPCDispatcher.Create(Self);
FJRPCDispatcher.PathInfo := '/mcp';
FJRPCDispatcher.Server := FJRPCServer;
```

The configuration is split into three sections:

| Section | Purpose |
|---------|---------|
| `.Server` | Server identity, declared capabilities, and content writers |
| `.Resources` | Resource classes and static files |
| `.Tools` | Tool classes |

Each section ends with `.BackToMCP` to return to the root config builder.

## Step 3: Automatic Integration

The `TJRPCDispatcher` integrates seamlessly with WebBroker through Delphi's standard component ownership mechanism:

1. **Automatic Registration** — When created with `TWebModule` as owner, the dispatcher registers itself with the WebBroker framework automatically.
2. **Request Routing** — For each incoming HTTP request, WebBroker checks all registered dispatchers based on the `PathInfo` property.
3. **No Manual Wiring Needed** — The `Self` parameter in the constructor does all the wiring.

```delphi
// This single line does all the wiring:
FJRPCDispatcher := TJRPCDispatcher.Create(Self); // Self = TWebModule
```

Your MCP server is now ready to accept JSON-RPC requests. For example, if running on port 8080, requests to `http://localhost:8080/mcp` will be routed to your registered MCP tools.
