# Plugin System

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

The `.Server` section declares the server's identity, namespace settings, and which MCP capabilities it exposes.

| Method | Description |
|--------|-------------|
| `SetName(name)` | Server name reported during MCP initialization (default: `'MCPServer'`) |
| `SetDescription(description)` | Server description returned in the MCP initialize response |
| `SetVersion(version)` | Server version string (default: `'1.0'`) |
| `SetIconFolder(folder)` | Base folder for resolving icon file paths referenced via tags |
| `SetScopeSeparator(separator)` | Separator between scope and tool/prompt name (default: `'_'`). Must be MCP-compliant (`a-zA-Z0-9_-` only) |
| `SetCapabilities([...])` | Declares which MCP capabilities are active: `Tools`, `Resources`, `Prompts`, `Tasks`, `Logging`, `Completions` |
| `SetCapabilities(proc)` | Overload accepting a `TProc<TServerCapabilities>` for fine-grained capability configuration |
| `SetCapabilities(obj)` | Overload accepting a `TServerCapabilities` instance directly (the config takes ownership) |
| `RegisterWriter(class)` | Registers a content writer for converting Delphi types to MCP content |

```pascal
.Server
  .SetName('delphi-mcp-server')
  .SetDescription('A Delphi-powered MCP server')
  .SetVersion('2.0.0')
  .SetIconFolder(GetCurrentDir + '\icons')
  .SetScopeSeparator('_')
  .SetCapabilities([Tools, Resources])
  .RegisterWriter(TMCPImageWriter)
  .RegisterWriter(TMCPPictureWriter)
  .RegisterWriter(TMCPStreamWriter)
  .RegisterWriter(TMCPStringListWriter)
.BackToMCP
```

`SetCapabilities` controls which capability blocks appear in the MCP `initialize` response. Only declare capabilities you actually use. If `SetCapabilities` is never called, MCPConnect infers capabilities from the registered tools, resources, and prompts.

`SetScopeSeparator` controls how scoped names are built. When a class is annotated with `[MCPScope('auth')]` and the separator is `'_'`, a tool named `login` becomes `auth_login`.

`SetIconFolder` sets the base directory used to resolve relative icon paths specified via the `icon` tag on tools, prompts, or resources. If the icon value is already a full URL (contains `://`), it is used as-is.

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
