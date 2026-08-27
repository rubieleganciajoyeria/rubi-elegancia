import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { mapProduct, type Product } from "@/data/products";
import { listActiveProducts } from "@/lib/products.functions";
import { listActiveCategories } from "@/lib/categories.functions";
import { ProductCard } from "@/components/ProductCard";
import { Search as SearchIcon, SlidersHorizontal, X } from "lucide-react";

const productsQueryOptions = queryOptions({
  queryKey: ["products", "active"],
  queryFn: async () => (await listActiveProducts()).map(mapProduct),
});

const categoriesQueryOptions = queryOptions({
  queryKey: ["categories", "active"],
  queryFn: async () => await listActiveCategories(),
});

type SortOpt = "relevance" | "price-asc" | "price-desc" | "name";
type Search = {
  cat?: string;
  q?: string;
  sort?: SortOpt;
  brand?: string;
  material?: string;
  color?: string;
  usage?: string;
  gender?: string;
  maxPrice?: number;
  page?: number;
};

const SORT_VALUES: SortOpt[] = ["relevance", "price-asc", "price-desc", "name"];
const DEFAULT_MAX_PRICE = 20000000;
const PRICE_STEP = 50000;
const PRODUCTS_PER_PAGE = 12;

export const Route = createFileRoute("/catalogo")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    cat: typeof s.cat === "string" && /^[a-z0-9-]+$/.test(s.cat) ? s.cat : undefined,
    q: typeof s.q === "string" && s.q.length <= 100 ? s.q : undefined,
    sort:
      typeof s.sort === "string" && (SORT_VALUES as string[]).includes(s.sort)
        ? (s.sort as SortOpt)
        : undefined,
    brand: typeof s.brand === "string" && s.brand.length <= 120 ? s.brand : undefined,
    material: typeof s.material === "string" && s.material.length <= 120 ? s.material : undefined,
    color: typeof s.color === "string" && s.color.length <= 120 ? s.color : undefined,
    usage: typeof s.usage === "string" && s.usage.length <= 120 ? s.usage : undefined,
    gender: typeof s.gender === "string" && s.gender.length <= 120 ? s.gender : undefined,
    maxPrice: typeof s.maxPrice === "string" && !isNaN(Number(s.maxPrice)) ? Number(s.maxPrice) : undefined,
    page: typeof s.page === "string" && !isNaN(Number(s.page)) && Number(s.page) > 0 ? Number(s.page) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Catálogo de Relojes y Joyas | Rubí Relojería & Joyería" },
      {
        name: "description",
        content:
          "Explora nuestra colección completa de relojes suizos, joyas de oro, plata y piezas de moda. Todas las marcas: Rolex, Omega, Tissot, Pandora y más.",
      },
      { name: "robots", content: "index, follow" },
      { property: "og:title", content: "Catálogo de Relojes y Joyas | Rubí" },
      {
        property: "og:description",
        content:
          "Explora nuestra colección completa de relojes suizos, joyas de oro, plata y piezas de moda premium.",
      },
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
  const { cat, q, sort, brand: urlBrand, material: urlMaterial, color: urlColor, usage: urlUsage, gender: urlGender, maxPrice: urlMaxPrice, page: urlPage } = Route.useSearch();
  const navigate = useNavigate({ from: "/catalogo" });
  const { data: products } = useSuspenseQuery(productsQueryOptions);
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions);
  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand).filter(Boolean) as string[])),
    [products],
  );
  const materials = useMemo(
    () => Array.from(new Set(products.map((p) => p.material).filter(Boolean) as string[])),
    [products],
  );
  const colors = useMemo(
    () => Array.from(new Set(products.map((p) => p.color).filter(Boolean) as string[])),
    [products],
  );
  const usageTypes = useMemo(
    () => Array.from(new Set(products.map((p) => p.usageType).filter(Boolean) as string[])),
    [products],
  );
  const genders = useMemo(
    () => Array.from(new Set(products.map((p) => p.gender).filter(Boolean) as string[])),
    [products],
  );
  const priceLimit = useMemo(() => {
    const highestPrice = Math.max(...products.map((p) => p.discountPrice ?? p.price), 0);
    return Math.max(DEFAULT_MAX_PRICE, Math.ceil(highestPrice / PRICE_STEP) * PRICE_STEP);
  }, [products]);

  const [category, setCategory] = useState<string>(cat ?? "todos");
  const [brand, setBrand] = useState<string>(urlBrand ?? "todas");
  const [material, setMaterial] = useState<string>(urlMaterial ?? "todos");
  const [color, setColor] = useState<string>(urlColor ?? "todos");
  const [usageType, setUsageType] = useState<string>(urlUsage ?? "todos");
  const [gender, setGender] = useState<string>(urlGender ?? "todos");
  const [maxPrice, setMaxPrice] = useState<number>(urlMaxPrice ?? priceLimit);
  const [query, setQuery] = useState<string>(q ?? "");
  const [page, setPage] = useState<number>(urlPage ?? 1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setMaxPrice((current) => Math.max(current, priceLimit));
  }, [priceLimit]);

  const updateSearch = (patch: Partial<Search>) => {
    navigate({ search: (prev: Search) => ({ ...prev, ...patch }) });
  };

  const currentSort: SortOpt = sort ?? "relevance";
  const setSort = (s: SortOpt) => {
    setPage(1);
    updateSearch({ sort: s === "relevance" ? undefined : s, page: undefined });
  };

  const applyQuery = (value: string) => {
    const v = value.trim();
    setPage(1);
    updateSearch({ q: v.length > 0 ? v : undefined, page: undefined });
  };

  const setFilter = (setter: (value: string) => void, key: keyof Search, value: string) => {
    setPage(1);
    setter(value);
    updateSearch({ [key]: value === "todos" || value === "todas" ? undefined : value, page: undefined });
  };

  const setPriceFilter = (value: number) => {
    setPage(1);
    setMaxPrice(value);
    updateSearch({ maxPrice: value < priceLimit ? value : undefined, page: undefined });
  };

  const setPageNum = (p: number) => {
    setPage(p);
    updateSearch({ page: p > 1 ? p : undefined });
  };

  const activeFilterCount = [
    category !== "todos",
    brand !== "todas",
    material !== "todos",
    color !== "todos",
    usageType !== "todos",
    gender !== "todos",
    maxPrice < priceLimit,
  ].filter(Boolean).length;

  const resetFilters = () => {
    setPage(1);
    setCategory(cat ?? "todos");
    setBrand("todas");
    setMaterial("todos");
    setColor("todos");
    setUsageType("todos");
    setGender("todos");
    setMaxPrice(priceLimit);
    navigate({ search: {} });
  };

  const filtered = useMemo((): Product[] => {
    const term = (q ?? "").trim().toLowerCase();
    const result = products.filter((p) => {
      if (category !== "todos" && p.category !== category) return false;
      if (brand !== "todas" && p.brand !== brand) return false;
      if (material !== "todos" && p.material !== material) return false;
      if (color !== "todos" && p.color !== color) return false;
      if (usageType !== "todos" && p.usageType !== usageType) return false;
      if (gender !== "todos" && p.gender !== gender) return false;
      const price = p.discountPrice ?? p.price;
      if (price > maxPrice) return false;
      if (term.length > 0) {
        const hay =
          `${p.name} ${p.brand} ${p.material ?? ""} ${p.color ?? ""} ${p.usageType ?? ""} ${p.gender ?? ""} ${p.categoryLabel ?? ""}`.toLowerCase();
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
  }, [products, category, brand, material, color, usageType, gender, maxPrice, q, currentSort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  );
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

  useEffect(() => {
    if (page > totalPages) setPageNum(totalPages);
  }, [totalPages]);

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

      <div className="mb-8 flex items-center justify-between gap-3 md:hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          className="inline-flex flex-1 items-center justify-center gap-2 border border-foreground/20 px-4 py-3 text-[11px] uppercase tracking-[0.22em] transition-colors hover:border-wine hover:text-wine"
          aria-expanded={filtersOpen}
        >
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} />
          Filtros{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
        </button>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={resetFilters}
            className="px-3 py-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-wine"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="grid gap-12 md:grid-cols-[220px_1fr]">
        {/* Filtros */}
        <aside
          className={`${filtersOpen ? "block" : "hidden"} space-y-8 border border-border/60 bg-secondary/20 p-5 text-sm md:block md:border-0 md:bg-transparent md:p-0`}
        >
          <div className="flex items-center justify-between md:hidden">
            <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
              Filtrar catálogo
            </p>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-[11px] uppercase tracking-[0.18em] text-wine"
              >
                Limpiar
              </button>
            )}
          </div>
          <FilterGroup label="Categoría">
            <FilterOption
              active={category === "todos"}
              onClick={() => setFilter(setCategory, "cat", "todos")}
            >
              Todos
            </FilterOption>
            {categories.map((c) => (
              <FilterOption
                key={c.slug}
                active={category === c.slug}
                onClick={() => setFilter(setCategory, "cat", c.slug)}
              >
                {c.name}
              </FilterOption>
            ))}
          </FilterGroup>

          <FilterGroup label="Marca">
            <FilterOption active={brand === "todas"} onClick={() => setFilter(setBrand, "brand", "todas")}>
              Todas
            </FilterOption>
            {brands.map((b) => (
              <FilterOption key={b} active={brand === b} onClick={() => setFilter(setBrand, "brand", b)}>
                {b}
              </FilterOption>
            ))}
          </FilterGroup>

          <FilterGroup label="Material">
            <FilterOption
              active={material === "todos"}
              onClick={() => setFilter(setMaterial, "material", "todos")}
            >
              Todos
            </FilterOption>
            {materials.map((m) => (
              <FilterOption
                key={m}
                active={material === m}
                onClick={() => setFilter(setMaterial, "material", m)}
              >
                {m}
              </FilterOption>
            ))}
          </FilterGroup>

          <FilterGroup label="Color">
            <FilterOption active={color === "todos"} onClick={() => setFilter(setColor, "color", "todos")}>
              Todos
            </FilterOption>
            {colors.map((c) => (
              <FilterOption key={c} active={color === c} onClick={() => setFilter(setColor, "color", c)}>
                {c}
              </FilterOption>
            ))}
          </FilterGroup>

          <FilterGroup label="Tipo de Uso">
            <FilterOption
              active={usageType === "todos"}
              onClick={() => setFilter(setUsageType, "usage", "todos")}
            >
              Todos
            </FilterOption>
            {usageTypes.map((u) => (
              <FilterOption
                key={u}
                active={usageType === u}
                onClick={() => setFilter(setUsageType, "usage", u)}
              >
                {u}
              </FilterOption>
            ))}
          </FilterGroup>

          <FilterGroup label="Género">
            <FilterOption active={gender === "todos"} onClick={() => setFilter(setGender, "gender", "todos")}>
              Todos
            </FilterOption>
            {genders.map((g) => (
              <FilterOption key={g} active={gender === g} onClick={() => setFilter(setGender, "gender", g)}>
                {g}
              </FilterOption>
            ))}
          </FilterGroup>

          <FilterGroup label="Precio máximo">
            <input
              type="range"
              min={500000}
              max={priceLimit}
              step={PRICE_STEP}
              value={maxPrice}
              onChange={(e) => setPriceFilter(Number(e.target.value))}
              className="w-full accent-[var(--wine)]"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Hasta{" "}
              {new Intl.NumberFormat("es-CO", {
                style: "currency",
                currency: "COP",
                maximumFractionDigits: 0,
              }).format(maxPrice)}
            </p>
          </FilterGroup>
        </aside>

        {/* Grid */}
        <div>
          <p className="mb-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {filtered.length} pieza{filtered.length === 1 ? "" : "s"}
            {filtered.length > 0 && ` · Página ${currentPage} de ${totalPages}`}
          </p>
          {filtered.length === 0 ? (
            <div className="border border-dashed border-border py-20 text-center text-muted-foreground">
              No encontramos piezas con esos filtros.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3">
              {paginated.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <nav
              aria-label="Paginación de productos"
              className="mt-12 flex flex-wrap items-center justify-center gap-2"
            >
              <button
                type="button"
                onClick={() => setPageNum(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="border border-foreground/20 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-wine hover:text-wine disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-foreground/20 disabled:hover:text-muted-foreground"
              >
                Anterior
              </button>
              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPageNum(pageNumber)}
                  aria-current={pageNumber === currentPage ? "page" : undefined}
                  className={`h-10 min-w-10 border px-3 text-sm transition-colors ${
                    pageNumber === currentPage
                      ? "border-wine bg-wine text-primary-foreground"
                      : "border-foreground/20 text-muted-foreground hover:border-wine hover:text-wine"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPageNum(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="border border-foreground/20 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:border-wine hover:text-wine disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-foreground/20 disabled:hover:text-muted-foreground"
              >
                Siguiente
              </button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 font-serif text-xs uppercase tracking-[0.25em] text-foreground/80">
        {label}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function FilterOption({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
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
