# CORS

Browser-based MCP hosts (such as MCPJam Inspector or web-based MCP clients) send requests from a page served on a different origin. The browser enforces the Same-Origin Policy and blocks the responses unless the server opts in with **CORS** (Cross-Origin Resource Sharing) headers, which tell the browser which origins, methods, and headers the server is willing to accept.

::: info
CORS is not an authentication mechanism. You only need it when browser-based clients connect to your server, whichever authentication you use ([API Key](./api-key) or [OAuth 2.1](./oauth)).
:::

CORS is configured in the `.Security` section of `IMCPConfig`:

```pascal
.Security
  .SetCORS(True)
  .SetAllowedMethods(['GET', 'POST'])
  .SetAllowedOrigins(['http://localhost'])
.BackToMCP
```

## Security API Reference

| Method | Description |
|--------|-------------|
| `SetCORS(True)` | Enables CORS headers on every response, including error responses and well-known endpoints |
| `SetAllowedMethods(methods)` | HTTP methods to allow. Only `POST` is needed for JSON-RPC; add `GET` if you want browser clients to open the SSE stream. `OPTIONS` preflights are always answered. |
| `SetAllowedOrigins(origins)` | Allowlist of accepted origins. Supports exact matches and wildcard subdomains (e.g. `'https://*.example.com'`). |
| `SetRequireOrigin(True)` | Rejects requests without an `Origin` header when an allowlist is set. Default: `False` |
| `SetExposeHeaders(headers)` | Headers browser clients may read from the response. By default `WWW-Authenticate` is exposed, plus the session header when sessions travel in a header |
| `SetCookieSecure(False)` | Disables the `Secure` flag on session cookies — only for plain-HTTP development. Cookies are `HttpOnly + SameSite=Strict + Secure` by default. |

## The Origin Allowlist

If `SetAllowedOrigins` is not called, any origin is accepted. Once an allowlist is set:

- requests whose `Origin` does not match any entry are rejected with `403 Forbidden`;
- requests with `Origin: null` are always rejected;
- requests with no `Origin` header are accepted, so command-line tools such as curl or Bruno keep working. Call `SetRequireOrigin(True)` to reject them too.

For development you can omit `SetAllowedOrigins` or guard it with `{$IFNDEF DEBUG}`:

```pascal
.Security
  .SetCORS(True)
  .SetAllowedMethods(['POST'])
  {$IFNDEF DEBUG}
  .SetAllowedOrigins(['https://my-production-origin.com'])
  {$ENDIF}
.BackToMCP
```
