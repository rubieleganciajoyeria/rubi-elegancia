import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { applyPromotions, type ActivePromotion } from "./promotions.functions";

const createOrderInput = z.object({
  customer_name: z.string().min(1).max(255),
  customer_email: z.string().email().max(255),
  customer_phone: z.string().min(3).max(40),
  city: z.string().min(1).max(120),
  address: z.string().min(1).max(500),
  notes: z.string().max(1000).optional().default(""),
  user_id: z.string().uuid().optional().nullable(),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        qty: z.number().int().min(1).max(99),
      }),
    )
    .min(1)
    .max(50),
});

export const createOrder = createServerFn({ method: "POST" })
  .inputValidator((input) => createOrderInput.parse(input))
  .handler(async ({ data }) => {
    const ids = Array.from(new Set(data.items.map((i) => i.product_id)));
    const nowIso = new Date().toISOString();

    const [{ data: products, error: pErr }, { data: promos, error: prErr }] = await Promise.all([
      supabaseAdmin
        .from("products")
        .select("id,name,slug,image,price,discount_price,stock,is_active")
        .in("id", ids),
      supabaseAdmin
        .from("promotions")
        .select("id,name,kind,value,ends_at,product_id,priority")
        .eq("is_active", true)
        .lte("starts_at", nowIso)
        .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
        .order("priority", { ascending: false }),
    ]);
    if (pErr) throw new Error(pErr.message);
    if (prErr) throw new Error(prErr.message);

    const promoList = (promos ?? []) as ActivePromotion[];
    const productMap = new Map((products ?? []).map((p) => [p.id, p]));

    const rows = data.items.map((it) => {
      const p = productMap.get(it.product_id);
      if (!p || !p.is_active) throw new Error(`Producto no disponible: ${it.product_id}`);
      if (p.stock !== null && p.stock !== undefined && p.stock < it.qty) {
        throw new Error(`Stock insuficiente para ${p.name}`);
      }
      const unit = applyPromotions(p.price, p.discount_price, p.id, promoList) ?? p.price;
      return {
        product_id: p.id,
        product_name: p.name,
        product_slug: p.slug,
        product_image: p.image,
        unit_price: unit,
        qty: it.qty,
        subtotal: unit * it.qty,
      };
    });

    const subtotal = rows.reduce((s, r) => s + r.subtotal, 0);
    const shipping = subtotal > 0 && subtotal < 500000 ? 25000 : 0;
    const total = subtotal + shipping;

    const { data: order, error: oErr } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: data.user_id ?? null,
        customer_name: data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        city: data.city,
        address: data.address,
        notes: data.notes ?? "",
        subtotal,
        shipping,
        total,
      })
      .select("id")
      .single();
    if (oErr) throw new Error(oErr.message);

    const { error: iErr } = await supabaseAdmin
      .from("order_items")
      .insert(rows.map((r) => ({ ...r, order_id: order.id })));
    if (iErr) throw new Error(iErr.message);

    // Decrement stock for items with finite stock
    for (const r of rows) {
      const p = productMap.get(r.product_id)!;
      if (p.stock !== null && p.stock !== undefined) {
        await supabaseAdmin
          .from("products")
          .update({ stock: Math.max(0, p.stock - r.qty) })
          .eq("id", p.id);
      }
    }

    return { id: order.id, total, subtotal, shipping };
  });

// ---------- Admin ----------

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

export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "confirmed", "paid", "shipped", "delivered", "cancelled"]),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase, context.userId);
    const { error } = await supabaseAdmin.from("orders").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });