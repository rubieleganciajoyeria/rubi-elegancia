import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Sparkles, Gem } from "lucide-react";
import heroImg from "@/assets/hero-watch.jpg";
import catWatches from "@/assets/cat-watches.jpg";
import catJewelry from "@/assets/cat-jewelry.jpg";
import emotional from "@/assets/emotional-banner.jpg";
import { products } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Rubí — Elegancia que trasciende" },
      { name: "description", content: "Relojería y joyería premium. Piezas seleccionadas para celebrar los momentos importantes." },
      { property: "og:title", content: "Rubí — Elegancia que trasciende" },
      { property: "og:description", content: "Relojería y joyería premium en Colombia." },
    ],
  }),
  component: Home,
});

function Home() {
  const featured = products.slice(0, 4);
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[88vh] min-h-[640px] w-full overflow-hidden">
        <img
          src={heroImg}
          alt="Reloj dorado de lujo Rubí"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/15 to-transparent" />
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col items-start justify-end px-6 pb-20 md:px-10 md:pb-28">
          <p className="text-xs uppercase tracking-[0.35em] text-background/80 animate-fade-in">
            Rubí · Relojería & Joyería
          </p>
          <h1 className="mt-6 max-w-3xl font-serif text-5xl leading-[1.05] text-background text-balance md:text-7xl lg:text-[5.5rem] animate-fade-in">
            Elegancia que trasciende
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed text-background/85 md:text-base animate-fade-in">
            Piezas únicas seleccionadas a mano. El tiempo y la joya como testigos de los momentos que importan.
          </p>
          <Link
            to="/catalogo"
            className="group mt-10 inline-flex items-center gap-3 border border-background/70 px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-background transition-all hover:bg-background hover:text-foreground animate-fade-in"
          >
            Explorar colección
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.4} />
          </Link>
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
