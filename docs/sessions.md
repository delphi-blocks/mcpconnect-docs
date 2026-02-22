# Session Management

MCPConnect provides built-in session management for maintaining stateful interactions across multiple requests. Sessions are thread-safe, automatically managed, and can store both generic JSON data or fully typed custom objects.

## Configuring Session Support

Add session configuration to your server setup:

```delphi
uses
  MCPConnect.Configuration.Session,
  MCPConnect.Configuration.MCP,
  MCPConnect.Session.Core;

FJRPCServer
  .Plugin.Configure<ISessionConfig>
    .SetLocation(TSessionIdLocation.Header)  // or Cookie
    .SetHeaderName('Mcp-Session-Id')         // Default for MCP
    .SetTimeout(30)                           // Minutes
    .SetSessionClass(TSessionData)            // Or your custom class
  .ApplyConfig

  .Plugin.Configure<IMCPConfig>
    .Server
      .SetName('delphi-mcp-server')
      .SetVersion('2.0.0')
      .SetCapabilities([Tools])
    .BackToMCP
    .Tools
      .RegisterClass(TShoppingCartTool)
    .BackToMCP;
```

### Session Behavior by Transport

| Transport | Behavior |
|-----------|----------|
| HTTP (WebBroker/Indy) | Session ID passed via header or cookie. Server returns `Mcp-Session-Id` header on first request. |
| STDIO | Implicit session per connection — no session ID needed. |

## Using Sessions in Your Tools

Sessions are automatically injected into your tool classes using the `[Context]` attribute.

### Option 1: Generic JSON Storage (`TSessionData`)

```delphi
type
  TShoppingCartTool = class
  private
    [Context]
    FSession: TSessionData;  // Automatically injected
  public
    [McpTool('cart_add', 'Add item to shopping cart')]
    function AddToCart(
      [McpParam('item_id')] const AItemId: string;
      [McpParam('quantity')] AQuantity: Integer
    ): string;
  end;

function TShoppingCartTool.AddToCart(const AItemId: string;
  AQuantity: Integer): string;
var
  LCart: TJSONObject;
begin
  if not FSession.Data.TryGetValue<TJSONObject>('cart', LCart) then
  begin
    LCart := TJSONObject.Create;
    FSession.Data.AddPair('cart', LCart);
  end;
  LCart.AddPair(AItemId, TJSONNumber.Create(AQuantity));
  Result := Format('Added %d x %s to cart', [AQuantity, AItemId]);
end;
```

### Option 2: Custom Typed Session

For better type safety, create a custom session class that extends `TSessionBase`:

```delphi
type
  TCartItem = class
  private
    FItemId: string;
    FQuantity: Integer;
  public
    property ItemId: string read FItemId write FItemId;
    property Quantity: Integer read FQuantity write FQuantity;
  end;

  TShoppingSession = class(TSessionBase)
  private
    FCart: TObjectDictionary<string, TCartItem>;
  public
    property Cart: TObjectDictionary<string, TCartItem> read FCart;
    constructor Create;
    destructor Destroy; override;
  end;

constructor TShoppingSession.Create;
begin
  inherited;
  FCart := TObjectDictionary<string, TCartItem>.Create([doOwnsValues]);
end;

// In your tool class:
type
  TShoppingCartTool = class
  private
    [Context]
    FSession: TShoppingSession;  // Typed session — fully type-safe
  public
    [McpTool('cart_add', 'Add item to cart')]
    function AddToCart(const AItemId: string; AQuantity: Integer): string;
  end;

function TShoppingCartTool.AddToCart(const AItemId: string;
  AQuantity: Integer): string;
var
  LItem: TCartItem;
begin
  if FSession.Cart.TryGetValue(AItemId, LItem) then
    LItem.Quantity := LItem.Quantity + AQuantity
  else
  begin
    LItem := TCartItem.Create;
    LItem.ItemId := AItemId;
    LItem.Quantity := AQuantity;
    FSession.Cart.Add(AItemId, LItem);
  end;
  Result := Format('Added %d x %s', [AQuantity, AItemId]);
end;
```

Register your custom session class in the configuration:

```delphi
.SetSessionClass(TShoppingSession)
```
