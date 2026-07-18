import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "list_modules",
  title: "List course modules",
  description:
    "List published course modules, optionally filtered to a single chapter. Returns id, title, description, chapter_id, and order.",
  inputSchema: {
    chapter_id: z.string().uuid().optional().describe("Optional chapter id to filter by."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ chapter_id }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    let query = supabaseForUser(ctx)
      .from("modules")
      .select("id, title, description, chapter_id, order_number, status")
      .eq("status", "published")
      .order("order_number", { ascending: true });
    if (chapter_id) query = query.eq("chapter_id", chapter_id);
    const { data, error } = await query;
    if (error) {
      return { content: [{ type: "text", text: error.message }], isError: true };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { modules: data },
    };
  },
});