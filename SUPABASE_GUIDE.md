# Supabase Connection & MCP Guide

This guide documents the Supabase setup for the UniMate project to ensure persistence of this context for future AI sessions.

## 1. Connection Details
The project uses the Supabase Javascript Client.

- **Configuration File**: `src/integrations/supabase/client.ts`
- **Environment Variables**:
    - `VITE_SUPABASE_URL`: The URL of your Supabase project.
    - `VITE_SUPABASE_PUBLISHABLE_KEY`: The public API key (safe for browser).
    - *Service Role Key*: (Keep secret, used for backend/admin scripts, not in client code).

## 2. Database Schema Summary
Key tables identified in the project:

### `profiles`
- `id` (UUID, Primary Key)
- `username`, `first_name`, `last_name`
- `role` ('user' | 'admin')
- `avatar_url`, `bio`, `university`, `major`, etc.

### `listings` (Mates/Housing)
- `id` (Primary Key)
- `title`, `description`, `price`
- `type` (e.g., 'roommate', 'housing')
- `author_id` (FK to profiles)
- `location`, `images`

### `messages`
- `id` (Primary Key)
- `sender_id`, `receiver_id` (FKs to profiles)
- `content`, `created_at`
- `read` (boolean)

## 3. MCP Integration (Remote Memory)
To allow an AI Assistant (like me) to directly query your database and "remember" the schema dynamically, you can run a **Supabase MCP Server**.

### Recommended Setup
Use the community [Start Supabase MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/supabase) or a generic Postgres MCP.

**Configuration (e.g., in Claude Desktop or similar MCP client):**
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-supabase",
        "--supabase-url",
        "YOUR_SUPABASE_URL",
        "--supabase-key",
        "YOUR_SERVICE_ROLE_KEY"
      ]
    }
  }
}
```
*Note: You need the **Service Role Key** for the MCP server to have full access to schema and data. Do NOT use the Publishable Key here.*

### Benefits
- **Schema Discovery**: The AI can list all tables and columns.
- **Data Querying**: The AI can write SQL queries to fetch or inspect data (read-only recommended for safety).
- **Persistent Context**: You don't need to paste schema files every time; the AI simply asks the MCP server.
