# JSON-RPC & JRPC

## What is JSON-RPC?

JSON-RPC is a stateless, lightweight remote procedure call (RPC) protocol. It defines several data structures and the rules around their processing, and is transport agnostic — it can be used within the same process, over sockets, over HTTP, or in many other message-passing environments. It uses JSON (RFC 4627) as its data format and is designed to be simple.

## JRPC for Delphi

Inside MCPConnect you can find a complete implementation of the **JSON-RPC v2.0** protocol that can be used independently of MCPConnect for all types of Delphi projects.

JRPC lets you focus purely on your application logic, defining remote APIs using simple Delphi class methods and attributes. Whether you are creating a client to consume external RPC services or exposing your own high-performance server methods, JRPC makes complex distributed computing simple, declarative, and fast.

## Key Features

- **Automatic Marshaling** — Seamless conversion of Delphi objects into JSON-RPC requests and responses.
- **Broad Delphi type support** — Using Neon, JRPC supports virtually every Delphi type as request parameters or result.
- **Protocol Compliance** — Full adherence to the JSON-RPC 2.0 specification.

## Using JRPC Independently

The JRPC library can be referenced on its own without the MCP layer:

```delphi
uses
  MCPConnect.JRPC.Core;
```

This makes it suitable as a general-purpose JSON-RPC foundation for any Delphi project that needs RPC communication, regardless of AI or MCP involvement.
