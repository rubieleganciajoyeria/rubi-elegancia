import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { products, brands, materials } from "@/data/products";
import { ProductCard } from "@/components/ProductCard";

type Search = { cat?: "relojeria" | "joyeria" };

export const Route = createFileRoute("/catalogo")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    cat: s.cat === "joyeria" || s.cat === "relojeria" ? s.cat : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Catálogo — Rubí" },
      { name: "description", content: "Explora la colección completa de relojería y joyería Rubí." },
    ],
  }),
  component: Catalogo,
});

function Catalogo() {
  const { cat } = Route.useSearch();
  const [category, setCategory] = useState<"todos" | "relojeria" | "joyeria">(cat ?? "todos");
  const [brand, setBrand] = useState<string>("todas");
  const [material, setMaterial] = useState<string>("todos");
  const [maxPrice, setMaxPrice] = useState<number>(3000000);

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (category !== "todos" && p.category !== category) return false;
        if (brand !== "todas" && p.brand !== brand) return false;
        if (material !== "todos" && p.material !== material) return false;
        const price = p.discountPrice ?? p.price;
        return price <= maxPrice;
      }),
    [category, brand, material, maxPrice],
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

      <div className="grid gap-12 md:grid-cols-[220px_1fr]">
        {/* Filtros */}
        <aside className="space-y-8 text-sm">
          <FilterGroup label="Categoría">
            {(["todos", "relojeria", "joyeria"] as const).map((v) => (
              <FilterOption key={v} active={category === v} onClick={() => setCategory(v)}>
                {v === "todos" ? "Todos" : v === "relojeria" ? "Relojería" : "Joyería"}
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