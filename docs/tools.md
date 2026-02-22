# Tools

Tools are the primary way to expose executable actions to an LLM. A tool is a Delphi method decorated with the `[McpTool]` attribute.

## Defining a Tool Class

Register the class and use `[McpTool]` on the methods you want to expose:

```delphi
unit Demo.HelpDeskService;

interface

uses
  System.SysUtils,
  MCPConnect.MCP.Attributes;

type
  THelpDeskService = class
  public
    // This method is published as an MCP tool
    [McpTool('doclist', 'List all the available documents')]
    function ListDocument(
      [McpParam('category', 'Document Category')] const ACategory: string
    ): TContentList;

    // This method is NOT exposed — it lacks the [McpTool] attribute
    procedure InternalStuff;
  end;
```

Methods without `[McpTool]` are completely invisible to the MCP protocol, so you can freely mix internal and public logic in the same class.

## Organizing Tools with Scopes

When building larger MCP servers with multiple tool classes, assign a **scope** (namespace prefix) using the `[McpScope]` attribute. This avoids name conflicts and produces a cleaner API.

### Why Use Scopes?

- **Avoid conflicts** — Multiple tool classes can have methods with the same name.
- **Clear organization** — Group related tools logically.
- **Better API structure** — Tools are exposed as `scope_toolname` (e.g., `auth_login`).

### Defining a Scoped Tool Class

```delphi
[McpScope('auth')]
TAuthService = class
public
  [McpTool('login', 'Authenticate user')]
  function Login([McpParam('username')] AUser: string): Boolean;

  [McpTool('logout', 'Logout user')]
  function Logout: Boolean;
end;
```

Exposed tool names will be `auth_login` and `auth_logout`.

### Multiple Scoped Classes

```delphi
[McpScope('auth')]    TAuthService   = class ... end;
[McpScope('tickets')] TTicketService = class ... end;
[McpScope('users')]   TUserService   = class ... end;

// Registration
FJRPCServer
  .Plugin.Configure<IMCPConfig>
    .Tools
      .RegisterClass(TAuthService)    // auth_login, auth_logout
      .RegisterClass(TTicketService)  // tickets_list, tickets_create
      .RegisterClass(TUserService)    // users_get, users_update
    .BackToMCP;
```

> **Important:** Tool names must match the MCP pattern `^[a-zA-Z0-9_-]{1,64}$` (only alphanumeric, underscore, hyphen).

## Tool Annotations

`[McpTool]` accepts an optional third string parameter for key-value annotations:

```delphi
[McpTool('my_tool', 'Description', 'app=ui://my-app/index.html,category=demo')]
function MyTool: string;
```

Supported built-in annotations:

| Key | Example | Meaning |
|-----|---------|---------|
| `app` | `app=ui://my-app/index.html` | Links tool to an MCP App UI |
| `disabled` | `disabled` | Hides the tool from the tools list |
