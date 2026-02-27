# JSON-RPC

## What is JSON-RPC?

JSON-RPC is a lightweight, transport-agnostic remote procedure call protocol. It uses JSON as its data format and is designed to be simple: a client sends a request object identifying a method and its parameters, and the server replies with either a result or an error.

The MCP protocol is built entirely on top of JSON-RPC 2.0 — every tool call, resource read, and initialization handshake is a JSON-RPC message. MCPConnect handles all of this transparently; you never need to touch the protocol layer when building MCP servers.

## JRPC — The Embedded JSON-RPC Library

MCPConnect includes a full JSON-RPC 2.0 implementation called **JRPC**. It can also be used independently of MCP for any Delphi project that needs RPC communication:

```pascal
uses
  MCPConnect.JRPC.Core;
```

## Defining a JSON-RPC API

Annotate a class with `[JRPC('namespace')]` to group its methods under a common prefix. Mark individual methods with `[JRPCMethod('name')]` and parameters with `[JRPCParam('name')]`:

```pascal
uses
  MCPConnect.JRPC.Core;

[JRPC('math')]
TMathApi = class
public
  [JRPCMethod('sum')]
  function Sum(
    [JRPCParam('a')] A,
    [JRPCParam('b')] B: Integer): Integer;

  [JRPCMethod('echo')]
  function EchoString(
    [JRPCParam('value')] const AValue: string): string;

  [JRPCMethod('timestamp')]
  function GetCurrentTimestamp: TDateTime;
end;
```

Methods are addressed as `namespace/methodname` (e.g. `math/sum`). Return values and parameters are marshaled automatically via Neon.

## Registering Classes

Register API classes in the global `TJRPCRegistry` — typically in the `initialization` section of the unit:

```pascal
initialization
  TJRPCRegistry.Instance.RegisterClass(TMathApi);
```

## Server Setup

Wire the registry to the HTTP transport with `TJRPCServer` and `TJRPCDispatcher` (same components used for MCP):

```pascal
procedure TWebModule1.WebModuleCreate(Sender: TObject);
begin
  FJRPCServer := TJRPCServer.Create(Self);

  FJRPCDispatcher := TJRPCDispatcher.Create(Self);
  FJRPCDispatcher.PathInfo := '/jrpc';
  FJRPCDispatcher.Server := FJRPCServer;
end;
```

The endpoint is then available at `/jrpc` and accepts standard JSON-RPC 2.0 POST requests.

## Error Handling

Raise `EJRPCException` (or a subclass) from any method to return a structured JSON-RPC error response. JRPC maps Delphi exceptions to the standard error codes automatically:

| Exception class | Code | Meaning |
|-----------------|------|---------|
| `EJRPCException` | -32603 | Internal error (default) |
| `EJRPCParseError` | -32700 | Invalid JSON received |
| `EJRPCInvalidRequestError` | -32600 | Request is not a valid JSON-RPC object |
| `EJRPCMethodNotFoundError` | -32601 | Method does not exist |
| `EJRPCInvalidParamsError` | -32602 | Invalid parameters |
