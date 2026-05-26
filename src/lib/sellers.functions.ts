import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

export const adminListSellers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await supabaseAdmin
      .from("sellers")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const upsertSellerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(255),
  code: z.string().min(1).max(64).regex(/^[A-Za-z0-9_-]+$/),
  commission_percent: z.number().min(0).max(100),
  active: z.boolean().default(true),
});

export const upsertSeller = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => upsertSellerSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const payload = {
      name: data.name.trim(),
      code: data.code.trim().toUpperCase(),
      commission_percent: data.commission_percent,
      active: data.active,
    };
    if (data.id) {
      const { data: row, error } = await supabaseAdmin
        .from("sellers")
        .update(payload)
        .eq("id", data.id)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return row;
    }
    const { data: row, error } = await supabaseAdmin
      .from("sellers")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteSeller = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("sellers").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// Public validation function for the checkout page
export const validateSellerCode = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ code: z.string().min(1).max(64) }).parse(input))
  .handler(async ({ data }) => {
    const { data: seller, error } = await supabaseAdmin
      .from("sellers")
      .select("id,name")
      .eq("code", data.code.trim().toUpperCase())
      .eq("active", true)
      .maybeSingle();
    
    if (error) throw new Error(error.message);
    if (!seller) {
      return { valid: false, reason: "Código de asesor no válido o inactivo" };
    }
    return { valid: true, id: seller.id, name: seller.name };
  });
