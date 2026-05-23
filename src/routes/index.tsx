import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, ShieldCheck, Sparkles, Gem, Watch, ShoppingBag } from "lucide-react";
import catWatches from "@/assets/cat-watches.jpg";
import catJewelry from "@/assets/cat-jewelry.jpg";
import emotional from "@/assets/emotional-banner.jpg";
import { mapProduct } from "@/data/products";
import { listActiveProducts } from "@/lib/products.functions";
import { listActiveBanners } from "@/lib/banners.functions";
import { listSiteContent } from "@/lib/site-content.functions";
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

const siteContentQueryOptions = queryOptions({
  queryKey: ["site-content"],
  queryFn: () => listSiteContent(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rubí — Elegancia que trasciende" },
      { name: "description", content: "Relojería y joyería premium. Piezas seleccionadas para celebrar los momentos importantes." },
      { property: "og:title", content: "Rubí — Elegancia que trasciende" },
      { property: "og:description", content: "Relojería y joyería premium en Colombia." },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(bannersQueryOptions);
    context.queryClient.ensureQueryData(siteContentQueryOptions);
    return context.queryClient.ensureQueryData(productsQueryOptions);
  },
  component: Home,
});

function Home() {
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  const { data: banners } = useSuspenseQuery(bannersQueryOptions);
  const { data: content } = useSuspenseQuery(siteContentQueryOptions);
  const featured = products.slice(0, 4);
  const pillars = content.home_pillars?.items ?? [];
  const emo = content.home_emotional ?? {};
  const benefits = content.home_benefits?.items ?? [];
  const featuredSec = content.home_featured ?? {};
  const catsSec = content.home_categories_section ?? {};
  return (
    <div>
      {/* Hero carrusel administrable */}
      <HeroCarousel banners={banners} />

      {/* Pilares de marca */}
      <section className="bg-wine text-background">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-6 py-10 md:grid-cols-4 md:gap-0 md:px-10 md:py-8">
          {pillars.map((p: any, i: number) => (
            <Pillar key={i} icon={renderIcon(p.icon, "gold")} title={p.title} text={p.text} />
          ))}
        </div>
      </section>

      {/* Categorías */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <div className="mb-14 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{catsSec.eyebrow || "Colecciones"}</p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">{catsSec.title || "Dos universos, una visión"}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <CategoryCard image={catWatches} title="Relojería" subtitle="Tiempo en su forma más pura" to="relojeria" />
          <CategoryCard image={catJewelry} title="Joyería" subtitle="La luz hecha materia" to="joyeria" />
        </div>
      </section>

      {/* Banner emocional */}
      <section className="relative h-[60vh] min-h-[460px] w-full overflow-hidden">
        <img src={emo.image || emotional} alt="" width={1920} height={1000} loading="lazy" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-foreground/45" />
        <div className="relative z-10 mx-auto flex h-full max-w-3xl flex-col items-center justify-center px-6 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-background/80">{emo.eyebrow || "El regalo perfecto"}</p>
          <h2 className="mt-5 font-serif text-3xl text-background md:text-5xl text-balance">
            {emo.title || "Cada pieza cuenta una historia. La tuya."}
          </h2>
          {emo.cta_label && (
            <a href={emo.cta_url || "/catalogo"} className="mt-8 text-[11px] uppercase tracking-[0.28em] text-background underline-offset-8 hover:underline">
              {emo.cta_label}
            </a>
          )}
        </div>
      </section>

      {/* Destacados */}
      <section className="mx-auto max-w-7xl px-6 py-24 md:px-10 md:py-32">
        <div className="mb-14 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{featuredSec.eyebrow || "Selección Rubí"}</p>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl">{featuredSec.title || "Piezas destacadas"}</h2>
          </div>
          <a href={featuredSec.cta_url || "/catalogo"} className="hidden text-[11px] uppercase tracking-[0.25em] text-foreground/80 hover:text-wine md:block">
            {featuredSec.cta_label || "Ver toda la colección →"}
          </a>
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
          {benefits.map((b: any, i: number) => (
            <Benefit key={i} icon={renderIcon(b.icon, "wine")} title={b.title} text={b.text} />
          ))}
        </div>
      </section>
    </div>
  );
}

function renderIcon(name: string, _tone: string) {
  const cls = "h-7 w-7";
  switch (name) {
    case "watch": return <Watch strokeWidth={1.3} className={cls} />;
    case "gem": return <Gem strokeWidth={1.3} className={cls} />;
    case "shield": return <ShieldCheck strokeWidth={1.3} className={cls} />;
    case "bag": return <ShoppingBag strokeWidth={1.3} className={cls} />;
    case "sparkles": return <Sparkles strokeWidth={1.3} className={cls} />;
    default: return <Sparkles strokeWidth={1.3} className={cls} />;
  }
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
