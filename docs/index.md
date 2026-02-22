---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "MCPConnect"
  image:
    src: ./logo-white.png
    alt: MCPConnect
  text: "A Delphi MCP Server Library"
  tagline: A powerful, attribute-driven framework for building Model Context Protocol (MCP) Servers in Delphi.
  actions:
    - theme: brand
      text: What is MCP?
      link: /introduction
    - theme: alt
      text: Configure
      link: /server-setup
    - theme: alt
      text: Your first MCP Tool
      link: /tools

features:
  - title: Attribute-Driven Development
    icon: 🏷️
    details: Expose existing Delphi classes as MCP tools, resources, and prompts with a single attribute. No complex inheritance, no boilerplate. The framework handles routing, serialization, and JSON Schema generation automatically.
  - title: Multi-Transport & Session Management
    icon: 🚛
    details: Built-in support for HTTP (WebBroker, Indy) and STDIO transports. Thread-safe stateful sessions are injected automatically via attributes, with configurable timeout, automatic cleanup, and support for both generic JSON and fully typed custom session classes.
  - title: Type-Safe JSON-RPC Engine
    icon: 🛡️
    details: Powered by an integrated, high-performance JSON-RPC 2.0 library (JRPC) built specifically for Delphi. Supports virtually every Delphi type as tool parameter or result through Neon serialization, with full protocol compliance and API-key authentication for HTTP transport.
---

