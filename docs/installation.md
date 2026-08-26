# Installation

## Requirements

- Delphi **11 Alexandria or newer** — tested on 11, 12 and 13.
- [Neon](https://github.com/paolo-rossi/delphi-neon) as Serialization Engine.
- [JOSE-JWT](https://github.com/paolo-rossi/delphi-jose-jwt) as JWT validation engine (required for OAuth 2.1 token signature verification).
- [Logify](https://github.com/delphi-blocks/Logify) as (meta) logging library.

## Install with Blocks

The easiest way to install MCPConnect and all its dependencies is via [Blocks](https://delphipm.com), the Delphi package manager:

```batch
REM 1. Install Blocks
winget install DelphiBlocks.Blocks

REM 2. Create a workspace in the current directory (prompts for the Delphi version)
blocks init

REM 3. Install MCPConnect and all dependencies
blocks install delphi-blocks.mcpconnect
```

## Manual Installation

**1. Clone the Neon repository:**

```bash
git clone https://github.com/paolo-rossi/delphi-neon
```

**2. Clone the JOSE-JWT repository:**

```bash
git clone https://github.com/paolo-rossi/delphi-jose-jwt
```

**3. Clone the Logify repository:**

```bash
git clone https://github.com/delphi-blocks/Logify
```

**4. Clone the MCPConnect repository:**

```bash
git clone https://github.com/delphi-blocks/MCPConnect.git
```

**5. Add to Project Path:** Add the `Source` directory of all cloned repositories to your Delphi Project's search path.

