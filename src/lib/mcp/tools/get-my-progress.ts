import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "get_my_progress",
  title: "Get my course progress",
  description:
    "Return the signed-in parent's progress across all course modules: which they've started, which they've completed, and totals.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const sb = supabaseForUser(ctx);
    const [{ data: progress, error: pErr }, { data: modules, error: mErr }] = await Promise.all([
      sb
        .from("user_progress")
        .select("module_id, started_at, completed_at")
        .eq("user_id", ctx.getUserId()!),
      sb
        .from("modules")
        .select("id, title, chapter_id, order_number")
        .eq("status", "published"),
    ]);
    if (pErr || mErr) {
      return {
        content: [{ type: "text", text: (pErr ?? mErr)!.message }],
        isError: true,
      };
    }
    const completed = (progress ?? []).filter((p) => p.completed_at).length;
    const started = (progress ?? []).filter((p) => p.started_at && !p.completed_at).length;
    const summary = {
      total_modules: modules?.length ?? 0,
      completed,
      in_progress: started,
      progress,
      modules,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(summary) }],
      structuredContent: summary,
    };
  },
});