# Memory Management

MCPConnect handles memory automatically in most cases: objects returned by tool and resource methods are serialized and then freed by the framework once the response has been sent. However, there are scenarios where this is not enough.

## When Automatic Management Falls Short

### Dependent objects

MCPConnect owns and frees the object you return. But if that object in turn owns — or depends on — other objects that were created alongside it, you need to ensure those are freed too.

In a `TObjectList<T>` with default ownership this is not a problem because the list frees its children. But in more complex graphs where ownership is ambiguous or where cleanup requires closing handles or releasing external resources, you need explicit control.

### Exception safety

If an exception is raised after you create the return object but before the method exits, the object leaks because MCPConnect never receives it. The classic guard is a `try/except` block:

```pascal
function TDelphiDayTool.GetTickets: TTickets;
begin
  Result := TTickets.Create;
  try
    Result.Add(TTicket.Create(1, 'Conferenza + Seminari', StrToDate('19/11/2025'), 179.0, ''));
    Result.Add(TTicket.Create(2, 'Solo Conferenza', StrToDate('19/11/2025'), 0, ''));
    Result.Add(TTicket.Create(3, 'Young ticket', StrToDate('19/11/2025'), 69.0, ''));
  except
    Result.Free;
    raise;
  end;
end;
```

This works but adds boilerplate. The `IGarbageCollector` offers a cleaner alternative.

## IGarbageCollector

`IGarbageCollector` is a request-scoped collector that frees everything registered in it at the end of the request, whether it completes normally or raises an exception. Inject it into your tool or resource class via the `[Context]` attribute:

```pascal
uses
  MCPConnect.Core.Utils;

TDelphiDayTool = class
private
  [Context] FGC: IGarbageCollector;
public
  [McpTool('get_tickets', 'Get available tickets')]
  function GetTickets: TTickets;
end;
```

MCPConnect creates and injects a `IGarbageCollector` instance for each request. It is destroyed — and all registered objects freed — when the request ends.

### Exception-safe object creation

Register the object immediately after creating it. If an exception is raised later, the GC disposes it:

```pascal
function TDelphiDayTool.GetTickets: TTickets;
begin
  Result := TTickets.Create;
  FGC.Add(Result);  // GC will free Result if an exception is raised before return
  Result.Add(TTicket.Create(1, 'Conferenza + Seminari', StrToDate('19/11/2025'), 179.0, ''));
  Result.Add(TTicket.Create(2, 'Solo Conferenza', StrToDate('19/11/2025'), 0, ''));
  Result.Add(TTicket.Create(3, 'Young ticket', StrToDate('19/11/2025'), 69.0, ''));
end;
```

No `try/except` needed: the GC acts as the safety net.

### Custom disposal action

For objects that require special cleanup beyond `Free`, pass a disposal procedure:

```pascal
FGC.Add(LConnection, procedure
begin
  LConnection.Close;
  LConnection.Free;
end);
```

## IGarbageCollector API Reference

| Method | Description |
|--------|-------------|
| `Add(obj)` | Track a single object; freed with `obj.Free` at end of request |
| `Add(obj, action)` | Track with a custom `TDisposeAction` called instead of `Free` |
| `Add(array)` | Track multiple objects at once |
| `Add(array, action)` | Track multiple objects with a shared custom action |
| `CollectGarbage` | Force immediate disposal of all tracked objects (normally called automatically) |

> `Add` accepts `TValue`, so you can pass any object directly — Delphi converts it implicitly. Duplicate registrations are silently ignored.
