import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck, Sparkles, Gem, Watch, ShoppingBag } from "lucide-react";
import catWatches from "@/assets/cat-watches.jpg";
import catJewelry from "@/assets/cat-jewelry.jpg";
import emotional from "@/assets/emotional-banner.jpg";
import { mapProduct } from "@/data/products";
import { listActiveProducts } from "@/lib/products.functions";
import { listActiveBanners } from "@/lib/banners.functions";
import { ProductCard } from "@/components/ProductCard";
import { HeroCarousel } from "@/components/HeroCarousel";

const productsQueryOptions = queryOptions({
  queryKey: ["products", "active"],
  queryFn: async () => (await listActiveProducts()).map(mapProduct),
});

const bannersQueryOptions = queryOptions({
  queryKey: ["banners", "active"],
  queryFn: () => listActiveBanners(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rubí — Elegancia que trasciende" },
      { name: "description", content: "Relojería y joyería premium. Piezas seleccionadas para celebrar los momentos importantes." },
      { property: "og:title", content: "Rubí — Elegancia que trasciende" },
      { property: "og:description", content: "Relojería y joyería premium en Colombia." },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(bannersQueryOptions);
    return context.queryClient.ensureQueryData(productsQueryOptions);
  },
  component: Home,
});

function Home() {
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  const { data: banners } = useSuspenseQuery(bannersQueryOptions);
  const featured = products.slice(0, 4);
  return (
    <div>
      {/* Hero carrusel administrable */}
      <HeroCarousel banners={banners} />

      {/* Pilares de marca */}
      <section className="bg-wine text-background">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-6 py-10 md:grid-cols-4 md:gap-0 md:px-10 md:py-8">
          <Pillar icon={<Watch strokeWidth={1.3} className="h-6 w-6" />} title="Relojería" text="Marcas que marcan tu tiempo." />
          <Pillar icon={<Gem strokeWidth={1.3} className="h-6 w-6" />} title="Joyería" text="Brillos que cuentan tu historia." />
          <Pillar icon={<ShieldCheck strokeWidth={1.3} className="h-6 w-6" />} title="Confianza" text="Productos originales, garantía y respaldo." />
          <Pillar icon={<ShoppingBag strokeWidth={1.3} className="h-6 w-6" />} title="Experiencia" text="Asesoría personalizada en cada detalle." />
        </div>
      </section>

      {/* Categorías */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Colecciones</p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">Dos universos, una visión</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <CategoryCard image={catWatches} title="Relojería" subtitle="Tiempo en su forma más pura" to="relojeria" />
          <CategoryCard image={catJewelry} title="Joyería" subtitle="La luz hecha materia" to="joyeria" />
        </div>
      </section>

      {/* Banner emocional */}
      <section className="relative h-[60vh] min-h-[460px] w-full overflow-hidden">
        <img src={emotional} alt="Pareja con joyería elegante" width={1920} height={1000} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-foreground/45" />
        <div className="relative z-10 mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-6 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-background/80">El regalo perfecto</p>
          <h2 className="mt-5 font-serif text-3xl text-background md:text-5xl text-balance">
            Cada pieza cuenta una historia. La tuya.
          </h2>
          <Link to="/catalogo" className="mt-8 text-[11px] uppercase tracking-[0.28em] text-background underline-offset-8 hover:underline">
            Descubrir piezas con descuento
          </Link>
        </div>
      </section>

      {/* Destacados */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <div className="mb-14 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Selección Rubí</p>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl">Piezas destacadas</h2>
          </div>
          <Link to="/catalogo" className="hidden text-[11px] uppercase tracking-[0.25em] text-foreground/80 hover:text-wine md:block">
            Ver toda la colección →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Beneficios */}
      <section className="border-y border-border/60 bg-secondary/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 md:grid-cols-3 md:px-10">
          <Benefit icon={<ShieldCheck strokeWidth={1.2} className="h-7 w-7" />} title="Confianza" text="Piezas certificadas. Atención dedicada en cada compra." />
          <Benefit icon={<Sparkles strokeWidth={1.2} className="h-7 w-7" />} title="Garantía" text="Hasta 5 años en relojería y joyería seleccionada." />
          <Benefit icon={<Gem strokeWidth={1.2} className="h-7 w-7" />} title="Experiencia personalizada" text="Asesoría exclusiva para encontrar la pieza ideal." />
        </div>
      </section>
    </div>
  );
}

function CategoryCard({ image, title, subtitle, to }: { image: string; title: string; subtitle: string; to: string }) {
  return (
    <Link to="/catalogo" search={{ cat: to } as never} className="group relative block aspect-[4/5] overflow-hidden md:aspect-[4/5]">
      <img src={image} alt={title} width={1200} height={1500} loading="lazy" className="h-full w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/55 via-transparent to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-8 md:p-12">
        <p className="text-[10px] uppercase tracking-[0.3em] text-background/80">{subtitle}</p>
        <h3 className="mt-3 font-serif text-4xl text-background md:text-5xl">{title}</h3>
        <span className="mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-background">
          Descubrir <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" strokeWidth={1.4} />
        </span>
      </div>
    </Link>
  );
}

function Benefit({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="text-wine">{icon}</div>
      <h4 className="mt-5 font-serif text-xl">{title}</h4>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}

function Pillar({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3 px-2 md:border-l md:border-gold/30 md:px-6 md:first:border-l-0">
      <div className="text-gold">{icon}</div>
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.25em] text-gold">{title}</p>
        <p className="mt-1 text-sm leading-snug text-background/85">{text}</p>
      </div>
    </div>
  );
}
