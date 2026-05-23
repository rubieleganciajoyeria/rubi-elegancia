import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type SiteContentMap = Record<string, any>;

export const listSiteContent = createServerFn({ method: "GET" }).handler(
  async () => {
    const { data, error } = await supabaseAdmin.from("site_content").select("key,data");
    if (error) throw new Error(error.message);
    const map: SiteContentMap = {};
    for (const r of data ?? []) map[r.key] = r.data;
    return map;
  },
);

export const getGlobalSettings = createServerFn({ method: "GET" }).handler(
  async () => {
    const { data, error } = await supabaseAdmin
      .from("site_content")
      .select("data")
      .eq("key", "global_settings")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (data?.data ?? {}) as {
      whatsapp?: string;
      whatsapp_message?: string;
      announcement?: string;
      global_discount_percent?: number;
      global_discount_active?: boolean;
    };
  },
);

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

export const upsertSiteContent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        key: z.string().min(1).max(80),
        data: z.any(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin
      .from("site_content")
      .upsert({ key: data.key, data: data.data }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });