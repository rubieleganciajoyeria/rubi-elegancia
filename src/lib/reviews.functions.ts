import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ProductReview = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string;
  body: string;
  created_at: string;
  author_name: string;
};

export const listProductReviews = createServerFn({ method: "GET" })
  .inputValidator((input) =>
    z.object({ productId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabaseAdmin
      .from("product_reviews")
      .select("id,product_id,user_id,rating,title,body,created_at")
      .eq("product_id", data.productId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    const ids = Array.from(new Set((rows ?? []).map((r) => r.user_id)));
    let names = new Map<string, string>();
    if (ids.length) {
      const { data: profs } = await supabaseAdmin
        .from("profiles")
        .select("id,full_name")
        .in("id", ids);
      names = new Map(
        (profs ?? []).map((p) => [p.id, (p.full_name ?? "").trim() || "Cliente"]),
      );
    }
    const list: ProductReview[] = (rows ?? []).map((r) => ({
      ...r,
      author_name: names.get(r.user_id) ?? "Cliente",
    }));
    const count = list.length;
    const average =
      count > 0 ? list.reduce((a, r) => a + r.rating, 0) / count : 0;
    return { reviews: list, count, average };
  });

export const submitProductReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        productId: z.string().uuid(),
        rating: z.number().int().min(1).max(5),
        title: z.string().max(120).default(""),
        body: z.string().max(2000).default(""),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin
      .from("product_reviews")
      .upsert(
        {
          product_id: data.productId,
          user_id: context.userId,
          rating: data.rating,
          title: data.title,
          body: data.body,
          is_approved: true,
        },
        { onConflict: "product_id,user_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteOwnReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ productId: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await supabaseAdmin
      .from("product_reviews")
      .delete()
      .eq("product_id", data.productId)
      .eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });