# Server Setup

This guide explains how to create an MCP server with MCPConnect, covering the available transport options, their trade-offs, and the plugin configuration system.

## MCP Transport Types

The MCP specification defines two transport mechanisms:

| Transport | Description |
|-----------|-------------|
| **Standard I/O (stdio)** | Server communicates via standard input/output streams. The MCP client launches the server process and exchanges JSON-RPC messages through stdin/stdout. |
| **Streamable HTTP** | Server exposes an HTTP endpoint. The MCP client connects over the network and communicates via HTTP requests. |

The right choice depends on your deployment scenario:

- Use **stdio** when the MCP client manages the server lifecycle directly (e.g., Claude Desktop, local integrations).
- Use **Streamable HTTP** when the server must be accessible over a network or must serve multiple clients concurrently.

## Stdio Transport

A stdio server is a console application. The MCP client process spawns it, then communicates through its stdin/stdout pipes. This is the simplest transport and requires no network configuration.

**Create a Console Application** (`{$APPTYPE CONSOLE}`) and add `MCPConnect.Transport.Stdio` to the uses clause.

```pascal
uses
  System.SysUtils,
  MCPConnect.JRPC.Server,
  MCPConnect.MCP.Server.Api,
  MCPConnect.Transport.Stdio,
  MCPConnect.Configuration.MCP,
  MCPConnect.Content.Writers.RTL,
  MCPConnect.Content.Writers.VCL,
  MyApp.Tools;   // Unit with your MCP tool classes

procedure StartServer;
var
  LJRPCServer: TJRPCServer;
  LStdioServer: TJRPCStdioServer;
begin
  LJRPCServer := TJRPCServer.Create(nil);
  try
    LJRPCServer
      .Plugin.Configure<IMCPConfig>
        .Server
          .SetName('my-mcp-server')
          .SetVersion('1.0.0')
          .SetCapabilities([Tools])
          .RegisterWriter(TMCPStreamWriter)
        .BackToMCP
        .Tools
          .RegisterClass(TMyTool)
        .BackToMCP;

    LStdioServer := TJRPCStdioServer.Create(nil);
    try
      LStdioServer.Server := LJRPCServer;
      LStdioServer.StartServerAndWait;
    finally
      LStdioServer.Free;
    end;
  finally
    LJRPCServer.Free;
  end;
end;

begin
  try
    StartServer;
  except
    on E: Exception do
      Writeln(ErrOutput, E.ClassName, ': ', E.Message);
  end;
end.
```

`StartServerAndWait` blocks until the client closes the connection, making it the typical entry point for stdio servers.

As an alternative, you can manage the loop manually using `StartServer` and `ProcessRequests`. This is useful when you need to interleave MCP request processing with other work (logging, watchdog pings, periodic tasks, etc.):

```pascal
LStdioServer.StartServer;
while not LStdioServer.Terminated do
begin
  LStdioServer.ProcessRequests;
  Sleep(1000);
  Writeln('ping');
end;
```

`ProcessRequests` handles any pending incoming messages and returns immediately, while `Terminated` becomes `True` when the client closes the connection.

**Pros:**
- Zero network configuration — no ports, firewalls, or TLS to manage.
- Simple lifecycle — the client controls when the server starts and stops.
- Ideal for local tools and desktop integrations.

**Cons:**
- Single-client only — each client spawns its own process.
- Not suitable for network-accessible or multi-tenant deployments.

## Streamable HTTP Transport

MCPConnect provides two HTTP transport implementations: **WebBroker** and **Indy**. Both expose the same MCP protocol over HTTP, but differ in architecture and flexibility.

### WebBroker

WebBroker is Delphi's built-in framework for web server applications. MCPConnect integrates with it through `TJRPCDispatcher`, a component that plugs into the WebBroker request pipeline.

**Create a Web Server Application** via **File → New → Other → Web → Web Server Application**. The deployment target (standalone, ISAPI, Apache module, CGI, FastCGI) is selected at project creation time and can be changed later without touching your MCP code.

Add the configuration in your `TWebModule.OnCreate` event:

```pascal
uses
  Web.HTTPApp,
  MCPConnect.JRPC.Server,
  MCPConnect.MCP.Server.Api,
  MCPConnect.Transport.WebBroker,
  MCPConnect.Configuration.MCP,
  MCPConnect.Content.Writers.RTL,
  MCPConnect.Content.Writers.VCL,
  MyApp.Tools,
  MyApp.Resources;

procedure TWebModule1.WebModuleCreate(Sender: TObject);
begin
  FJRPCServer := TJRPCServer.Create(Self);

  FJRPCServer
    .Plugin.Configure<IMCPConfig>
      .Server
        .SetName('my-mcp-server')
        .SetVersion('1.0.0')
        .SetCapabilities([Tools, Resources])
        .RegisterWriter(TMCPImageWriter)
        .RegisterWriter(TMCPStreamWriter)
      .BackToMCP
      .Resources
        .SetBasePath(GetCurrentDir + '\data')
        .RegisterClass(TWeatherResource)
        .RegisterFile('docs\readme.md', 'Documentation')
      .BackToMCP
      .Tools
        .RegisterClass(TMyTool)
      .BackToMCP;

  FJRPCDispatcher := TJRPCDispatcher.Create(Self);
  FJRPCDispatcher.PathInfo := '/mcp';
  FJRPCDispatcher.Server := FJRPCServer;
end;
```

#### Automatic Integration with WebBroker

`TJRPCDispatcher` integrates with WebBroker through Delphi's standard component ownership. When created with the `TWebModule` as owner, it registers itself automatically — no additional wiring is needed:

```pascal
// Self = TWebModule; this single line registers the dispatcher with WebBroker
FJRPCDispatcher := TJRPCDispatcher.Create(Self);
```

For each incoming request, WebBroker iterates its registered dispatchers and routes the request to the one whose `PathInfo` matches. Your MCP endpoint will be available at `/mcp` (or any path you choose).

**Pros:**
- Deploy as standalone, ISAPI, Apache module, CGI, or FastCGI without changing MCP code.
- Integrates naturally into existing WebBroker applications alongside other web actions.
- Lifecycle managed by the web server host.

**Cons:**
- HTTP behavior (timeouts, headers, keep-alive) is controlled by the WebBroker host, not by your code.
- Less direct access to raw HTTP connection details.

### Indy

The Indy transport embeds a `TIdHTTPServer`-based HTTP server directly in your application via `TJRPCIndyServer`. This gives you fine-grained control over every aspect of the HTTP server.

**Create a VCL Application** and add `MCPConnect.Transport.Indy` to the uses clause. The server is typically created and configured in the main form:

```pascal
uses
  MCPConnect.JRPC.Server,
  MCPConnect.MCP.Server.Api,
  MCPConnect.Transport.Indy,
  MCPConnect.Configuration.MCP,
  MCPConnect.Content.Writers.RTL,
  MCPConnect.Content.Writers.VCL,
  MyApp.Tools;

procedure TForm1.FormCreate(Sender: TObject);
begin
  FJRPCServer := TJRPCServer.Create(Self);

  FJRPCServer
    .Plugin.Configure<IMCPConfig>
      .Server
        .SetName('my-mcp-server')
        .SetVersion('1.0.0')
        .SetCapabilities([Tools])
        .RegisterWriter(TMCPStreamWriter)
      .BackToMCP
      .Tools
        .RegisterClass(TMyTool)
      .BackToMCP;

  FIndyServer := TJRPCIndyServer.Create(Self);
  FIndyServer.Server := FJRPCServer;
end;

procedure TForm1.StartServer;
begin
  if not FIndyServer.Active then
  begin
    FIndyServer.DefaultPort := StrToInt(EditPort.Text);
    FIndyServer.Active := True;
  end;
end;
```

`TJRPCIndyServer` exposes all standard `TIdHTTPServer` properties and events, so you can configure SSL/TLS, bind to specific interfaces, tune thread pool sizes, handle authentication events, and more.

**Pros:**
- Full control over HTTP server behavior: SSL, threading, binding, custom events.
- Suitable for self-hosted services that need custom network-level configuration.
- No dependency on WebBroker or a web server host.

**Cons:**
- Requires more configuration for production deployments (TLS, load balancing, etc.).
- Does not plug into existing WebBroker applications.

## Plugin System and Fluent Interface

`TJRPCServer` is configured through a **plugin system** based on a fluent interface. Each feature area — MCP configuration, sessions, authentication, JSON serialization — is encapsulated in a separate plugin, registered via `.Plugin.Configure<IPluginInterface>`.

The general pattern is:

```pascal
FJRPCServer
  .Plugin.Configure<IPluginA>
    .SetOption1(...)
    .SetOption2(...)
  .ApplyConfig

  .Plugin.Configure<IPluginB>
    ...
  .ApplyConfig;
```

Each `.Plugin.Configure<T>` call returns the interface `T`, exposing the configuration methods for that plugin. When finished, `.ApplyConfig` returns to the `TJRPCServer` so the next plugin can be chained.

> This chapter covers only the `IMCPConfig` plugin. Later chapters will address the session management plugin (`ISessionConfig`), the authentication plugin (`IAuthTokenConfig`), and the JSON serialization plugin (`IJRPCNeonConfig`).

## The IMCPConfig Plugin

`IMCPConfig` is the core configuration plugin. It declares the server's identity, its MCP capabilities, and registers the tool and resource classes that implement the MCP API.

Access it with:

```pascal
uses
  MCPConnect.Configuration.MCP;
```

The plugin is divided into three sub-sections, each accessed by name and terminated with `.BackToMCP`:

```pascal
FJRPCServer
  .Plugin.Configure<IMCPConfig>

    .Server
      // Server identity and capabilities
    .BackToMCP

    .Resources
      // Resource registration
    .BackToMCP

    .Tools
      // Tool registration
    .BackToMCP;
```

### Server Section

The `.Server` section declares the server's identity and which MCP capabilities it exposes.

| Method | Description |
|--------|-------------|
| `SetName(name)` | Server name reported during MCP initialization |
| `SetVersion(version)` | Server version string |
| `SetCapabilities([...])` | Declares which MCP capabilities are active: `Tools`, `Resources`, `Prompts` |
| `RegisterWriter(class)` | Registers a content writer for converting Delphi types to MCP content |

```pascal
.Server
  .SetName('delphi-mcp-server')
  .SetVersion('2.0.0')
  .SetCapabilities([Tools, Resources])
  .RegisterWriter(TMCPImageWriter)
  .RegisterWriter(TMCPPictureWriter)
  .RegisterWriter(TMCPStreamWriter)
  .RegisterWriter(TMCPStringListWriter)
.BackToMCP
```

`SetCapabilities` controls which capability blocks appear in the MCP `initialize` response. Only declare capabilities you actually use.

Content writers (see the Content Writers chapter) teach MCPConnect how to serialize specific Delphi types — `TStream`, `TPicture`, `TStringList`, etc. — as MCP content items.

### Tools Section

The `.Tools` section registers the Delphi classes that contain methods decorated with `[McpTool]`.

| Method | Description |
|--------|-------------|
| `RegisterClass(class)` | Registers a class whose `[McpTool]` methods are exposed as MCP tools |

```pascal
.Tools
  .RegisterClass(THelpDeskService)
  .RegisterClass(TTestTool)
.BackToMCP
```

MCPConnect inspects each registered class via RTTI and automatically generates the MCP tool schema from method signatures and `[McpParam]` attributes. See the Tools chapter for details on annotating tool methods.

### Resources Section

The `.Resources` section registers classes with `[McpResource]` methods and static files.

| Method | Description |
|--------|-------------|
| `SetBasePath(path)` | Base directory for resolving relative file paths |
| `RegisterClass(class)` | Registers a class whose `[McpResource]` methods are exposed as MCP resources |
| `RegisterFile(path, name)` | Exposes a static file as an MCP resource |

```pascal
.Resources
  .SetBasePath(GetCurrentDir + '\data')
  .RegisterClass(TWeatherResource)
  .RegisterClass(TDeplphiDayApp)
  .RegisterFile('index.md', 'Index')
  .RegisterFile('documentation\mcp\mcpconnect.pdf', 'MCPConnect Introduction')
.BackToMCP
```

`SetBasePath` is used as the root for `RegisterFile` relative paths. See the Resources chapter for details on implementing resource classes.
