import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ActivePromotion = {
  id: string;
  name: string;
  kind: "percent" | "amount";
  value: number;
  ends_at: string | null;
  product_id: string | null;
  priority: number;
};

export const listActivePromotions = createServerFn({ method: "GET" }).handler(
  async () => {
    const nowIso = new Date().toISOString();
    const { data, error } = await supabaseAdmin
      .from("promotions")
      .select("id,name,kind,value,ends_at,product_id,priority")
      .eq("is_active", true)
      .lte("starts_at", nowIso)
      .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
      .order("priority", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as ActivePromotion[];
  },
);

/** Calcula precio efectivo: prioridad → producto > global, luego mayor descuento. */
export function applyPromotions(
  basePrice: number,
  productDiscount: number | null,
  productId: string,
  promotions: ActivePromotion[],
): number | null {
  const candidates: number[] = [];
  if (productDiscount !== null) candidates.push(productDiscount);

  for (const p of promotions) {
    if (p.product_id && p.product_id !== productId) continue;
    const final =
      p.kind === "percent"
        ? Math.round(basePrice * (1 - Math.min(p.value, 100) / 100))
        : Math.max(0, basePrice - p.value);
    candidates.push(final);
  }
  if (candidates.length === 0) return null;
  const best = Math.min(...candidates);
  return best < basePrice ? best : null;
}

async function assertAdmin(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

export const adminListPromotions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("promotions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const promoSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1).max(120),
  kind: z.enum(["percent", "amount"]),
  value: z.number().int().min(1).max(2_000_000_000),
  starts_at: z.string().min(1),
  ends_at: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
  product_id: z.string().uuid().nullable().optional(),
  priority: z.number().int().default(0),
});

export const upsertPromotion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => promoSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const payload = {
      ...data,
      ends_at: data.ends_at || null,
      product_id: data.product_id || null,
    };
    if (data.id) {
      const { error } = await supabaseAdmin
        .from("promotions")
        .update(payload)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabaseAdmin
      .from("promotions")
      .insert(payload)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const deletePromotion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("promotions")
      .delete()
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
