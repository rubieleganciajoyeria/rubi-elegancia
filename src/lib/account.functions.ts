import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [profileRes, ordersRes] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("id,full_name,phone,city,address")
        .eq("id", context.userId)
        .maybeSingle(),
      supabaseAdmin
        .from("orders")
        .select("*, order_items(*)")
        .eq("user_id", context.userId)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);
    if (profileRes.error) throw new Error(profileRes.error.message);
    if (ordersRes.error) throw new Error(ordersRes.error.message);
    return {
      profile: profileRes.data ?? { id: context.userId, full_name: "", phone: "", city: "", address: "" },
      orders: ordersRes.data ?? [],
    };
  });

const profileInput = z.object({
  full_name: z.string().max(255).optional().default(""),
  phone: z.string().max(40).optional().default(""),
  city: z.string().max(120).optional().default(""),
  address: z.string().max(500).optional().default(""),
});

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => profileInput.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin
      .from("profiles")
      .upsert({ id: context.userId, ...data }, { onConflict: "id" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });