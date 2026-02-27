# Authentication

MCPConnect supports token-based authentication for HTTP transports (WebBroker and Indy). While authorization for MCP servers is optional, it is strongly recommended in the following scenarios:

* The server accesses user-specific data (emails, documents, databases)
* You need to audit who performed specific actions
* The server exposes APIs that require explicit user consent
* You are building for enterprise environments with strict access controls
* You want to implement per-user rate limiting or usage tracking

For HTTP-based transports, MCPConnect currently supports token-based authentication only. OAuth flows are typically designed for remotely hosted servers accessed over HTTP; however, OAuth is not currently supported by MCPConnect.

::: info **💡 Authorization for Local MCP Servers**
Authentication is not applicable to STDIO transport in the traditional network sense, since no network communication is involved — the MCP client launches the server process directly and communicates through its stdin/stdout pipes. However, local MCP servers using STDIO can still implement authorization by leveraging environment-based credentials or credentials provided by embedded third-party libraries. Because a STDIO-based MCP server runs locally, it can adopt flexible approaches for acquiring and validating user credentials, which may or may not rely on browser-based authentication flows. 
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

## API Reference

| Method | Description |
|--------|-------------|
| `SetToken(token)` | The token string the server will compare against (case-sensitive) |
| `SetTokenLocation(location)` | Where to extract the token: `Bearer` (default), `Header`, `Cookie` |
| `SetTokenCustomHeader(name)` | Header or cookie name; required for `Header` and `Cookie` modes, ignored for `Bearer` |
