# Resources

Resources let you expose data that an LLM can read. MCPConnect supports three kinds:

| Type | Attribute | Description |
|------|-----------|-------------|
| Class-based resources | `[McpResource]` | Methods that return dynamic content |
| MCP Apps | `[McpApp]` | Methods that return a UI (e.g. HTML) rendered by the client |
| Static files | — | Files served directly from disk |

## Class-Based Resources

Decorate a method with `[McpResource]` to expose it as a readable resource:

```pascal
type
  TWeatherResource = class
  public
    [McpResource('weather-resource', 'text://weather', 'text/csv', 'Current weather data')]
    function GetWeatherInfo: string;
  end;
```

The `[McpResource]` attribute takes `(name, uri, mimeType, description)`.

## MCP Apps

MCP Apps are UI resources served via a `ui://` URI scheme. The client (if it supports it) renders the returned content as an interactive widget.

```pascal
type
  TMyApp = class
  public
    [McpApp('ui://my-app/index.html', 'ui://my-app/index.html', 'An interactive UI panel')]
    function GetUI: string;
  end;

function TMyApp.GetUI: string;
begin
  Result := TFile.ReadAllText(TPath.Combine(TPath.GetAppPath, 'data', 'my-app.html'));
end;
```

The `[McpApp]` attribute takes `(name, uri, description)`.

### Linking a Tool to an App

A tool can declare an associated MCP App using the `app=` annotation in `[McpTool]`:

```pascal
[McpTool('get_tickets', 'List available tickets', 'app=ui://my-app/index.html')]
function GetTickets: TTickets;
```

This tells the client that the tool result can be rendered inside the specified app UI.

## Registering Resources and Static Files

All resource types are registered in the `.Resources` section:

```pascal
.Resources
  .SetBasePath(GetCurrentDir + '\data')
  .RegisterClass(TWeatherResource)             // [McpResource] class
  .RegisterClass(TMyApp)                       // [McpApp] class
  .RegisterFile('readme.md', 'Documentation') // Static text file
  .RegisterFile('docs\guide.pdf', 'User Guide') // Static binary file
.BackToMCP
```

Remember to declare `Resources` in `.SetCapabilities`:

```pascal
.Server
  .SetCapabilities([Tools, Resources])
.BackToMCP
```
