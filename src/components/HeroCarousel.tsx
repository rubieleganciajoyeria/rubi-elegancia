import { useEffect, useState, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

export type Banner = {
  id: string;
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta_label: string;
  cta_url: string;
  align: string;
};

export function HeroCarousel({ banners }: { banners: Banner[] }) {
  const [emblaRef, embla] = useEmblaCarousel({ loop: true, align: "start" });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!embla) return;
    const onSelect = () => setSelected(embla.selectedScrollSnap());
    embla.on("select", onSelect);
    onSelect();
  }, [embla]);

  useEffect(() => {
    if (!embla || banners.length <= 1) return;
    const id = setInterval(() => embla.scrollNext(), 6000);
    return () => clearInterval(id);
  }, [embla, banners.length]);

  const scrollTo = useCallback((i: number) => embla?.scrollTo(i), [embla]);

  if (banners.length === 0) return null;

  return (
    <section className="relative w-full">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {banners.map((b) => (
            <div key={b.id} className="relative h-[64vh] min-h-[460px] w-full flex-[0_0_100%]">
              <img
                src={b.image}
                alt={b.title || b.eyebrow || "Banner"}
                width={1920}
                height={1080}
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/65 via-foreground/20 to-transparent" />
              <div
                className={`relative z-10 mx-auto flex h-full max-w-7xl flex-col px-6 pb-20 md:px-10 md:pb-28 ${
                  b.align === "center"
                    ? "items-center justify-end text-center"
                    : b.align === "right"
                      ? "items-end justify-end text-right"
                      : "items-start justify-end"
                }`}
              >
                {b.eyebrow && (
                  <p className="text-xs uppercase tracking-[0.35em] text-background/80 animate-fade-in">
                    {b.eyebrow}
                  </p>
                )}
                {b.title && (
                  <h1 className="mt-6 max-w-3xl font-serif text-5xl leading-[1.05] text-background text-balance md:text-7xl lg:text-[5.5rem] animate-fade-in">
                    {b.title}
                  </h1>
                )}
                {b.subtitle && (
                  <p className="mt-6 max-w-md text-sm leading-relaxed text-background/85 md:text-base animate-fade-in">
                    {b.subtitle}
                  </p>
                )}
                {b.cta_label && b.cta_url && (
                  <a
                    href={b.cta_url}
                    className="group mt-10 inline-flex items-center gap-3 border border-background/70 px-8 py-4 text-[11px] uppercase tracking-[0.28em] text-background transition-all hover:bg-background hover:text-foreground animate-fade-in"
                  >
                    {b.cta_label}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" strokeWidth={1.4} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={() => embla?.scrollPrev()}
            aria-label="Anterior"
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-background/40 bg-foreground/20 p-3 text-background backdrop-blur transition hover:bg-background hover:text-foreground md:left-8"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.4} />
          </button>
          <button
            onClick={() => embla?.scrollNext()}
            aria-label="Siguiente"
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-background/40 bg-foreground/20 p-3 text-background backdrop-blur transition hover:bg-background hover:text-foreground md:right-8"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.4} />
          </button>
          <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollTo(i)}
                aria-label={`Ir al banner ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  selected === i ? "w-8 bg-background" : "w-4 bg-background/50 hover:bg-background/80"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}