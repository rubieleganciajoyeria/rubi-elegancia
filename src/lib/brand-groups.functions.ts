import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type BrandGroup = {
  id: string;
  slug: string;
  name: string;
  sort_order: number;
  is_active: boolean;
};

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

export const listActiveBrandGroups = createServerFn({ method: "GET" }).handler(async () => {
  const { data, error } = await supabaseAdmin
    .from("brand_groups")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) throw new Error(error.message);
  return data as BrandGroup[];
});

export const adminListBrandGroups = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("brand_groups")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw new Error(error.message);
    return data as BrandGroup[];
  });

const brandGroupSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "slug inválido"),
  name: z.string().min(1).max(120),
  sort_order: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export const upsertBrandGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => brandGroupSchema.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);

    if (data.id) {
      const { error } = await supabaseAdmin
        .from("brand_groups")
        .update({
          slug: data.slug,
          name: data.name,
          sort_order: data.sort_order,
          is_active: data.is_active,
        })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("brand_groups").insert({
        slug: data.slug,
        name: data.name,
        sort_order: data.sort_order,
        is_active: data.is_active,
      });
      if (error) {
        if (error.code === "23505") throw new Error("Ya existe un grupo con ese slug.");
        throw new Error(error.message);
      }
    }
    return { ok: true };
  });

export const deleteBrandGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("brand_groups").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
