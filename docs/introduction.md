# Introduction

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

## Key Features

- **Attribute-Driven Development** — Simply register classes to automatically discover tools, resources, and prompts using the `[McpTool]`, `[McpResource]`, `[McpPrompt]` attributes to expose specific methods.
- **Standard Code Re-use** — Easily expose existing business logic classes without heavy modification or complex inheritance hierarchies.
- **Automatic Routing** — The framework automatically scans and registers methods decorated with the appropriate attributes, handling all request routing.
- **Easy-to-use classes** for tools, prompts, and resources.
- **Session Management** — Thread-safe session support with configurable timeout, automatic cleanup, and support for both generic (`TJSONObject`) and custom typed session data. Sessions are automatically injected via the `[Context]` attribute.
- **API-Key authentication** for HTTP transport.
- **JSON-RPC** — MCPConnect contains a comprehensive, high-performance JSON-RPC 2.0 library (`JRPC`) built specifically for Delphi.
- **Automatic JSON Schema generation** — Using the powerful Neon `TSchemaGenerator`, MCPConnect supports any Delphi type as parameter or result.
