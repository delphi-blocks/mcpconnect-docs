# Security

## CORS

When your MCP server is accessed from a browser-based client (such as MCPJam Inspector or web-based MCP hosts), you need to enable CORS. CORS is configured in the `.Security` section of `IMCPConfig`:

```pascal
.Security
  .SetCORS(True)
  .SetAllowedMethods(['GET', 'POST'])
  .SetAllowedOrigins(['http://localhost'])
.BackToMCP
```

| Method | Description |
|--------|-------------|
| `SetCORS(True)` | Enables CORS headers on every response, including error responses and well-known endpoints |
| `SetAllowedMethods(methods)` | HTTP methods to allow. Only `POST` is needed for JSON-RPC; add `GET` if you want browser clients to open the SSE stream. `OPTIONS` preflights are always answered. |
| `SetAllowedOrigins(origins)` | Allowlist of accepted origins. Supports exact matches and wildcard subdomains (e.g. `'https://*.example.com'`). |
| `SetCookieSecure(False)` | Disables the `Secure` flag on session cookies — only for plain-HTTP development. Cookies are `HttpOnly + SameSite=Strict + Secure` by default. |

If `SetAllowedOrigins` is not called, any origin is accepted (including requests with no `Origin` header). Once an allowlist is set, requests with a missing or unmatched origin are rejected — which may break tools like curl or Bruno that don't send an `Origin` header. For development, you can omit `SetAllowedOrigins` or guard it with `{$IFNDEF DEBUG}`:

```pascal
.Security
  .SetCORS(True)
  .SetAllowedMethods(['POST'])
  {$IFNDEF DEBUG}
  .SetAllowedOrigins(['https://my-production-origin.com'])
  {$ENDIF}
.BackToMCP
```

## Authentication

MCPConnect supports two authentication mechanisms for HTTP transports (WebBroker and Indy):

- **API-Key authentication** — a single shared token checked on every request (`IAuthTokenConfig`)
- **OAuth 2.1** — bearer-token authentication delegated to an external authorization server (`IOAuthConfig`)

::: info
Authentication is not applicable to the STDIO transport — the MCP client launches the server process directly and communicates through stdin/stdout pipes, so no network authentication is involved.
:::

When authentication is configured, the server checks every incoming request for a valid token before processing it. Requests that do not carry the expected token are rejected with an authentication error.

## The IAuthTokenConfig Plugin

Authentication is configured through the `IAuthTokenConfig` plugin. Add `MCPConnect.Configuration.Auth` to the uses clause:

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

The token is compared case-sensitively against each incoming request. The default extraction method is Bearer token (see below).

## Token Location Modes

The `TAuthTokenLocation` enum controls where the server looks for the token in the HTTP request. Three modes are available:

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

## IAuthTokenConfig API Reference

| Method | Description |
|--------|-------------|
| `SetToken(token)` | The token string the server will compare against (case-sensitive) |
| `SetTokenLocation(location)` | Where to extract the token: `Bearer` (default), `Header`, `Cookie` |
| `SetTokenCustomHeader(name)` | Header or cookie name; required for `Header` and `Cookie` modes, ignored for `Bearer` |

## OAuth 2.1

MCPConnect also supports OAuth 2.1 bearer-token authentication, delegating to an external authorization server (Microsoft Entra ID, Auth0, Keycloak, Okta, or any OpenID Connect provider). See the dedicated [OAuth 2.1](./oauth) chapter for configuration, token validators, and usage.
