import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { listActiveProducts } from "@/lib/products.functions";
import { mapProduct } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";

const allProductsOpts = queryOptions({
  queryKey: ["products", "active"],
  queryFn: async () => (await listActiveProducts()).map(mapProduct),
});

export const Route = createFileRoute("/favoritos")({
  head: () => ({
    meta: [
      { title: "Favoritos — Rubí" },
      { name: "description", content: "Tus piezas guardadas en Rubí." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(allProductsOpts),
  notFoundComponent: () => null,
  errorComponent: ({ reset }) => (
    <div className="mx-auto max-w-xl px-6 py-32 text-center">
      <h1 className="font-serif text-2xl">No pudimos cargar tus favoritos</h1>
      <button onClick={reset} className="mt-6 text-sm uppercase tracking-[0.25em] text-wine">
        Reintentar
      </button>
    </div>
  ),
  component: FavoritosPage,
});

function FavoritosPage() {
  const { data: all } = useSuspenseQuery(allProductsOpts);
  const { ids } = useWishlist();
  const items = all.filter((p) => ids.includes(p.id));

  return (
    <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
      <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Tu selección</p>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl">Favoritos</h1>
      <div className="gold-divider mt-6" />

      {items.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-sm text-muted-foreground">Aún no has guardado piezas.</p>
          <Link
            to="/catalogo"
            className="mt-8 inline-block bg-wine px-8 py-4 text-[11px] uppercase tracking-[0.25em] text-primary-foreground hover:opacity-90"
          >
            Explorar catálogo
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}