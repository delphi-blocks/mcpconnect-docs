# Introduction

::: warning MCP 2026-07-28
Support for the MCP specification version [2026-07-28](https://modelcontextprotocol.io/docs/2026-07-28/getting-started/intro) is currently under development in the [feature/mcp-2026-07-28](https://github.com/delphi-blocks/MCPConnect/tree/feature/mcp-2026-07-28) branch.
:::

## What is MCP?

The Model Context Protocol (MCP) is an open standard for connecting large language models (LLMs) to external tools and data.

It enables AI models to go beyond their training data by accessing new information, performing actions, and interacting with tools and databases.

With MCP servers you can:
* Provide functionality through `Tools` (used to execute code or otherwise produce a side effect)
* Expose data through `Resources` (used to load information into the LLM's context)
* Define interaction through `Prompts` (reusable templates for LLM interactions)

## What is MCPConnect?

**Delphi MCP Connect (MCPConnect)** is a lightweight yet robust framework designed to drastically simplify the creation of **Model Context Protocol (MCP) Servers** using Embarcadero Delphi. By leveraging the power of **Attributes**, the framework allows developers to re-use existing business logic and standard Delphi classes, turning them into protocol-aware server components with minimal boilerplate code.

MCPConnect handles the serialization, routing, and context management required for the server-side implementation of the MCP protocol.

## Highlights

- 🛡️ **Type safety** — Define your tool arguments as native Delphi classes or records; MCPConnect handles the rest.
- 🚛 **Transports** — Built-in HTTP (WebBroker, Indy) and STDIO transports for both stateless and persistent connections.
- 🗂️ **Session Management** — Built-in stateful session support across requests with automatic cleanup and custom session data.
- ⚡ **Low boilerplate** — MCPConnect generates all the MCP endpoints for you, apart from your tools, prompts and resources.
- 🔐 **OAuth 2.1** — Built-in support for OAuth 2.1 bearer-token authentication following the MCP Authorization specification, with pluggable token validators, JWKS key management, and a metadata proxy for providers that don't fully advertise PKCE support.

## Key Features

- **Attribute-Driven Development** — Simply register classes to automatically discover tools, resources, and prompts using the `[McpTool]`, `[McpResource]`, `[McpPrompt]` attributes to expose specific methods.
- **Standard Code Re-use** — Easily expose existing business logic classes without heavy modification or complex inheritance hierarchies.
- **Automatic Routing** — The framework automatically scans and registers methods decorated with the appropriate attributes, handling all request routing.
- **Easy-to-use classes** for tools, prompts, and resources.
- **Session Management** — Thread-safe session support with configurable timeout, automatic cleanup, and support for both generic (`TJSONObject`) and custom typed session data. Sessions are automatically injected via the `[Context]` attribute.
- **OAuth 2.1 Authentication** — Acts as an OAuth 2.1 resource server following the [MCP Authorization specification](https://modelcontextprotocol.io/specification/draft/basic/authorization). Delegates authentication to any external authorization server (Microsoft Entra ID, Auth0, Keycloak, Okta, or any OpenID Connect provider).
- **API-Key authentication** for HTTP transport.
- **JSON-RPC** — MCPConnect contains a comprehensive, high-performance JSON-RPC 2.0 library (`JRPC`) built specifically for Delphi.
- **Automatic JSON Schema generation** — Using the powerful Neon `TSchemaGenerator`, MCPConnect supports any Delphi type as parameter or result.

## What is JSON-RPC?

JSON-RPC is a stateless, light-weight remote procedure call (RPC) protocol. Primarily this specification defines several data structures and the rules around their processing. It is transport agnostic in that the concepts can be used within the same process, over sockets, over HTTP, or in many various message passing environments. It uses JSON (RFC 4627) as data format and it is designed to be simple!

### JRPC for Delphi

Inside MCPConnect you can find a complete implementation of the JSON-RPC v2.0 protocol that can be used independently of MCPConnect for all types of Delphi projects. This library empowers you to focus purely on your application logic, allowing you to define your remote APIs using simple Delphi class methods and attributes. Whether you are creating a client to consume external RPC services or exposing your own high-performance server methods, **JRPC** makes complex distributed computing simple, declarative, and fast.

The main features of JRPC are:

* **Automatic Marshaling** — Seamless conversion of Delphi objects into JSON-RPC requests and responses.
* **Broad Delphi types support** — Using Neon, JRPC supports virtually every Delphi type as request parameters or result.
* **Protocol Compliance** — Full adherence to the JSON-RPC 2.0 specification.
