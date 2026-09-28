# Khmer AI Reference - Model Context Protocol (MCP) Server

This MCP server enables AI agents (Claude Desktop, Cursor, Antigravity, Copilot) to query verified Khmer terminology and disambiguation rules in real time.

---

## Exposed Tools

1. `search_khmer_terminology(query, domain?)`:
   - Searches verified Khmer terminology with notes and status.
2. `get_khmer_context_rules(term)`:
   - Provides disambiguation across domains (e.g. difference between bank account vs user account).
3. `get_translation_examples(phrase)`:
   - Returns human-reviewed sentence pairs.

---

## Configuration Example

### Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "khmer-ai-reference": {
      "command": "node",
      "args": [
        "c:/Users/USER/Desktop/testing/open-source/examples/mcp/server.js"
      ]
    }
  }
}
```

### Cursor (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "khmer-ai-reference": {
      "command": "node",
      "args": ["examples/mcp/server.js"]
    }
  }
}
```
