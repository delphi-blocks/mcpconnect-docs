# Authorization

Authentication tells you who the caller is; authorization decides what that caller can see and use. Checking the scopes by hand inside every tool works, but it is easy to forget one, and the tool still shows up in the list the client hands to the model. MCPConnect lets you declare the requirement once, next to the code it protects.

The scopes come from the token the request was authenticated with:

- with [OAuth 2.1](./oauth), the `scope` claim of the JWT;
- with [API keys](./api-key), whatever your validator wrote into `AIdentity.Scope`.

The same declarations work with both.

## Declaring the Required Scopes

The `McpRequiredScope` attribute lists the scopes the caller's token must **all** carry, separated by commas or semicolons. It works on tools, resources, resource templates, App UIs and prompts:

```pascal
uses
  MCPConnect.MCP.Attributes;

type
  [McpRequiredScope('orders:read')]
  TOrderTools = class
  public
    [McpTool('list_orders', 'Lists the orders')]
    function ListOrders: TArray<TOrder>;

    [McpTool('delete_order', 'Deletes an order')]
    [McpRequiredScope('orders:write, orders:admin')]
    function DeleteOrder([McpParam('id', 'Order id')] const AId: string): Boolean;
  end;
```

On a class the attribute applies to everything the class registers; on a method it adds to the class requirements. Here `list_orders` needs `orders:read`, while `delete_order` needs `orders:read`, `orders:write` and `orders:admin`. Items without the attribute stay open to every caller.

Scopes are matched as whole, case-sensitive words: `orders` does not satisfy `orders:read`.

## What the Client Sees

The check runs on every MCP method that exposes an item:

| Method | Behavior for an unauthorized item |
|--------|-----------------------------------|
| `tools/list`, `resources/list`, `resources/templates/list`, `prompts/list` | The item is left out of the list |
| `tools/call`, `resources/read`, `prompts/get` | The call fails with the same error as a missing item (e.g. `Tool [delete_order] not found`) |

Two choices are worth noting:

- **A denied item looks like a missing one.** A client that is not allowed to call `delete_order` gets exactly the error it would get if the tool did not exist, so the server does not reveal what it hides. The real reason — the scopes required and the scopes the token carried — goes to the server log, where you need it when a caller reports that a tool "disappeared".
- **The check is fail-closed.** A caller without a token, such as a STDIO client or any client of a server with no authentication configured, cannot see or use any item that requires a scope.

## Checking Scopes Inside a Tool

When a tool needs a finer decision than "callable or not" — for example returning more fields to an administrator — read the caller's identity through `[Context]` and test the scopes with `HasScope`:

```pascal
TOrderTools = class
private
  [Context]
  FIdentity: TMCPAccessToken;
public
  [McpTool('get_order', 'Returns an order')]
  function GetOrder([McpParam('id', 'Order id')] const AId: string): TOrder;
end;

function TOrderTools.GetOrder(const AId: string): TOrder;
begin
  Result := Repository.Load(AId);
  if not FIdentity.HasScope('orders:admin') then
    Result.ClearInternalNotes;
end;
```

Use `HasScope` (or `HasScopes` for a list) rather than searching the `Scope` string: it matches whole, case-sensitive scopes only.

## Custom Rules

Scopes are the recommended way, but not the only one. With `SetAuthorizer` you replace the default check with your own rule. It is called for every item of a list and for the item a call asks for, and returns `True` to allow access. It receives:

- the request context;
- a `TMCPAuthItem` describing the item: its `Kind` (`Tool`, `Resource`, `Template`, `UI`, `Prompt`), `Name`, `Uri`, `RequiredScopes` and `Tags`;
- the caller's identity, which is never `nil` (without authentication it simply carries no claims).

A custom rule replaces the default one, so to keep the scope check and add to it, call `TMCPScopeAuthorizer.Check` first. Tags make it easy to mark items for your own rules without new attributes:

```pascal
uses
  MCPConnect.MCP.Authorization;

FJRPCServer.Plugin.Configure<IMCPConfig>
  .Security
    .SetAuthorizer(
      function (AContext: TJRPCContext; const AItem: TMCPAuthItem;
        AIdentity: TMCPAccessToken): Boolean
      begin
        Result := TMCPScopeAuthorizer.Check(AItem, AIdentity);
        // Tools tagged "admin", e.g. [McpTool('purge', 'Purges the archive', 'admin')]
        if Result and AItem.Tags.Exists('admin') then
          Result := AdminRepository.IsAdmin(AIdentity.Subject);
      end)
  .BackToMCP
  .ApplyConfig;
```

The usual rules apply: the function is called concurrently from every request thread and must be thread-safe, and an exception raised inside it is logged and counts as a denial.

From C++Builder, register a class implementing `IMCPAuthorizer` with `SetAuthorizerClass`. One instance is created per request, not per item, so the class needs a parameterless constructor and must be reference counted (descending from `TInterfacedObject` is the usual way). Passing `nil` to either method restores the default scope authorizer.

## Security API Reference

| Method | Description |
|--------|-------------|
| `SetAuthorizer(func)` | Replaces the default authorizer with an anonymous method. Replaces any authorizer class |
| `SetAuthorizerClass(class)` | Replaces the default authorizer with a class implementing `IMCPAuthorizer`, created per request. Replaces any authorizer function |

## Registering Without Attributes

Classes registered programmatically — for example from C++Builder, which cannot carry Delphi attributes — get the same protection with `RequireScope`, on the tool builder or, after registration, on the section that holds the item:

```pascal
FJRPCServer.Plugin.Configure<IMCPConfig>
  .Tools
    .RegisterTool(TOrderService, 'DeleteOrder', 'delete_order', 'Deletes an order')
      .WithParam('AId', 'id', 'Order id')
      .RequireScope('orders:write')
    .EndTool
    .RequireScope('list_orders', 'orders:read')
  .BackToMCP
  .Resources
    .RequireScope('res://orders/{id}', 'orders:read')
  .BackToMCP
  .Prompts
    .RequireScope('order_summary', 'orders:read')
  .BackToMCP
  .ApplyConfig;
```

| Method | Description |
|--------|-------------|
| `TMCPToolConfig.RequireScope(scopes)` | Adds required scopes to the tool being built |
| `Tools.RequireScope(name, scopes)` | Adds required scopes to a registered tool |
| `Resources.RequireScope(uri, scopes)` | Adds required scopes to a registered resource, template or App UI |
| `Prompts.RequireScope(name, scopes)` | Adds required scopes to a registered prompt |

`RequireScope` always adds to the scopes already declared, and attributes found on a class are honored even when it is registered programmatically, so registering a class by hand never drops its restrictions.
