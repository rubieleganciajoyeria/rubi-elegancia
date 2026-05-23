import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Pencil, Trash2, Plus, LogOut, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  adminListProducts,
  upsertProduct,
  deleteProduct,
  getMyRole,
} from "@/lib/products.functions";
import { formatCOP } from "@/data/products";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Rubí" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login" });
  },
  component: AdminPage,
});

type ProductRow = Awaited<ReturnType<typeof adminListProducts>>[number];

function AdminPage() {
  const list = useServerFn(adminListProducts);
  const role = useServerFn(getMyRole);
  const save = useServerFn(upsertProduct);
  const del = useServerFn(deleteProduct);
  const qc = useQueryClient();

  const roleQ = useQuery({ queryKey: ["my-role"], queryFn: () => role() });
  const productsQ = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => list(),
    enabled: !!roleQ.data?.isAdmin,
  });

  const [editing, setEditing] = useState<Partial<ProductRow> | null>(null);

  const saveM = useMutation({
    mutationFn: (data: Parameters<typeof save>[0]["data"]) => save({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      setEditing(null);
    },
  });

  const deleteM = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });

  if (roleQ.isLoading) {
    return <div className="mx-auto max-w-4xl px-6 py-20 text-sm text-muted-foreground">Cargando…</div>;
  }

  if (!roleQ.data?.isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-6 py-20 text-center">
        <h1 className="font-serif text-3xl">Acceso restringido</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Tu usuario ({roleQ.data?.userId}) no tiene rol de administrador.
          <br />
          Asígnalo desde el backend insertando una fila en <code>user_roles</code> con rol <code>admin</code>.
        </p>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/login";
          }}
          className="mt-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] text-wine"
        >
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Panel</p>
          <h1 className="mt-2 font-serif text-4xl">Administración</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditing({})}
            className="inline-flex items-center gap-2 bg-wine px-5 py-3 text-[11px] uppercase tracking-[0.25em] text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Nuevo producto
          </button>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
            aria-label="Cerrar sesión"
            className="border border-foreground/30 p-3 hover:border-wine hover:text-wine"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="gold-divider my-8" />

      {productsQ.isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando productos…</p>
      ) : (
        <div className="overflow-x-auto border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
              <tr>
                <th className="p-3">Producto</th>
                <th className="p-3">Categoría</th>
                <th className="p-3">Precio</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(productsQ.data ?? []).map((p) => (
                <tr key={p.id} className="border-t border-border/60">
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="h-12 w-10 object-cover" />
                      <div>
                        <p className="font-serif text-base">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-xs uppercase tracking-wider text-muted-foreground">{p.category_label}</td>
                  <td className="p-3">
                    {p.discount_price ? (
                      <>
                        <span className="text-wine">{formatCOP(p.discount_price)}</span>{" "}
                        <span className="text-xs text-muted-foreground line-through">{formatCOP(p.price)}</span>
                      </>
                    ) : (
                      formatCOP(p.price)
                    )}
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-[10px] uppercase tracking-wider ${
                        p.is_active ? "bg-secondary text-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.is_active ? "Activo" : "Oculto"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setEditing(p)}
                      aria-label="Editar"
                      className="mr-2 inline-flex items-center justify-center p-2 hover:text-wine"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar "${p.name}"?`)) deleteM.mutate(p.id);
                      }}
                      aria-label="Eliminar"
                      className="inline-flex items-center justify-center p-2 hover:text-wine"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-muted-foreground">
        Imágenes: puedes usar rutas locales como <code>/products/nombre.jpg</code> (colócalas en <code>/public/products/</code>) o URLs completas.
      </p>

      <Link to="/" className="mt-8 inline-block text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-wine">
        ← Volver a la tienda
      </Link>

      {editing && (
        <ProductEditor
          initial={editing}
          onCancel={() => setEditing(null)}
          saving={saveM.isPending}
          error={saveM.error instanceof Error ? saveM.error.message : null}
          onSubmit={(payload) => saveM.mutate(payload)}
        />
      )}
    </div>
  );
}

type FormValues = {
  id?: string;
  slug: string;
  name: string;
  category: "relojeria" | "joyeria";
  category_label: string;
  brand: string;
  material: string;
  price: number;
  discount_price: number | null;
  image: string;
  gallery: string[];
  description: string;
  warranty: string;
  is_active: boolean;
  sort_order: number;
};

function ProductEditor({
  initial,
  onCancel,
  onSubmit,
  saving,
  error,
}: {
  initial: Partial<ProductRow>;
  onCancel: () => void;
  onSubmit: (v: FormValues) => void;
  saving: boolean;
  error: string | null;
}) {
  const [v, setV] = useState<FormValues>({
    id: initial.id,
    slug: initial.slug ?? "",
    name: initial.name ?? "",
    category: (initial.category as "relojeria" | "joyeria") ?? "relojeria",
    category_label: initial.category_label ?? "Relojería",
    brand: initial.brand ?? "Rubí Atelier",
    material: initial.material ?? "",
    price: initial.price ?? 0,
    discount_price: initial.discount_price ?? null,
    image: initial.image ?? "",
    gallery: Array.isArray(initial.gallery) ? (initial.gallery as string[]) : [],
    description: initial.description ?? "",
    warranty: initial.warranty ?? "",
    is_active: initial.is_active ?? true,
    sort_order: initial.sort_order ?? 0,
  });

  // Bloquea scroll body
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const set = <K extends keyof FormValues>(k: K, val: FormValues[K]) => setV({ ...v, [k]: val });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-background p-8 shadow-2xl">
        <div className="flex items-start justify-between">
          <h2 className="font-serif text-2xl">{v.id ? "Editar producto" : "Nuevo producto"}</h2>
          <button onClick={onCancel} aria-label="Cerrar" className="p-2 hover:text-wine">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(v);
          }}
          className="mt-6 grid gap-4 sm:grid-cols-2"
        >
          <Field label="Nombre" value={v.name} onChange={(x) => set("name", x)} required />
          <Field label="Slug (URL)" value={v.slug} onChange={(x) => set("slug", x.toLowerCase())} required />

          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Categoría</label>
            <select
              value={v.category}
              onChange={(e) => {
                const cat = e.target.value as "relojeria" | "joyeria";
                setV({ ...v, category: cat, category_label: cat === "relojeria" ? "Relojería" : "Joyería" });
              }}
              className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-wine"
            >
              <option value="relojeria">Relojería</option>
              <option value="joyeria">Joyería</option>
            </select>
          </div>
          <Field label="Marca" value={v.brand} onChange={(x) => set("brand", x)} required />

          <Field label="Material" value={v.material} onChange={(x) => set("material", x)} required className="sm:col-span-2" />

          <FieldNumber label="Precio (COP)" value={v.price} onChange={(n) => set("price", n)} required />
          <FieldNumber
            label="Precio con descuento (opcional)"
            value={v.discount_price ?? 0}
            onChange={(n) => set("discount_price", n > 0 ? n : null)}
          />

          <Field label="Imagen principal (URL o /products/…)" value={v.image} onChange={(x) => set("image", x)} required className="sm:col-span-2" />
          <Field
            label="Galería (URLs separadas por coma)"
            value={v.gallery.join(", ")}
            onChange={(x) => set("gallery", x.split(",").map((s) => s.trim()).filter(Boolean))}
            className="sm:col-span-2"
          />

          <div className="sm:col-span-2">
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Descripción</label>
            <textarea
              value={v.description}
              onChange={(e) => set("description", e.target.value)}
              rows={4}
              className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-wine"
            />
          </div>

          <Field label="Garantía" value={v.warranty} onChange={(x) => set("warranty", x)} className="sm:col-span-2" />

          <FieldNumber label="Orden" value={v.sort_order} onChange={(n) => set("sort_order", n)} />
          <label className="flex items-center gap-2 self-end text-sm">
            <input
              type="checkbox"
              checked={v.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
            />
            Producto activo (visible en la tienda)
          </label>

          {error && <p className="sm:col-span-2 text-sm text-wine">{error}</p>}

          <div className="sm:col-span-2 mt-2 flex justify-end gap-3">
            <button type="button" onClick={onCancel} className="px-5 py-3 text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-wine">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-wine px-6 py-3 text-[11px] uppercase tracking-[0.25em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-wine"
      />
    </div>
  );
}

function FieldNumber({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value || 0))}
        required={required}
        className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-wine"
      />
    </div>
  );
}