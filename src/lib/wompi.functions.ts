import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { applyPromotions, type ActivePromotion } from "./promotions.functions";

const inputSchema = z.object({
  customer_name: z.string().min(1).max(255),
  customer_email: z.string().email().max(255),
  customer_phone: z.string().min(3).max(40),
  city: z.string().min(1).max(120),
  address: z.string().min(1).max(500),
  notes: z.string().max(1000).optional().default(""),
  user_id: z.string().uuid().optional().nullable(),
  coupon_code: z.string().max(64).optional().default(""),
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

export const createWompiCheckout = createServerFn({ method: "POST" })
  .inputValidator((input) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const publicKey = process.env.WOMPI_PUBLIC_KEY;
    const integrity = process.env.WOMPI_INTEGRITY_SECRET;
    if (!publicKey || !integrity) {
      throw new Error("Wompi no está configurado");
    }

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

    // Apply coupon if provided
    let discount = 0;
    let appliedCode = "";
    const rawCode = (data.coupon_code ?? "").trim();
    if (rawCode) {
      const { data: cRows, error: cErr } = await supabaseAdmin.rpc("validate_coupon", {
        _code: rawCode,
        _subtotal: subtotal,
      });
      if (cErr) throw new Error(cErr.message);
      const c = Array.isArray(cRows) ? cRows[0] : cRows;
      if (!c || !c.valid) throw new Error(c?.reason || "Cupón inválido");
      discount = Number(c.discount ?? 0);
      appliedCode = String(c.code);
    }
    const total = Math.max(0, subtotal + shipping - discount);
    const amountInCents = total * 100;
    const currency = "COP";

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
        payment_method: "wompi",
        coupon_code: appliedCode,
        discount,
      })
      .select("id")
      .single();
    if (oErr) throw new Error(oErr.message);

    const reference = `RUBI-${order.id}`;

    const { error: iErr } = await supabaseAdmin
      .from("order_items")
      .insert(rows.map((r) => ({ ...r, order_id: order.id })));
    if (iErr) throw new Error(iErr.message);

    await supabaseAdmin
      .from("orders")
      .update({ wompi_reference: reference, payment_reference: reference })
      .eq("id", order.id);

    // Increment coupon usage
    if (appliedCode) {
      const { data: cur } = await supabaseAdmin
        .from("coupons").select("used_count").eq("code", appliedCode).maybeSingle();
      if (cur) {
        await supabaseAdmin
          .from("coupons")
          .update({ used_count: (cur.used_count ?? 0) + 1 })
          .eq("code", appliedCode);
      }
    }

    // Decrement stock
    for (const r of rows) {
      const p = productMap.get(r.product_id)!;
      if (p.stock !== null && p.stock !== undefined) {
        await supabaseAdmin
          .from("products")
          .update({ stock: Math.max(0, p.stock - r.qty) })
          .eq("id", p.id);
      }
    }

    const signature = createHash("sha256")
      .update(`${reference}${amountInCents}${currency}${integrity}`)
      .digest("hex");

    return {
      orderId: order.id,
      reference,
      amountInCents,
      currency,
      publicKey,
      signature,
    };
  });

export const getOrderPaymentStatus = createServerFn({ method: "GET" })
  .inputValidator((input) => z.object({ reference: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id,status,total,wompi_reference,wompi_transaction_id,customer_email,customer_name")
      .eq("wompi_reference", data.reference)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) return null;
    return order;
  });

export const retryWompiPayment = createServerFn({ method: "POST" })
  .inputValidator((input) => z.object({ reference: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const publicKey = process.env.WOMPI_PUBLIC_KEY;
    const integrity = process.env.WOMPI_INTEGRITY_SECRET;
    if (!publicKey || !integrity) throw new Error("Wompi no está configurado");

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select("id,total,status,wompi_reference")
      .eq("wompi_reference", data.reference)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!order) throw new Error("Pedido no encontrado");
    if (order.status === "paid" || order.status === "shipped" || order.status === "delivered") {
      throw new Error("Este pedido ya fue pagado");
    }

    const amountInCents = Number(order.total) * 100;
    const currency = "COP";
    const signature = createHash("sha256")
      .update(`${order.wompi_reference}${amountInCents}${currency}${integrity}`)
      .digest("hex");

    return {
      reference: order.wompi_reference,
      amountInCents,
      currency,
      publicKey,
      signature,
    };
  });

export const getWompiEnvironment = createServerFn({ method: "GET" }).handler(async () => {
  const publicKey = process.env.WOMPI_PUBLIC_KEY ?? "";
  const isSandbox = publicKey.startsWith("pub_test_") || publicKey.startsWith("pub_stagtest_");
  const isProd = publicKey.startsWith("pub_prod_");
  return {
    environment: isSandbox ? "sandbox" : isProd ? "production" : "unknown",
    configured: publicKey.length > 0,
  } as const;
});