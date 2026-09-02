import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import {
  ShieldCheck,
  Truck,
  RefreshCcw,
  ShoppingBag,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { formatCOP, mapProduct, type Product } from "@/data/products";
import { getProductBySlug, listActiveProducts } from "@/lib/products.functions";
import { ProductCard } from "@/components/ProductCard";
import { ProductReviews } from "@/components/ProductReviews";
import { ProductName } from "@/components/ProductName";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { getGlobalSettings } from "@/lib/site-content.functions";

const productQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: async () => {
      const row = await getProductBySlug({ data: { slug } });
      return row ? mapProduct(row) : null;
    },
  });

const relatedQueryOptions = queryOptions({
  queryKey: ["products", "active"],
  queryFn: async () => (await listActiveProducts()).map(mapProduct),
});

const globalSettingsQueryOptions = queryOptions({
  queryKey: ["global-settings"],
  queryFn: () => getGlobalSettings(),
});

export const Route = createFileRoute("/producto/$slug")({
  loader: async ({ params, context }) => {
    const product = await context.queryClient.ensureQueryData(productQueryOptions(params.slug));
    if (!product) throw notFound();
    context.queryClient.ensureQueryData(relatedQueryOptions);
    context.queryClient.ensureQueryData(globalSettingsQueryOptions);
    return { product };
  },
  head: ({ params, loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.product.name} — Rubí Relojería & Joyería` },
          {
            name: "description",
            content: `${loaderData.product.description} Disponible en Rubí Relojería & Joyería Colombia.`,
          },
          { name: "robots", content: "index, follow" },
          { property: "og:title", content: `${loaderData.product.name} | Rubí` },
          { property: "og:description", content: loaderData.product.description },
          { property: "og:image", content: loaderData.product.image },
          { property: "og:image:alt", content: loaderData.product.name },
          { property: "og:type", content: "product" },
          { property: "og:url", content: `https://rubi-joyeria.com/producto/${params.slug}` },
          { property: "og:locale", content: "es_CO" },
          { property: "og:site_name", content: "Rubí Relojería & Joyería" },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "twitter:title", content: `${loaderData.product.name} | Rubí` },
          { name: "twitter:description", content: loaderData.product.description },
          { name: "twitter:image", content: loaderData.product.image },
        ]
      : [],
    links: [{ rel: "canonical", href: `https://rubi-joyeria.com/producto/${params.slug}` }],
    scripts: loaderData
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: loaderData.product.name,
              description: loaderData.product.description,
              image: loaderData.product.image,
              brand: loaderData.product.brand,
              offers: {
                "@type": "Offer",
                price: loaderData.product.price,
                priceCurrency: "COP",
                availability: "https://schema.org/InStock",
              },
            }),
          },
        ]
      : [],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-6 py-32 text-center">
      <h1 className="font-serif text-3xl">Pieza no encontrada</h1>
      <Link
        to="/catalogo"
        className="mt-6 inline-block text-sm uppercase tracking-[0.25em] text-wine"
      >
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
  const { slug } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQueryOptions(slug));
  const { data: all } = useSuspenseQuery(relatedQueryOptions);
  const { data: settings } = useSuspenseQuery(globalSettingsQueryOptions);
  if (!product) throw notFound();
  const [active, setActive] = useState(0);
  const [qty, setQtyLocal] = useState(1);
  const { add, setOpen } = useCart();
  const navigate = useNavigate();
  const { has, toggle } = useWishlist();
  const fav = has(product.id);
  const hasDiscount = !!product.discountPrice;
  const soldOut = product.stock !== null && product.stock <= 0;
  const isPreorder = product.badge === "preorder";
  const cannotBuy = soldOut || isPreorder;
  const maxQty = product.stock ?? Infinity;
  const hasGalleryNavigation = product.gallery.length > 1;
  const showPreviousImage = () =>
    setActive((current) => (current === 0 ? product.gallery.length - 1 : current - 1));
  const showNextImage = () => setActive((current) => (current + 1) % product.gallery.length);
  const announcement = settings.announcement?.trim();
  const related: Product[] = all
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);
  const attributes = [
    ["Garantía", product.warranty],
    ["Marca", product.brand],
    ["Material", product.material],
    ["Color", product.color],
    ["Tipo de uso", product.usageType],
    ["Sexo", product.gender],
    ["Categoría", product.categoryLabel],
  ].filter(([, value]) => value);

  return (
    <div>
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-14 md:grid-cols-2 md:gap-16 md:px-10 md:py-20">
        {/* Galería */}
        <div>
          <div className="group relative aspect-[4/5] overflow-hidden bg-secondary">
            <img
              src={product.gallery[active]}
              alt={product.name}
              width={800}
              height={1000}
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
            />
            {hasGalleryNavigation && (
              <>
                <button
                  type="button"
                  onClick={showPreviousImage}
                  aria-label="Imagen anterior"
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-background/70 bg-background/75 text-foreground shadow-sm backdrop-blur-sm transition hover:bg-background md:opacity-0 md:group-hover:opacity-100"
                >
                  <ChevronLeft className="h-5 w-5" strokeWidth={1.4} />
                </button>
                <button
                  type="button"
                  onClick={showNextImage}
                  aria-label="Imagen siguiente"
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-background/70 bg-background/75 text-foreground shadow-sm backdrop-blur-sm transition hover:bg-background md:opacity-0 md:group-hover:opacity-100"
                >
                  <ChevronRight className="h-5 w-5" strokeWidth={1.4} />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-foreground/55 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-background backdrop-blur-sm">
                  {active + 1} / {product.gallery.length}
                </div>
              </>
            )}
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
                <img
                  src={img}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="md:pt-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
            {product.categoryLabel} · {product.brand}
          </p>
          <h1 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
            <ProductName name={product.name} referenceClassName="text-[0.9em]" />
          </h1>

          <div className="mt-6 flex items-baseline gap-3">
            {hasDiscount ? (
              <>
                <span className="font-serif text-3xl text-wine">
                  {formatCOP(product.discountPrice!)}
                </span>
                <span className="text-base text-muted-foreground line-through">
                  {formatCOP(product.price)}
                </span>
              </>
            ) : (
              <span className="font-serif text-3xl text-foreground">
                {formatCOP(product.price)}
              </span>
            )}
          </div>

          <p className="mt-8 leading-relaxed text-foreground/80">{product.description}</p>

          <dl className="mt-8 grid grid-cols-1 gap-x-10 gap-y-3 text-sm md:grid-cols-2">
            {attributes.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[110px_1fr] gap-x-2">
                <dt className="text-muted-foreground">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 flex items-center gap-3">
            <div className="flex items-center border border-foreground/30">
              <button
                onClick={() => setQtyLocal((q) => Math.max(1, q - 1))}
                disabled={cannotBuy}
                className="px-3 py-3 hover:text-wine disabled:opacity-40"
                aria-label="Restar"
              >
                −
              </button>
              <span className="min-w-[36px] text-center text-sm">{qty}</span>
              <button
                onClick={() => setQtyLocal((q) => Math.min(maxQty, q + 1))}
                disabled={cannotBuy}
                className="px-3 py-3 hover:text-wine disabled:opacity-40"
                aria-label="Sumar"
              >
                +
              </button>
            </div>
            <button
              onClick={() => add(product, qty)}
              disabled={cannotBuy}
              className="inline-flex flex-1 items-center justify-center gap-2 border border-foreground/30 px-8 py-4 text-[11px] uppercase tracking-[0.25em] text-foreground transition-colors hover:border-wine hover:text-wine disabled:opacity-40 disabled:hover:border-foreground/30 disabled:hover:text-foreground"
            >
              {isPreorder ? "Bajo pedido" : soldOut ? "Agotado" : "Agregar al carrito"}
            </button>
            <button
              aria-label={fav ? "Quitar de favoritos" : "Agregar a favoritos"}
              onClick={() => toggle(product.id)}
              className={`inline-flex items-center justify-center border p-4 transition-colors ${
                fav
                  ? "border-wine text-wine"
                  : "border-foreground/30 hover:border-wine hover:text-wine"
              }`}
            >
              <Heart className="h-4 w-4" strokeWidth={1.5} fill={fav ? "currentColor" : "none"} />
            </button>
          </div>
          <button
            onClick={() => {
              add(product, qty);
              setOpen(false);
              navigate({ to: "/checkout" });
            }}
            disabled={cannotBuy}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 bg-wine px-8 py-4 text-[11px] uppercase tracking-[0.25em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
            {isPreorder ? "Bajo pedido" : "Comprar ahora"}
          </button>
          {isPreorder && (
            <a
              href="https://wa.me/573157274270?text=Hola,%20me%20interesa%20este%20producto%20bajo%20pedido"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 border border-foreground/30 px-8 py-4 text-[11px] uppercase tracking-[0.25em] text-foreground transition-colors hover:border-wine hover:text-wine"
            >
              Consultar disponibilidad por WhatsApp
            </a>
          )}
          {announcement && (
            <p className="mt-3 border border-wine/20 bg-wine/5 px-4 py-3 text-center text-[11px] uppercase tracking-[0.18em] text-wine">
              {announcement}
            </p>
          )}
          {product.stock !== null && product.stock > 0 && product.stock <= 5 && (
            <p className="mt-3 text-xs text-wine">Solo quedan {product.stock} unidades</p>
          )}

          <div className="gold-divider mt-10" />

          <ul className="mt-8 grid grid-cols-1 gap-4 text-xs text-muted-foreground sm:grid-cols-3">
            <li className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-wine" strokeWidth={1.4} /> Envío seguro nacional
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-wine" strokeWidth={1.4} /> Pieza certificada
            </li>
            <li className="flex items-center gap-2">
              <RefreshCcw className="h-4 w-4 text-wine" strokeWidth={1.4} /> Devolución 15 días
            </li>
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

      <ProductReviews productId={product.id} />
    </div>
  );
}
