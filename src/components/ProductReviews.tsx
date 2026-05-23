import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import {
  listProductReviews,
  submitProductReview,
  deleteOwnReview,
} from "@/lib/reviews.functions";

function Stars({
  value,
  onChange,
  size = 18,
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: number;
}) {
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={onChange ? "transition-transform hover:scale-110" : "cursor-default"}
          aria-label={`${n} estrellas`}
        >
          <Star
            style={{ width: size, height: size }}
            strokeWidth={1.5}
            className={n <= value ? "fill-wine text-wine" : "text-muted-foreground"}
          />
        </button>
      ))}
    </div>
  );
}

export function ProductReviews({ productId }: { productId: string }) {
  const qc = useQueryClient();
  const listFn = useServerFn(listProductReviews);
  const submitFn = useServerFn(submitProductReview);
  const deleteFn = useServerFn(deleteOwnReview);
  const [userId, setUserId] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setUserId(s?.user?.id ?? null),
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["product-reviews", productId],
    queryFn: () => listFn({ data: { productId } }),
  });

  const submitMut = useMutation({
    mutationFn: () => submitFn({ data: { productId, rating, title, body } }),
    onSuccess: () => {
      toast.success("¡Gracias por tu reseña!");
      setTitle(""); setBody(""); setRating(5);
      qc.invalidateQueries({ queryKey: ["product-reviews", productId] });
    },
    onError: (e: any) => toast.error(e?.message ?? "No se pudo enviar"),
  });

  const deleteMut = useMutation({
    mutationFn: () => deleteFn({ data: { productId } }),
    onSuccess: () => {
      toast.success("Reseña eliminada");
      qc.invalidateQueries({ queryKey: ["product-reviews", productId] });
    },
  });

  const myReview = data?.reviews.find((r) => r.user_id === userId);

  return (
    <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
      <div className="gold-divider mb-14" />
      <h2 className="mb-2 font-serif text-3xl md:text-4xl">Reseñas</h2>
      {data && data.count > 0 ? (
        <div className="mb-10 flex items-center gap-3 text-sm text-muted-foreground">
          <Stars value={Math.round(data.average)} />
          <span>{data.average.toFixed(1)} · {data.count} reseña{data.count === 1 ? "" : "s"}</span>
        </div>
      ) : (
        <p className="mb-10 text-sm text-muted-foreground">Aún no hay reseñas. Sé el primero.</p>
      )}

      <div className="grid gap-12 md:grid-cols-[1fr_360px]">
        <ul className="space-y-8">
          {isLoading && <li className="text-sm text-muted-foreground">Cargando…</li>}
          {(data?.reviews ?? []).map((r) => (
            <li key={r.id} className="border-b border-foreground/10 pb-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <Stars value={r.rating} size={14} />
                  <p className="mt-1 text-sm font-medium">{r.title || r.author_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.author_name} · {new Date(r.created_at).toLocaleDateString("es-CO")}
                  </p>
                </div>
                {r.user_id === userId && (
                  <button
                    onClick={() => deleteMut.mutate()}
                    className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-wine"
                  >
                    Eliminar
                  </button>
                )}
              </div>
              {r.body && <p className="mt-3 text-sm leading-relaxed text-foreground/80">{r.body}</p>}
            </li>
          ))}
        </ul>

        <div className="border border-foreground/15 p-6">
          <h3 className="font-serif text-xl">
            {myReview ? "Actualizar tu reseña" : "Deja tu reseña"}
          </h3>
          {!userId ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Inicia sesión para escribir una reseña.
            </p>
          ) : (
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => { e.preventDefault(); submitMut.mutate(); }}
            >
              <div>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Tu calificación
                </label>
                <div className="mt-1"><Stars value={rating} onChange={setRating} /></div>
              </div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título (opcional)"
                maxLength={120}
                className="w-full border border-foreground/20 bg-background px-3 py-2 text-sm"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Comparte tu experiencia"
                rows={4}
                maxLength={2000}
                className="w-full border border-foreground/20 bg-background px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={submitMut.isPending}
                className="w-full bg-wine px-6 py-3 text-[11px] uppercase tracking-[0.25em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
              >
                {submitMut.isPending ? "Enviando…" : myReview ? "Actualizar" : "Publicar"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}