import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { BRANDS } from "@/data/brands";

const BRANDS_KEY = "brands";

export type BrandCategory = "swiss" | "fashion" | "jewelry";

export type ManagedBrand = {
  slug: string;
  name: string;
  category: BrandCategory;
  history: string;
  logoText: string;
  logoSubtext: string;
  is_active: boolean;
  sort_order: number;
};

function fallbackBrands(): ManagedBrand[] {
  return BRANDS.map((brand, index) => ({
    slug: brand.slug,
    name: brand.name,
    category: brand.category,
    history: brand.history,
    logoText: brand.logoText,
    logoSubtext: brand.logoSubtext ?? "",
    is_active: true,
    sort_order: index,
  }));
}

function normalizeBrands(value: unknown): ManagedBrand[] | null {
  if (!Array.isArray(value)) return null;
  return value
    .map((brand, index) => {
      if (!brand || typeof brand !== "object") return null;
      const row = brand as Partial<ManagedBrand>;
      if (!row.slug || !row.name || !row.category) return null;
      if (!["swiss", "fashion", "jewelry"].includes(row.category)) return null;
      return {
        slug: row.slug,
        name: row.name,
        category: row.category,
        history: row.history ?? "",
        logoText: row.logoText ?? row.name.toUpperCase(),
        logoSubtext: row.logoSubtext ?? "",
        is_active: row.is_active ?? true,
        sort_order: row.sort_order ?? index,
      } satisfies ManagedBrand;
    })
    .filter((brand): brand is ManagedBrand => brand !== null)
    .sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name, "es"));
}

async function loadBrands() {
  const { data, error } = await supabaseAdmin
    .from("site_content")
    .select("data")
    .eq("key", BRANDS_KEY)
    .maybeSingle();
  if (error) throw new Error(error.message);

  const stored = normalizeBrands(data?.data);
  return stored ?? fallbackBrands();
}

async function saveBrands(brands: ManagedBrand[]) {
  const { error } = await supabaseAdmin
    .from("site_content")
    .upsert({ key: BRANDS_KEY, data: brands }, { onConflict: "key" });
  if (error) throw new Error(error.message);
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

const brandSchema = z.object({
  original_slug: z.string().min(1).max(120).optional(),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "slug inválido"),
  name: z.string().min(1).max(120),
  category: z.enum(["swiss", "fashion", "jewelry"]),
  history: z.string().max(4000).default(""),
  logoText: z.string().min(1).max(120),
  logoSubtext: z.string().max(160).default(""),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export const listActiveBrands = createServerFn({ method: "GET" }).handler(async () => {
  return (await loadBrands()).filter((brand) => brand.is_active);
});

export const getBrandBySlug = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) => z.object({ slug: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data }) => {
    return (
      (await loadBrands()).find((brand) => brand.is_active && brand.slug === data.slug) ?? null
    );
  });

export const adminListBrands = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    return loadBrands();
  });

export const upsertBrand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => brandSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const brands = await loadBrands();
    const originalSlug = data.original_slug ?? data.slug;
    const existing = brands.find((brand) => brand.slug === originalSlug);
    const duplicate = brands.find(
      (brand) => brand.slug === data.slug && brand.slug !== originalSlug,
    );
    if (duplicate) throw new Error("Ya existe una marca con ese slug.");

    const nextBrand: ManagedBrand = {
      slug: data.slug,
      name: data.name,
      category: data.category,
      history: data.history,
      logoText: data.logoText,
      logoSubtext: data.logoSubtext,
      is_active: data.is_active,
      sort_order: data.sort_order,
    };

    const next = existing
      ? brands.map((brand) => (brand.slug === originalSlug ? nextBrand : brand))
      : [...brands, nextBrand];
    await saveBrands(next);

    if (existing && existing.name !== data.name) {
      const { error } = await supabaseAdmin
        .from("products")
        .update({ brand: data.name })
        .eq("brand", existing.name);
      if (error) throw new Error(error.message);
    }

    return { slug: data.slug };
  });

export const deleteBrand = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ slug: z.string().min(1).max(120) }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const brands = await loadBrands();
    const brand = brands.find((item) => item.slug === data.slug);
    if (!brand) return { ok: true };

    const { count, error: countError } = await supabaseAdmin
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("brand", brand.name);
    if (countError) throw new Error(countError.message);
    if ((count ?? 0) > 0) {
      throw new Error(`No se puede eliminar: hay ${count} producto(s) asociados a ${brand.name}.`);
    }

    await saveBrands(brands.filter((item) => item.slug !== data.slug));
    return { ok: true };
  });
