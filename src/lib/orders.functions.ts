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

export const adminGetMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.supabase, context.userId);
    const now = new Date();
    const since30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const since7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [ordersRes, productsRes, itemsRes] = await Promise.all([
      supabaseAdmin
        .from("orders")
        .select("id,status,total,created_at")
        .order("created_at", { ascending: false })
        .limit(1000),
      supabaseAdmin.from("products").select("id,name,stock,is_active"),
      supabaseAdmin
        .from("order_items")
        .select("product_id,product_name,qty,subtotal,created_at")
        .gte("created_at", since30)
        .limit(2000),
    ]);
    if (ordersRes.error) throw new Error(ordersRes.error.message);
    if (productsRes.error) throw new Error(productsRes.error.message);
    if (itemsRes.error) throw new Error(itemsRes.error.message);

    const orders = ordersRes.data ?? [];
    const products = productsRes.data ?? [];
    const items = itemsRes.data ?? [];

    const paidOrCompleted = (s: string) =>
      s === "paid" || s === "shipped" || s === "delivered" || s === "confirmed";

    const totalRevenue = orders
      .filter((o) => paidOrCompleted(o.status))
      .reduce((s, o) => s + Number(o.total ?? 0), 0);
    const revenue30 = orders
      .filter((o) => paidOrCompleted(o.status) && o.created_at >= since30)
      .reduce((s, o) => s + Number(o.total ?? 0), 0);
    const revenue7 = orders
      .filter((o) => paidOrCompleted(o.status) && o.created_at >= since7)
      .reduce((s, o) => s + Number(o.total ?? 0), 0);

    const ordersByStatus = orders.reduce<Record<string, number>>((acc, o) => {
      acc[o.status] = (acc[o.status] ?? 0) + 1;
      return acc;
    }, {});

    // Daily revenue (last 14 days)
    const days: { date: string; revenue: number; orders: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      days.push({ date: key, revenue: 0, orders: 0 });
    }
    const dayIdx = new Map(days.map((d, i) => [d.date, i]));
    for (const o of orders) {
      const key = String(o.created_at).slice(0, 10);
      const i = dayIdx.get(key);
      if (i === undefined) continue;
      days[i].orders += 1;
      if (paidOrCompleted(o.status)) days[i].revenue += Number(o.total ?? 0);
    }

    // Top products (last 30d, by qty)
    const byProduct = new Map<string, { name: string; qty: number; revenue: number }>();
    for (const it of items) {
      const key = it.product_id ?? it.product_name;
      const cur = byProduct.get(key) ?? { name: it.product_name, qty: 0, revenue: 0 };
      cur.qty += Number(it.qty ?? 0);
      cur.revenue += Number(it.subtotal ?? 0);
      byProduct.set(key, cur);
    }
    const topProducts = Array.from(byProduct.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const lowStock = products
      .filter((p) => p.is_active && typeof p.stock === "number" && (p.stock ?? 0) <= 3)
      .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0))
      .slice(0, 10);

    return {
      totals: {
        revenueAll: totalRevenue,
        revenue30,
        revenue7,
        ordersAll: orders.length,
        pending: ordersByStatus.pending ?? 0,
        activeProducts: products.filter((p) => p.is_active).length,
      },
      ordersByStatus,
      days,
      topProducts,
      lowStock,
    };
  });