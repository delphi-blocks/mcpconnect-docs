# API Key

MCPConnect supports two authentication mechanisms for HTTP transports (WebBroker and Indy):

- **API Key** — a key checked on every request, either a single shared secret or keys you validate yourself (`IAuthTokenConfig`), described in this chapter
- **OAuth 2.1** — bearer-token authentication delegated to an external authorization server (`IOAuthConfig`), see the [OAuth 2.1](./oauth) chapter

API keys are the right choice when callers can be handed a key: one user, a trusted team, a handful of customers, or another program calling your server. If users should log in with their own account, or you want to use an identity provider you already have, use OAuth 2.1.

::: info
Authentication is not applicable to the STDIO transport: it has no headers to carry a key, and a server spawned by its client already runs with that client's authority, so the check is skipped.
:::

## The IAuthTokenConfig Plugin

Add `MCPConnect.Configuration.Auth` to the uses clause:

```pascal
uses
  MCPConnect.Configuration.Auth;
```

Then configure the plugin on your `TJRPCServer` instance:

```pascal
FJRPCServer
  .Plugin.Configure<IAuthTokenConfig>
    .SetToken('my-secret-token')
  .ApplyConfig;
```

Once a token is set, the server checks every incoming request and rejects those that do not carry the expected value with `401 Unauthorized` and a `WWW-Authenticate` header. The token is compared case-sensitively and in constant time, so the response time does not reveal how much of a guessed key was right. Failed attempts are logged, never with the key itself.

## IAuthTokenConfig API Reference

| Method | Description |
|--------|-------------|
| `SetToken(token)` | The token string the server will compare against (case-sensitive, constant time). Ignored when a validator is registered |
| `SetTokenLocation(location)` | Where to extract the token: `Bearer` (default), `Header`, `Cookie` |
| `SetTokenCustomHeader(name)` | Header or cookie name; required for `Header` and `Cookie` modes, ignored for `Bearer` |
| `SetTokenValidator(func)` | Validates keys with an anonymous method that can also fill in the caller's identity. Replaces any validator class |
| `SetTokenValidatorClass(class)` | Validates keys with a class implementing `IAuthTokenValidator`, created per request. Replaces any validator function |

The following sections describe each option in detail.

## Token Location Modes

The `TAuthTokenLocation` enum controls where the server looks for the token in the HTTP request. Three modes are available.

### Bearer (default)

The token is extracted from the standard `Authorization` HTTP header using the Bearer scheme. This is the default when `SetTokenLocation` is not called.

The client must include the following header in every request:

```
Authorization: Bearer my-secret-token
```

### Custom Header

The token is read from an arbitrary HTTP header whose name you specify with `SetTokenCustomHeader`.

```pascal
FJRPCServer
  .Plugin.Configure<IAuthTokenConfig>
    .SetToken('my-api-key')
    .SetTokenLocation(TAuthTokenLocation.Header)
    .SetTokenCustomHeader('X-API-Key')
  .ApplyConfig;
```

The client must send:

```
X-API-Key: my-api-key
```

### Cookie

The token is read from an HTTP cookie. Specify the cookie name with `SetTokenCustomHeader`.

```pascal
FJRPCServer
  .Plugin.Configure<IAuthTokenConfig>
    .SetToken('my-session-value')
    .SetTokenLocation(TAuthTokenLocation.Cookie)
    .SetTokenCustomHeader('SessionId')
  .ApplyConfig;
```

The client must send:

```
Cookie: SessionId=my-session-value
```

With the `Header` and `Cookie` locations a name is required: if `SetTokenCustomHeader` is missing, `ApplyConfig` raises an exception at startup instead of letting every request fail silently.

## Validating Keys Yourself

A single key hard-coded in the configuration is fine for a quick setup, but real deployments usually need more: one key per customer, keys stored in a database, keys that can be revoked or expire. For that, write your own validator with `SetTokenValidator`:

```pascal
FJRPCServer
  .Plugin.Configure<IAuthTokenConfig>
    .SetTokenLocation(TAuthTokenLocation.Header)
    .SetTokenCustomHeader('X-API-Key')
    .SetTokenValidator(
      function (AContext: TJRPCContext; const AToken: string;
        AIdentity: TMCPAccessToken): Boolean
      var
        LCustomer: TCustomer;
      begin
        Result := MyKeyStore.TryFindCustomer(AToken, LCustomer);
        if not Result then
          Exit;

        AIdentity.Subject := LCustomer.Id;
        AIdentity.Name := LCustomer.Name;
        AIdentity.Scope := 'tasks:read tasks:write';
      end)
  .ApplyConfig;
```

The validator receives the request context, the key sent by the client (never empty) and the caller's identity to fill in. The rules:

- Return `True` to accept the key.
- When a validator is registered, the token set with `SetToken` is ignored.
- It is called concurrently from every request thread, so whatever it uses must be thread-safe.
- An exception raised inside it is logged and treated as a rejected key: the client gets a `401`, never a `500`, and never the error message.

If you cannot pass an anonymous method — for example from C++Builder — register a class implementing `IAuthTokenValidator` with `SetTokenValidatorClass` instead. One instance is created per request, so the class needs a parameterless constructor and must be reference counted (descending from `TInterfacedObject` is the usual way).

```pascal
type
  TMyKeyValidator = class(TInterfacedObject, IAuthTokenValidator)
  public
    function Validate(AContext: TJRPCContext; const AToken: string;
      AIdentity: TMCPAccessToken): Boolean;
  end;

FJRPCServer
  .Plugin.Configure<IAuthTokenConfig>
    .SetTokenValidatorClass(TMyKeyValidator)
  .ApplyConfig;
```

## Knowing Who Is Calling

The `AIdentity` parameter is the same `TMCPAccessToken` object that OAuth fills with the claims of a JWT (see [Reading the Token in a Tool](./oauth#reading-the-token-in-a-tool)). It is created empty for every request and injected into the request context, so whatever the validator writes into it — through the `Subject`, `Name`, `EMail`, `Scope`, `ClientId` setters, or any custom claim added to `Payload` — is what your tools read through `[Context]`:

```pascal
TTaskTools = class
private
  [Context]
  FIdentity: TMCPAccessToken;
public
  [McpTool('whoami', 'Returns the calling customer')]
  function WhoAmI: string;
end;

function TTaskTools.WhoAmI: string;
begin
  Result := FIdentity.Name + ' (' + FIdentity.Subject + ')';
end;
```

A tool written this way works unchanged whichever authentication the server uses.

This makes API keys more than a gate. A plain shared secret answers "is this caller allowed in?"; a validator also answers "who is this caller?", and the scopes you assign to the key decide what the caller may do — see the [Authorization](./authorization) chapter to restrict tools, resources and prompts by scope. What API keys cannot give you is a login: a per-user key identifies the user, but it is still not a login. When you need one, use [OAuth 2.1](./oauth).
