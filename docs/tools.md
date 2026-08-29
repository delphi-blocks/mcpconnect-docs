# Tools

Tools are the primary way to expose executable actions to an LLM. A tool is a Delphi method decorated with the `[McpTool]` attribute.

## Defining a Tool Class

Use `[McpTool]` on the methods you want to expose:

```pascal
type
  THelpDeskService = class
  public
    [McpTool('doclist', 'List all the available documents')]
    function ListDocument(
      [McpParam('category', 'Document Category')] const ACategory: string
    ): TContentList;

    // This method is NOT exposed — it lacks the [McpTool] attribute
    procedure InternalStuff;
  end;
```

Methods without `[McpTool]` are completely invisible to the MCP protocol, so you can freely mix internal and public logic in the same class.

## Registering Tools

Tool classes are registered in the `.Tools` section of `IMCPConfig`:

```pascal
.Tools
  .RegisterClass(TAuthService)
  .RegisterClass(TTicketService)
.BackToMCP
```

`RegisterClass` scans the class via RTTI and registers every method carrying `[McpTool]`.

### Registering Without Attributes

For classes that cannot carry Delphi custom attributes (e.g. compiled from C++ Builder), use the fluent `RegisterTool` API:

```pascal
.Tools
  .RegisterTool(TMathTool, 'DoubleOrZero', 'double_or_zero',
    'Doubles or zeroes the value', 'icon=money.png')
    .WithParam('AValue', 'value', 'The value to process')
    .WithParam('ADouble', 'double', 'Whether to double it')
    .EndTool
.BackToMCP
```

- **`RegisterTool(AClass, AMethodName, AName, ADescription, ATags)`** — looks up `AMethodName` on `AClass` via RTTI and returns a builder. `AName`/`ADescription`/`ATags` work exactly like the corresponding `[McpTool]` arguments.
- **`WithParam(AParamName, AName, ADescription, ATags)`** — maps a Delphi parameter to its JSON-facing name. Every parameter must be covered, or `EndTool` raises an exception.
- **`EndTool`** — finalizes the tool and returns to the `.Tools` builder.

Both registration paths can be freely mixed in the same `.Tools` section.

## Scopes

The `[McpScope]` attribute adds a namespace prefix to every tool name in a class, avoiding name conflicts when multiple classes expose tools with the same name:

```pascal
[McpScope('auth')]
TAuthService = class
public
  [McpTool('login', 'Authenticate user')]
  function Login([McpParam('username')] AUser: string): Boolean;

  [McpTool('logout', 'Logout user')]
  function Logout: Boolean;
end;
```

Exposed tool names will be `auth_login` and `auth_logout`. The separator is `_` by default and can be changed via the `SetScopeSeparator` option in the [Server configuration](plugins.md#server-section).

> **Note:** MCPConnect does not enforce any restriction on tool names. However, the MCP specification recommends that tool names be 1–64 characters long, case-sensitive, and limited to alphanumeric characters, underscores (`_`), dashes (`-`), dots (`.`), and forward slashes (`/`).

## Tool Annotations

`[McpTool]` accepts an optional third string parameter for key-value annotations:

```pascal
[McpTool('my_tool', 'Description', 'app=ui://my-app/index.html,category=demo')]
function MyTool: string;
```

Supported built-in annotations:

| Key | Example | Meaning |
|-----|---------|---------|
| `app` | `app=ui://my-app/index.html` | Links tool to an MCP App UI |
| `disabled` | `disabled` | Hides the tool from the tools list |
| `icon` | `icon=money.png` | Tool icon — a filename resolved against `.Server.SetIconFolder(...)`, or a full `scheme://` URL |
| `category` | `category=finance` | Free-form grouping label for the tool |
| `readonly` | `readonly` | Sets the `readOnlyHint` annotation |
| `destructive` | `destructive` | Sets the `destructiveHint` annotation |
| `idempotent` | `idempotent` | Sets the `idempotentHint` annotation |
| `openworld` | `openworld` | Sets the `openWorldHint` annotation |
| `structured` | `structured` | Also generates `outputSchema`/`structuredContent` from the method's return type, which must be a JSON object (a record or class, not an array/scalar) |

Combine multiple tags with commas, e.g. `'app=ui://my-app/index.html,category=demo,readonly'`.

## Linking a Tool to an MCP App

A tool can declare that its result should be rendered by an MCP App in two equivalent ways:

**Option A** — separate `[McpApp]` attribute on the tool method:

```pascal
[McpTool('get_tickets', 'List available tickets', 'icon=badge.png')]
[McpApp('ui://my-app/index.html')]
function GetTickets: TTickets;
```

**Option B** — `app=` annotation in the third parameter of `[McpTool]`:

```pascal
[McpTool('get_tickets', 'List available tickets', 'app=ui://my-app/index.html')]
function GetTickets: TTickets;
```

Both tell the client that the tool result can be rendered inside the specified app UI.
