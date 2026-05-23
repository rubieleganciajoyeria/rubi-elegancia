import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { applyPromotions, type ActivePromotion } from "./promotions.functions";

async function fetchActivePromotions(): Promise<ActivePromotion[]> {
  const nowIso = new Date().toISOString();
  const [{ data, error }, { data: settings }] = await Promise.all([
    supabaseAdmin
      .from("promotions")
      .select("id,name,kind,value,ends_at,product_id,priority")
      .eq("is_active", true)
      .lte("starts_at", nowIso)
      .or(`ends_at.is.null,ends_at.gt.${nowIso}`)
      .order("priority", { ascending: false }),
    supabaseAdmin.from("site_content").select("data").eq("key", "global_settings").maybeSingle(),
  ]);
  if (error) throw new Error(error.message);
  const list = (data ?? []) as ActivePromotion[];
  const g: any = settings?.data ?? {};
  if (g.global_discount_active && Number(g.global_discount_percent) > 0) {
    list.push({
      id: "__global__",
      name: "Descuento global",
      kind: "percent",
      value: Math.min(99, Number(g.global_discount_percent)),
      ends_at: null,
      product_id: null,
      priority: -1,
    });
  }
  return list;
}

// --------- Public reads (no auth, uses admin client server-side) ---------

export const listActiveProducts = createServerFn({ method: "GET" }).handler(
  async () => {
    const [{ data, error }, promos] = await Promise.all([
      supabaseAdmin
        .from("products")
        .select("*, product_images(id,url,alt,sort_order,is_primary)")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("sort_order", { foreignTable: "product_images", ascending: true }),
      fetchActivePromotions(),
    ]);
    if (error) throw new Error(error.message);
    return (data ?? []).map((row) => ({
      ...row,
      discount_price: applyPromotions(row.price, row.discount_price, row.id, promos),
    }));
  },
);

export const getProductBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string().min(1).max(120) }).parse(input),
  )
  .handler(async ({ data }) => {
    const [{ data: row, error }, promos] = await Promise.all([
      supabaseAdmin
        .from("products")
        .select("*, product_images(id,url,alt,sort_order,is_primary)")
        .eq("slug", data.slug)
        .eq("is_active", true)
        .order("sort_order", { foreignTable: "product_images", ascending: true })
        .maybeSingle(),
      fetchActivePromotions(),
    ]);
    if (error) throw new Error(error.message);
    if (!row) return null;
    return {
      ...row,
      discount_price: applyPromotions(row.price, row.discount_price, row.id, promos),
    };
  });

// --------- Admin CRUD (auth + admin role required) ---------

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

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*, product_images(id,url,alt,sort_order,is_primary)")
      .order("sort_order", { ascending: true })
      .order("sort_order", { foreignTable: "product_images", ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const productSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1).max(120).regex(/^[a-z0-9-]+$/, "slug: solo minúsculas, números y guiones"),
  name: z.string().min(1).max(200),
  category: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/, "category: slug inválido"),
  category_label: z.string().min(1).max(60),
  brand: z.string().min(1).max(120),
  material: z.string().min(1).max(200),
  price: z.number().int().nonnegative().max(2_000_000_000),
  discount_price: z.number().int().nonnegative().max(2_000_000_000).nullable().optional(),
  image: z.string().min(1).max(500),
  gallery: z.array(z.string().min(1).max(500)).max(10).default([]),
  description: z.string().max(4000).default(""),
  warranty: z.string().max(200).default(""),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
  stock: z.number().int().min(0).max(1_000_000).nullable().optional(),
});

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => productSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const payload = {
      ...data,
      discount_price: data.discount_price ?? null,
      stock: data.stock ?? null,
    };
    if (data.id) {
      const { error } = await supabaseAdmin
        .from("products")
        .update(payload)
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    } else {
      const { data: row, error } = await supabaseAdmin
        .from("products")
        .insert(payload)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      return { id: row.id };
    }
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// --------- Product images (ordered) ---------

const imagesSchema = z.object({
  product_id: z.string().uuid(),
  images: z
    .array(
      z.object({
        url: z.string().min(1).max(500),
        alt: z.string().max(200).default(""),
      }),
    )
    .max(20),
});

export const replaceProductImages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => imagesSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error: delErr } = await supabaseAdmin
      .from("product_images")
      .delete()
      .eq("product_id", data.product_id);
    if (delErr) throw new Error(delErr.message);
    if (data.images.length === 0) return { ok: true };
    const rows = data.images.map((img, idx) => ({
      product_id: data.product_id,
      url: img.url,
      alt: img.alt ?? "",
      sort_order: idx,
      is_primary: idx === 0,
    }));
    const { error } = await supabaseAdmin.from("product_images").insert(rows);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// --------- Whoami / role check ---------

export const getMyRole = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return {
      userId: context.userId,
      isAdmin: (data ?? []).some((r) => r.role === "admin"),
    };
  });