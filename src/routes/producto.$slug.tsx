import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Truck, RefreshCcw, ShoppingBag, Heart } from "lucide-react";
import { products, formatCOP, type Product } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/producto/$slug")({
  loader: ({ params }): { product: Product } => {
    const product = products.find((p) => p.slug === params.slug);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — Rubí` },
          { name: "description", content: loaderData.product.description },
          { property: "og:title", content: `${loaderData.product.name} — Rubí` },
          { property: "og:description", content: loaderData.product.description },
          { property: "og:image", content: loaderData.product.image },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-6 py-32 text-center">
      <h1 className="font-serif text-3xl">Pieza no encontrada</h1>
      <Link to="/catalogo" className="mt-6 inline-block text-sm uppercase tracking-[0.25em] text-wine">
        Volver al catálogo
      </Link>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="mx-auto max-w-xl px-6 py-32 text-center">
      <h1 className="font-serif text-2xl">No pudimos cargar esta pieza</h1>
      <button onClick={reset} className="mt-6 text-sm uppercase tracking-[0.25em] text-wine">
        Reintentar
      </button>
    </div>
  ),
  component: ProductDetail,
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const [active, setActive] = useState(0);
  const hasDiscount = !!product.discountPrice;
  const related = products.filter((p) => p.id !== product.id && p.category === product.category).slice(0, 3);

  return (
    <div>
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 md:grid-cols-2 md:gap-16 md:px-10 md:py-20">
        {/* Galería */}
        <div>
          <div className="aspect-[4/5] overflow-hidden bg-secondary">
            <img
              src={product.gallery[active]}
              alt={product.name}
              width={1000}
              height={1200}
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {product.gallery.map((img: string, i: number) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`aspect-square overflow-hidden bg-secondary transition-opacity ${
                  i === active ? "ring-1 ring-wine" : "opacity-70 hover:opacity-100"
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="md:pt-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            {product.categoryLabel} · {product.brand}
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">{product.name}</h1>

          <div className="mt-6 flex items-baseline gap-3">
            {hasDiscount ? (
              <>
                <span className="font-serif text-3xl text-wine">{formatCOP(product.discountPrice!)}</span>
                <span className="text-base text-muted-foreground line-through">{formatCOP(product.price)}</span>
              </>
            ) : (
              <span className="font-serif text-3xl text-foreground">{formatCOP(product.price)}</span>
            )}
          </div>

          <p className="mt-8 leading-relaxed text-foreground/80">{product.description}</p>

          <dl className="mt-8 grid grid-cols-1 gap-y-3 text-sm sm:grid-cols-[140px_1fr]">
            <dt className="text-muted-foreground">Material</dt>
            <dd>{product.material}</dd>
            <dt className="text-muted-foreground">Garantía</dt>
            <dd>{product.warranty}</dd>
            <dt className="text-muted-foreground">Marca</dt>
            <dd>{product.brand}</dd>
          </dl>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button className="inline-flex flex-1 items-center justify-center gap-2 bg-wine px-8 py-4 text-[11px] uppercase tracking-[0.25em] text-primary-foreground transition-opacity hover:opacity-90">
              <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
              Comprar ahora
            </button>
            <button className="inline-flex items-center justify-center gap-2 border border-foreground/30 px-8 py-4 text-[11px] uppercase tracking-[0.25em] text-foreground transition-colors hover:border-wine hover:text-wine">
              Agregar al carrito
            </button>
            <button aria-label="Favorito" className="inline-flex items-center justify-center border border-foreground/30 p-4 transition-colors hover:border-wine hover:text-wine">
              <Heart className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>

          <div className="gold-divider mt-10" />

          <ul className="mt-8 grid grid-cols-1 gap-4 text-xs text-muted-foreground sm:grid-cols-3">
            <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-wine" strokeWidth={1.4} /> Envío seguro nacional</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-wine" strokeWidth={1.4} /> Pieza certificada</li>
            <li className="flex items-center gap-2"><RefreshCcw className="h-4 w-4 text-wine" strokeWidth={1.4} /> Devolución 15 días</li>
          </ul>
        </div>
      </div>

      {/* Relacionados */}
      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 pb-24 md:px-10">
          <div className="gold-divider mb-14" />
          <h2 className="mb-10 font-serif text-3xl md:text-4xl">También te puede gustar</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}