import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BRANDS } from "@/data/brands";
import { mapProduct } from "@/data/products";
import { listActiveProducts } from "@/lib/products.functions";
import { ProductCard } from "@/components/ProductCard";
import { ArrowLeft, Sparkles, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/marca/$slug")({
  head: ({ params }) => {
    const brand = BRANDS.find((b) => b.slug === params.slug);
    return {
      meta: [
        { title: brand ? `${brand.name} — Historia y Colección` : "Marca — Rubí" },
        {
          name: "description",
          content: brand
            ? `Descubre la historia de ${brand.name} y su selecta colección disponible en Rubí Relojería & Joyería.`
            : "Descubre nuestras marcas de lujo.",
        },
      ],
    };
  },
  component: BrandDetailPage,
});

function BrandDetailPage() {
  const { slug } = Route.useParams();
  const brand = BRANDS.find((b) => b.slug === slug);

  // Fetch active products
  const productsQ = useQuery({
    queryKey: ["products", "active"],
    queryFn: async () => (await listActiveProducts()).map(mapProduct),
  });

  if (!brand) {
    return (
      <div className="mx-auto max-w-xl px-6 py-32 text-center">
        <h1 className="font-serif text-3xl">Marca no encontrada</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Lo sentimos, la marca solicitada no forma parte de nuestro catálogo.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block bg-wine px-8 py-4 text-[11px] uppercase tracking-[0.25em] text-primary-foreground hover:opacity-90"
        >
          Volver al Inicio
        </Link>
      </div>
    );
  }

  // Filter products by brand (case-insensitive)
  const brandProducts = (productsQ.data ?? []).filter(
    (p) => p.brand.toLowerCase() === brand.name.toLowerCase()
  );

  return (
    <div className="bg-background">
      {/* Cabecera / Banner Minimalista */}
      <section className="border-b border-border/40 bg-secondary/15 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-wine"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Volver al Inicio
          </Link>

          <div className="mt-10 flex flex-col items-center text-center">
            {/* Logo de Marca Estilizado Premium */}
            <div className="border border-foreground/15 bg-background px-10 py-6 text-center shadow-sm">
              <span className="font-serif text-3xl tracking-[0.2em] text-foreground md:text-4xl block uppercase font-light">
                {brand.logoText}
              </span>
              {brand.logoSubtext && (
                <span className="mt-2 block text-[9px] uppercase tracking-[0.3em] text-muted-foreground/80 font-medium">
                  {brand.logoSubtext}
                </span>
              )}
            </div>

            <p className="mt-8 text-xs uppercase tracking-[0.25em] text-wine font-medium">
              {brand.category === "swiss"
                ? "Relojería Suiza de Alta Gama"
                : brand.category === "fashion"
                  ? "Marcas de Moda de Diseñador"
                  : "Alta Joyería Exclusiva"}
            </p>
          </div>
        </div>
      </section>

      {/* Sección de Historia de la Marca */}
      <section className="mx-auto max-w-4xl px-6 py-20 md:px-10 md:py-28">
        <div className="text-center">
          <Sparkles className="mx-auto h-5 w-5 text-wine/70" strokeWidth={1.3} />
          <h2 className="mt-4 font-serif text-3xl md:text-4xl">Nuestra Historia</h2>
          <div className="gold-divider mx-auto my-6 max-w-[80px]" />
        </div>
        <div className="mt-8 text-center text-base leading-relaxed text-foreground/80 font-light max-w-2xl mx-auto space-y-6">
          <p className="first-letter:text-5xl first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:text-wine first-letter:font-normal">
            {brand.history}
          </p>
        </div>
      </section>

      {/* Separador */}
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="gold-divider" />
      </div>

      {/* Sección de Productos de la Marca */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:px-10 md:py-28">
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">La Colección</p>
          <h2 className="mt-4 font-serif text-4xl">{brand.name} en Rubí</h2>
        </div>

        {productsQ.isLoading ? (
          <p className="text-center text-sm text-muted-foreground py-10">Cargando piezas de la colección…</p>
        ) : brandProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
            {brandProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="mx-auto max-w-2xl border border-border/80 bg-secondary/10 p-8 text-center md:p-12">
            <h3 className="font-serif text-xl">Disponible en nuestra Boutique</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground font-light">
              Actualmente, las piezas exclusivas de la colección de <strong>{brand.name}</strong> se gestionan de manera personalizada en nuestra boutique física para garantizar la mejor asesoría técnica.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground font-light">
              Contáctanos directamente para consultar disponibilidad, precios o programar una cita con un asesor.
            </p>
            
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="https://wa.me/573123456789?text=Hola%20Rubí,%20me%20gustaría%20consultar%20disponibilidad%20de%20la%20marca%20"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-wine px-6 py-3.5 text-[10px] uppercase tracking-[0.25em] text-primary-foreground hover:opacity-90 transition-opacity font-medium"
              >
                <Phone className="h-4 w-4" strokeWidth={1.4} /> Contactar por WhatsApp
              </a>
              <Link
                to="/catalogo"
                className="inline-flex items-center gap-2 border border-foreground/30 px-6 py-3.5 text-[10px] uppercase tracking-[0.25em] hover:border-wine hover:text-wine transition-colors font-medium"
              >
                Ver Catálogo Completo
              </Link>
            </div>

            <div className="mt-6 flex justify-center items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-wine" /> Rubí Joyería & Relojería
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
