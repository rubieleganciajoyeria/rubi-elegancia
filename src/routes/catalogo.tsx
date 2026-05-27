import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { mapProduct, type Product } from "@/data/products";
import { listActiveProducts } from "@/lib/products.functions";
import { listActiveCategories } from "@/lib/categories.functions";
import { ProductCard } from "@/components/ProductCard";
import { Search as SearchIcon, X } from "lucide-react";

const productsQueryOptions = queryOptions({
  queryKey: ["products", "active"],
  queryFn: async () => (await listActiveProducts()).map(mapProduct),
});

const categoriesQueryOptions = queryOptions({
  queryKey: ["categories", "active"],
  queryFn: async () => await listActiveCategories(),
});

type SortOpt = "relevance" | "price-asc" | "price-desc" | "name";
type Search = { cat?: string; q?: string; sort?: SortOpt };

const SORT_VALUES: SortOpt[] = ["relevance", "price-asc", "price-desc", "name"];

export const Route = createFileRoute("/catalogo")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    cat: typeof s.cat === "string" && /^[a-z0-9-]+$/.test(s.cat) ? s.cat : undefined,
    q: typeof s.q === "string" && s.q.length <= 100 ? s.q : undefined,
    sort:
      typeof s.sort === "string" && (SORT_VALUES as string[]).includes(s.sort)
        ? (s.sort as SortOpt)
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Catálogo de Relojes y Joyas | Rubí Relojería & Joyería" },
      { name: "description", content: "Explora nuestra colección completa de relojes suizos, joyas de oro, plata y piezas de moda. Todas las marcas: Rolex, Omega, Tissot, Pandora y más." },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Catálogo de Relojes y Joyas | Rubí" },
      { property: "og:description", content: "Explora nuestra colección completa de relojes suizos, joyas de oro, plata y piezas de moda premium." },
      { property: "og:url", content: "https://rubi-joyeria.com/catalogo" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "es_CO" },
      { property: "og:site_name", content: "Rubí Relojería & Joyería" },
    ],
    links: [{ rel: "canonical", href: "https://rubi-joyeria.com/catalogo" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Catálogo de Relojes y Joyas",
          url: "https://rubi-joyeria.com/catalogo",
          description: "Colección completa de relojes suizos y joyas de lujo disponibles en Rubí.",
          publisher: {
            "@type": "Organization",
            name: "Rubí Relojería & Joyería",
            url: "https://rubi-joyeria.com",
          },
        }),
      },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(productsQueryOptions),
      context.queryClient.ensureQueryData(categoriesQueryOptions),
    ]);
  },
  component: Catalogo,
});

function Catalogo() {
  const { cat, q, sort } = Route.useSearch();
  const navigate = useNavigate({ from: "/catalogo" });
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions);
  const brands = useMemo(() => Array.from(new Set(products.map((p) => p.brand))), [products]);
  const materials = useMemo(() => Array.from(new Set(products.map((p) => p.material))), [products]);
  const [category, setCategory] = useState<string>(cat ?? "todos");
  const [brand, setBrand] = useState<string>("todas");
  const [material, setMaterial] = useState<string>("todos");
  const [maxPrice, setMaxPrice] = useState<number>(3000000);
  const [query, setQuery] = useState<string>(q ?? "");

  const currentSort: SortOpt = sort ?? "relevance";
  const setSort = (s: SortOpt) =>
    navigate({ search: (prev: Search) => ({ ...prev, sort: s === "relevance" ? undefined : s }) });

  const applyQuery = (value: string) => {
    const v = value.trim();
    navigate({ search: (prev: Search) => ({ ...prev, q: v.length > 0 ? v : undefined }) });
  };

  const filtered = useMemo(
    (): Product[] => {
      const term = (q ?? "").trim().toLowerCase();
      const result = products.filter((p) => {
        if (category !== "todos" && p.category !== category) return false;
        if (brand !== "todas" && p.brand !== brand) return false;
        if (material !== "todos" && p.material !== material) return false;
        const price = p.discountPrice ?? p.price;
        if (price > maxPrice) return false;
        if (term.length > 0) {
          const hay = `${p.name} ${p.brand} ${p.material} ${p.categoryLabel ?? ""}`.toLowerCase();
          if (!hay.includes(term)) return false;
        }
        return true;
      });
      const sorted = [...result];
      if (currentSort === "price-asc") {
        sorted.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
      } else if (currentSort === "price-desc") {
        sorted.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
      } else if (currentSort === "name") {
        sorted.sort((a, b) => a.name.localeCompare(b.name, "es"));
      }
      return sorted;
    },
    [products, category, brand, material, maxPrice, q, currentSort],
  );

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
      <div className="text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">La colección</p>
        <h1 className="mt-4 font-serif text-4xl md:text-6xl">Catálogo Rubí</h1>
        <p className="mx-auto mt-5 max-w-xl text-sm text-muted-foreground">
          Piezas pensadas para acompañar tus momentos más importantes.
        </p>
      </div>

      <div className="gold-divider my-12" />

      <div className="mb-10 flex flex-col items-stretch gap-3 md:flex-row md:items-center md:justify-between">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            applyQuery(query);
          }}
          className="relative flex-1 md:max-w-md"
        >
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar relojes, joyas, marcas…"
            className="w-full border border-foreground/20 bg-transparent py-2.5 pl-9 pr-9 text-sm outline-none focus:border-wine"
          />
          {query.length > 0 && (
            <button
              type="button"
              aria-label="Limpiar búsqueda"
              onClick={() => {
                setQuery("");
                applyQuery("");
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-wine"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>

        <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span>Ordenar</span>
          <select
            value={currentSort}
            onChange={(e) => setSort(e.target.value as SortOpt)}
            className="border border-foreground/20 bg-transparent px-3 py-2 text-xs uppercase tracking-[0.15em] outline-none focus:border-wine"
          >
            <option value="relevance">Destacados</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
            <option value="name">Nombre A–Z</option>
          </select>
        </div>
      </div>

      <div className="grid gap-12 md:grid-cols-[220px_1fr]">
        {/* Filtros */}
        <aside className="space-y-8 text-sm">
          <FilterGroup label="Categoría">
            <FilterOption active={category === "todos"} onClick={() => setCategory("todos")}>
              Todos
            </FilterOption>
            {categories.map((c) => (
              <FilterOption key={c.slug} active={category === c.slug} onClick={() => setCategory(c.slug)}>
                {c.name}
              </FilterOption>
            ))}
          </FilterGroup>

          <FilterGroup label="Marca">
            <FilterOption active={brand === "todas"} onClick={() => setBrand("todas")}>
              Todas
            </FilterOption>
            {brands.map((b) => (
              <FilterOption key={b} active={brand === b} onClick={() => setBrand(b)}>
                {b}
              </FilterOption>
            ))}
          </FilterGroup>

          <FilterGroup label="Material">
            <FilterOption active={material === "todos"} onClick={() => setMaterial("todos")}>
              Todos
            </FilterOption>
            {materials.map((m) => (
              <FilterOption key={m} active={material === m} onClick={() => setMaterial(m)}>
                {m}
              </FilterOption>
            ))}
          </FilterGroup>

          <FilterGroup label="Precio máximo">
            <input
              type="range"
              min={500000}
              max={3000000}
              step={50000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[var(--wine)]"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Hasta {new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(maxPrice)}
            </p>
          </FilterGroup>
        </aside>

        {/* Grid */}
        <div>
          <p className="mb-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {filtered.length} pieza{filtered.length === 1 ? "" : "s"}
          </p>
          {filtered.length === 0 ? (
            <div className="border border-dashed border-border py-20 text-center text-muted-foreground">
              No encontramos piezas con esos filtros.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 font-serif text-xs uppercase tracking-[0.25em] text-foreground/80">{label}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function FilterOption({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`block w-full text-left text-sm transition-colors ${
        active ? "text-wine font-medium" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}