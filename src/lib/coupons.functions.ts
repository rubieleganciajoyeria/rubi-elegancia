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

export const validateCoupon = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        code: z.string().min(1).max(64).regex(/^[A-Za-z0-9_-]+$/),
        subtotal: z.number().int().min(0),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin.rpc("validate_coupon", {
      _code: data.code,
      _subtotal: data.subtotal,
    });
    if (error) throw new Error(error.message);
    const r = Array.isArray(rows) ? rows[0] : rows;
    if (!r) return { valid: false, code: data.code, discount: 0, reason: "Cupón no encontrado" };
    return {
      valid: Boolean(r.valid),
      code: r.code as string,
      kind: r.kind as string,
      value: r.value as number,
      discount: Number(r.discount ?? 0),
      reason: (r.reason as string) ?? "",
    };
  });

const upsertSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().min(1).max(64).regex(/^[A-Za-z0-9_-]+$/),
  kind: z.enum(["percent", "fixed"]),
  value: z.number().int().min(1),
  min_subtotal: z.number().int().min(0).default(0),
  max_uses: z.number().int().min(1).nullable().optional(),
  expires_at: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

export const adminListCoupons = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const upsertCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => upsertSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const payload = {
      code: data.code.toUpperCase(),
      kind: data.kind,
      value: data.value,
      min_subtotal: data.min_subtotal ?? 0,
      max_uses: data.max_uses ?? null,
      expires_at: data.expires_at || null,
      is_active: data.is_active,
    };
    if (data.id) {
      const { data: row, error } = await supabaseAdmin
        .from("coupons").update(payload).eq("id", data.id).select("id").single();
      if (error) throw new Error(error.message);
      return row;
    }
    const { data: row, error } = await supabaseAdmin
      .from("coupons").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteCoupon = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("coupons").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });