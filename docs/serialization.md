# Serialization

Tool and resource methods can return virtually any Delphi type. MCPConnect picks the most appropriate serialization strategy automatically based on the return type.

## How Return Values Are Serialized

| Return type | Strategy |
|-------------|----------|
| `string`, `Integer`, `Boolean`, `Double`, … | Wrapped directly into a text content item — no further conversion. |
| `TStream`, `TBytes` | Encoded as base64 and returned as a binary blob. |
| `TPicture` | Encoded as a PNG image content item (requires `TMCPPictureWriter`). |
| Any Delphi class or generic list | Serialized to JSON via **Neon** and returned as a text content item. |
| `TContentList` | Passed through unchanged — gives you full control over the output. |

### Primitive types

Simple scalar values are converted to their string representation and returned as a single `text` content item:

```pascal
[McpTool('double_or_nothing', 'Doubles or zeroes the input')]
function TestParam(
  [McpParam('value', 'The value')] AValue: Int64;
  [McpParam('double', 'Whether to double')] ADouble: Boolean
): Integer;
```

### Delphi objects and collections

Any class or generic object list is serialized to JSON by Neon. No extra setup is needed — just return the object:

```pascal
type
  TTicket = class
  private
    FId: Integer;
    FTitle: string;
    FPrice: Currency;
  public
    property Id: Integer read FId write FId;
    property Title: string read FTitle write FTitle;
    property Price: Currency read FPrice write FPrice;
  end;

  TTickets = class(TObjectList<TTicket>);

// Tool method — MCPConnect serializes TTickets to a JSON array
[McpTool('get_tickets', 'Get available tickets')]
function GetTickets: TTickets;
```

The LLM receives a JSON array with one object per ticket.

> Objects returned from tool methods are owned and freed by MCPConnect. If you need the object to outlive the call (e.g., it is owned by a session), use the `[Context] IGarbageCollector` helper to transfer ownership. See the Tools chapter for details.

## TContentList — Full Control

When you need to include multiple content items, mix content types (text + image, text + audio, …), or produce binary output, return a `TContentList`. All methods return `Self`, so calls can be chained:

```pascal
uses
  MCPConnect.MCP.Types;

[McpTool('buy_tickets', 'Confirm purchase of all tickets in the cart')]
function BuyTickets: TContentList;

function TDelphiDayTool.BuyTickets: TContentList;
var
  LStream: TFileStream;
begin
  Result := TContentList.Create;
  Result.AddText('Purchase completed successfully.');

  LStream := TFileStream.Create('ticket.png', fmOpenRead or fmShareDenyWrite);
  try
    Result.AddImage('image/png', LStream);
  finally
    LStream.Free;
  end;
end;
```

### TContentList methods

| Method | Description |
|--------|-------------|
| `AddText(text)` | Adds a plain-text content item |
| `AddImage(mime, stream)` | Encodes a stream as base64 and adds an image content item |
| `AddImage(mime, base64)` | Adds an image content item from an already-encoded base64 string |
| `AddAudio(mime, stream)` | Encodes a stream as base64 and adds an audio content item |
| `AddAudio(mime, base64)` | Adds an audio content item from an already-encoded base64 string |
| `AddBlob(mime, stream)` | Encodes a stream as base64 and adds an embedded binary resource |
| `AddBlob(mime, base64)` | Adds a blob from an already-encoded base64 string |
| `AddLink(mime, uri, description)` | Adds a resource link (external URI reference) |

## Configuring Neon

Neon is the JSON serialization library used internally by MCPConnect. By default it serializes public fields using camelCase names. You can override this behavior through the `IJRPCNeonConfig` plugin.

Add `MCPConnect.Configuration.Neon` and `Neon.Core.Persistence` to the uses clause:

```pascal
uses
  Neon.Core.Persistence,
  MCPConnect.Configuration.Neon;
```

Then build an `INeonConfiguration` and pass it to the plugin:

```pascal
var
  LNeonConfig: INeonConfiguration;
begin
  LNeonConfig := TNeonConfiguration.Default;
  LNeonConfig
    .SetMemberCase(TNeonCase.CamelCase)
    .SetVisibility([mvPublic, mvPublished]);

  FJRPCServer
    .Plugin.Configure<IJRPCNeonConfig>
      .SetNeonConfig(LNeonConfig)
    .ApplyConfig;
end;
```

### Common Neon options

| Option | Example | Effect |
|--------|---------|--------|
| `SetMemberCase` | `TNeonCase.CamelCase` | `FirstName` → `"firstName"` |
| `SetMemberCase` | `TNeonCase.PascalCase` | `FirstName` → `"FirstName"` |
| `SetMemberCase` | `TNeonCase.SnakeCase` | `FirstName` → `"first_name"` |
| `SetVisibility` | `[mvPublic, mvPublished]` | Which member visibility levels are serialized |
| `GetSerializers.RegisterSerializer` | `TMySerializer` | Plug in a custom type serializer |

Refer to the [Neon documentation](https://github.com/paolo-rossi/delphi-neon) for the full list of configuration options and how to write custom serializers.
