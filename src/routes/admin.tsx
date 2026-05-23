import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { Fragment, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Pencil, Trash2, Plus, LogOut, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  adminListProducts,
  upsertProduct,
  deleteProduct,
  getMyRole,
  replaceProductImages,
} from "@/lib/products.functions";
import {
  adminListBanners,
  upsertBanner,
  deleteBanner,
} from "@/lib/banners.functions";
import {
  adminListCategories,
  upsertCategory,
  deleteCategory,
} from "@/lib/categories.functions";
import {
  adminListPromotions,
  upsertPromotion,
  deletePromotion,
} from "@/lib/promotions.functions";
import {
  adminListOrders,
  updateOrderStatus,
  deleteOrder,
} from "@/lib/orders.functions";
import {
  listSiteContent,
  upsertSiteContent,
} from "@/lib/site-content.functions";
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
  const saveImages = useServerFn(replaceProductImages);
  const listCats = useServerFn(adminListCategories);
  const qc = useQueryClient();

  const roleQ = useQuery({ queryKey: ["my-role"], queryFn: () => role() });
  const productsQ = useQuery({
    queryKey: ["admin", "products"],
    queryFn: () => list(),
    enabled: !!roleQ.data?.isAdmin,
  });
  const categoriesQ = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: () => listCats(),
    enabled: !!roleQ.data?.isAdmin,
  });

  const [editing, setEditing] = useState<Partial<ProductRow> | null>(null);

  const saveM = useMutation({
    mutationFn: async (data: FormValues) => {
      const cleanImages = data.images
        .map((i) => ({ url: i.url.trim(), alt: i.alt?.trim() ?? "" }))
        .filter((i) => i.url.length > 0);
      const { images: _omit, ...rest } = data;
      const payload = {
        ...rest,
        image: cleanImages[0]?.url ?? rest.image,
        gallery: [] as string[],
      };
      const res = await save({ data: payload });
      const id = res.id;
      await saveImages({ data: { product_id: id, images: cleanImages } });
      return res;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "products"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product"] });
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

      <BannersAdmin />

      <div className="gold-divider my-12" />

      <CategoriesAdmin />

      <div className="gold-divider my-12" />

      <PromotionsAdmin products={productsQ.data ?? []} />

      <div className="gold-divider my-12" />

      <OrdersAdmin />

      <div className="gold-divider my-12" />

      <HomeSectionsAdmin />

      <div className="gold-divider my-12" />

      <h2 className="mb-6 font-serif text-2xl">Productos</h2>

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
          categories={categoriesQ.data ?? []}
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
  category: string;
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
  stock: number | null;
  images: Array<{ url: string; alt: string }>;
};

function ProductEditor({
  initial,
  categories,
  onCancel,
  onSubmit,
  saving,
  error,
}: {
  initial: Partial<ProductRow>;
  categories: Array<{ slug: string; name: string }>;
  onCancel: () => void;
  onSubmit: (v: FormValues) => void;
  saving: boolean;
  error: string | null;
}) {
  const initialImages: Array<{ url: string; alt: string }> = (() => {
    const pi = (initial as { product_images?: Array<{ url: string; alt: string; sort_order: number }> }).product_images;
    if (Array.isArray(pi) && pi.length > 0) {
      return [...pi].sort((a, b) => a.sort_order - b.sort_order).map((i) => ({ url: i.url, alt: i.alt ?? "" }));
    }
    const legacy = [initial.image, ...(Array.isArray(initial.gallery) ? (initial.gallery as string[]) : [])].filter(Boolean) as string[];
    return legacy.map((url) => ({ url, alt: "" }));
  })();

  const [v, setV] = useState<FormValues>({
    id: initial.id,
    slug: initial.slug ?? "",
    name: initial.name ?? "",
    category: initial.category ?? categories[0]?.slug ?? "",
    category_label: initial.category_label ?? categories[0]?.name ?? "",
    brand: initial.brand ?? "Rubí Atelier",
    material: initial.material ?? "",
    price: initial.price ?? 0,
    discount_price: initial.discount_price ?? null,
    image: initialImages[0]?.url ?? initial.image ?? "",
    gallery: Array.isArray(initial.gallery) ? (initial.gallery as string[]) : [],
    description: initial.description ?? "",
    warranty: initial.warranty ?? "",
    is_active: initial.is_active ?? true,
    sort_order: initial.sort_order ?? 0,
    stock: (initial as { stock?: number | null }).stock ?? null,
    images: initialImages,
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
                const cat = e.target.value;
                const label = categories.find((c) => c.slug === cat)?.name ?? cat;
                setV({ ...v, category: cat, category_label: label });
              }}
              className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-wine"
            >
              {categories.length === 0 && (
                <option value="">— Crea una categoría primero —</option>
              )}
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
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

          <div className="sm:col-span-2">
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Imágenes (la primera es la principal)
            </label>
            <div className="mt-2 space-y-2">
              {v.images.map((img, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="w-6 text-xs text-muted-foreground">{idx + 1}.</span>
                  <input
                    value={img.url}
                    onChange={(e) => {
                      const next = [...v.images];
                      next[idx] = { ...next[idx], url: e.target.value };
                      setV({ ...v, images: next, image: next[0]?.url ?? "" });
                    }}
                    placeholder="URL o /products/foto.jpg"
                    className="flex-1 border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-wine"
                  />
                  <input
                    value={img.alt}
                    onChange={(e) => {
                      const next = [...v.images];
                      next[idx] = { ...next[idx], alt: e.target.value };
                      setV({ ...v, images: next });
                    }}
                    placeholder="alt"
                    className="w-32 border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-wine"
                  />
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => {
                      const next = [...v.images];
                      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
                      setV({ ...v, images: next, image: next[0]?.url ?? "" });
                    }}
                    className="px-2 py-2 text-xs hover:text-wine disabled:opacity-30"
                    aria-label="Subir"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={idx === v.images.length - 1}
                    onClick={() => {
                      const next = [...v.images];
                      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
                      setV({ ...v, images: next, image: next[0]?.url ?? "" });
                    }}
                    className="px-2 py-2 text-xs hover:text-wine disabled:opacity-30"
                    aria-label="Bajar"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next = v.images.filter((_, i) => i !== idx);
                      setV({ ...v, images: next, image: next[0]?.url ?? "" });
                    }}
                    className="px-2 py-2 text-xs hover:text-wine"
                    aria-label="Eliminar"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setV({ ...v, images: [...v.images, { url: "", alt: "" }] })}
                className="text-[11px] uppercase tracking-[0.25em] text-wine hover:opacity-80"
              >
                + Añadir imagen
              </button>
            </div>
          </div>

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
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Stock (vacío = ilimitado)
            </label>
            <input
              type="number"
              min={0}
              value={v.stock ?? ""}
              onChange={(e) => {
                const val = e.target.value;
                set("stock", val === "" ? null : Math.max(0, Number(val)));
              }}
              className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-wine"
            />
          </div>
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

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
] as const;

const STATUS_LABEL: Record<(typeof ORDER_STATUSES)[number], string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  paid: "Pagado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

function OrdersAdmin() {
  const list = useServerFn(adminListOrders);
  const upd = useServerFn(updateOrderStatus);
  const del = useServerFn(deleteOrder);
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);

  const ordersQ = useQuery({ queryKey: ["admin", "orders"], queryFn: () => list() });

  const updM = useMutation({
    mutationFn: (v: { id: string; status: (typeof ORDER_STATUSES)[number] }) =>
      upd({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "orders"] }),
  });
  const delM = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "orders"] }),
  });

  return (
    <section>
      <h2 className="mb-6 font-serif text-2xl">Pedidos</h2>
      {ordersQ.isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando pedidos…</p>
      ) : (ordersQ.data ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">Aún no hay pedidos.</p>
      ) : (
        <div className="overflow-x-auto border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Total</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(ordersQ.data ?? []).map((o: any) => (
                <Fragment key={o.id}>
                  <tr className="border-t border-border/60">
                    <td className="p-3 text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{o.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{o.customer_email} · {o.customer_phone}</div>
                      <div className="text-xs text-muted-foreground">{o.city} — {o.address}</div>
                    </td>
                    <td className="p-3">{formatCOP(o.total)}</td>
                    <td className="p-3">
                      <select
                        value={o.status}
                        onChange={(e) => updM.mutate({ id: o.id, status: e.target.value as any })}
                        className="border border-foreground/20 bg-transparent px-2 py-1 text-xs"
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                        className="mr-3 text-[11px] uppercase tracking-[0.2em] text-wine"
                      >
                        {expanded === o.id ? "Ocultar" : "Detalle"}
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("¿Eliminar pedido?")) delM.mutate(o.id);
                        }}
                        aria-label="Eliminar"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="inline h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                  {expanded === o.id && (
                    <tr className="border-t border-border/60 bg-secondary/20">
                      <td colSpan={5} className="p-4">
                        <div className="grid gap-3">
                          {(o.order_items ?? []).map((it: any) => (
                            <div key={it.id} className="flex items-center gap-3 text-sm">
                              {it.product_image && (
                                <img src={it.product_image} alt="" className="h-12 w-10 object-cover" />
                              )}
                              <div className="flex-1">
                                <div>{it.product_name}</div>
                                <div className="text-xs text-muted-foreground">x{it.qty} · {formatCOP(it.unit_price)} c/u</div>
                              </div>
                              <div>{formatCOP(it.subtotal)}</div>
                            </div>
                          ))}
                          <div className="text-xs text-muted-foreground">
                            Subtotal: {formatCOP(o.subtotal)} · Envío: {formatCOP(o.shipping)} · Notas: {o.notes || "—"}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
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

type BannerRow = Awaited<ReturnType<typeof adminListBanners>>[number];

function BannersAdmin() {
  const list = useServerFn(adminListBanners);
  const save = useServerFn(upsertBanner);
  const del = useServerFn(deleteBanner);
  const qc = useQueryClient();

  const q = useQuery({ queryKey: ["admin", "banners"], queryFn: () => list() });
  const [editing, setEditing] = useState<Partial<BannerRow> | null>(null);

  const saveM = useMutation({
    mutationFn: (data: BannerForm) => save({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "banners"] });
      qc.invalidateQueries({ queryKey: ["banners", "active"] });
      setEditing(null);
    },
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "banners"] });
      qc.invalidateQueries({ queryKey: ["banners", "active"] });
    },
  });

  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-serif text-2xl">Banners del home</h2>
        <button
          onClick={() => setEditing({})}
          className="inline-flex items-center gap-2 bg-wine px-5 py-3 text-[11px] uppercase tracking-[0.25em] text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Nuevo banner
        </button>
      </div>

      {q.isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando banners…</p>
      ) : (q.data ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay banners. Crea el primero.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {(q.data ?? []).map((b) => (
            <div key={b.id} className="flex gap-4 border border-border/60 p-3">
              <img src={b.image} alt="" className="h-24 w-40 flex-none object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-base">{b.title || "(sin título)"}</p>
                <p className="truncate text-xs text-muted-foreground">{b.eyebrow}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">
                  Orden: {b.sort_order} · {b.is_active ? "Activo" : "Oculto"}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={() => setEditing(b)} aria-label="Editar" className="p-2 hover:text-wine">
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm("¿Eliminar banner?")) deleteM.mutate(b.id);
                  }}
                  aria-label="Eliminar"
                  className="p-2 hover:text-wine"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <BannerEditor
          initial={editing}
          onCancel={() => setEditing(null)}
          saving={saveM.isPending}
          error={saveM.error instanceof Error ? saveM.error.message : null}
          onSubmit={(v) => saveM.mutate(v)}
        />
      )}
    </section>
  );
}

type BannerForm = {
  id?: string;
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta_label: string;
  cta_url: string;
  align: "left" | "center" | "right";
  is_active: boolean;
  sort_order: number;
};

function BannerEditor({
  initial,
  onCancel,
  onSubmit,
  saving,
  error,
}: {
  initial: Partial<BannerRow>;
  onCancel: () => void;
  onSubmit: (v: BannerForm) => void;
  saving: boolean;
  error: string | null;
}) {
  const [v, setV] = useState<BannerForm>({
    id: initial.id,
    image: initial.image ?? "",
    eyebrow: initial.eyebrow ?? "",
    title: initial.title ?? "",
    subtitle: initial.subtitle ?? "",
    cta_label: initial.cta_label ?? "",
    cta_url: initial.cta_url ?? "",
    align: (initial.align as "left" | "center" | "right") ?? "left",
    is_active: initial.is_active ?? true,
    sort_order: initial.sort_order ?? 0,
  });
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);
  const set = <K extends keyof BannerForm>(k: K, val: BannerForm[K]) =>
    setV({ ...v, [k]: val });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto bg-background p-8 shadow-2xl">
        <div className="flex items-start justify-between">
          <h2 className="font-serif text-2xl">{v.id ? "Editar banner" : "Nuevo banner"}</h2>
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
          <Field
            label="Imagen (URL o /products/…)"
            value={v.image}
            onChange={(x) => set("image", x)}
            required
            className="sm:col-span-2"
          />
          <Field label="Eyebrow (texto pequeño superior)" value={v.eyebrow} onChange={(x) => set("eyebrow", x)} className="sm:col-span-2" />
          <Field label="Título" value={v.title} onChange={(x) => set("title", x)} className="sm:col-span-2" />
          <div className="sm:col-span-2">
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Subtítulo</label>
            <textarea
              value={v.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
              rows={3}
              className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-wine"
            />
          </div>
          <Field label="Texto del botón" value={v.cta_label} onChange={(x) => set("cta_label", x)} />
          <Field label="URL del botón" value={v.cta_url} onChange={(x) => set("cta_url", x)} />
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Alineación</label>
            <select
              value={v.align}
              onChange={(e) => set("align", e.target.value as "left" | "center" | "right")}
              className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-wine"
            >
              <option value="left">Izquierda</option>
              <option value="center">Centro</option>
              <option value="right">Derecha</option>
            </select>
          </div>
          <FieldNumber label="Orden" value={v.sort_order} onChange={(n) => set("sort_order", n)} />
          <label className="flex items-center gap-2 self-end text-sm sm:col-span-2">
            <input type="checkbox" checked={v.is_active} onChange={(e) => set("is_active", e.target.checked)} />
            Banner activo (visible en el home)
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

// =================== Categorías ===================

type CategoryRow = Awaited<ReturnType<typeof adminListCategories>>[number];
type CategoryForm = {
  id?: string;
  slug: string;
  name: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
};

function CategoriesAdmin() {
  const list = useServerFn(adminListCategories);
  const save = useServerFn(upsertCategory);
  const del = useServerFn(deleteCategory);
  const qc = useQueryClient();

  const q = useQuery({ queryKey: ["admin", "categories"], queryFn: () => list() });
  const [editing, setEditing] = useState<Partial<CategoryRow> | null>(null);

  const saveM = useMutation({
    mutationFn: (data: CategoryForm) => save({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      qc.invalidateQueries({ queryKey: ["categories", "active"] });
      setEditing(null);
    },
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      qc.invalidateQueries({ queryKey: ["categories", "active"] });
    },
  });

  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-serif text-2xl">Categorías</h2>
        <button
          onClick={() => setEditing({})}
          className="inline-flex items-center gap-2 bg-wine px-5 py-3 text-[11px] uppercase tracking-[0.25em] text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Nueva categoría
        </button>
      </div>

      {q.isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : (q.data ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay categorías.</p>
      ) : (
        <div className="overflow-x-auto border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Orden</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(q.data ?? []).map((c) => (
                <tr key={c.id} className="border-t border-border/60">
                  <td className="p-3 font-serif">{c.name}</td>
                  <td className="p-3 text-xs text-muted-foreground">{c.slug}</td>
                  <td className="p-3 text-xs text-muted-foreground">{c.sort_order}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-[10px] uppercase tracking-wider ${
                        c.is_active ? "bg-secondary text-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {c.is_active ? "Activa" : "Oculta"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => setEditing(c)} aria-label="Editar" className="mr-2 p-2 hover:text-wine">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`¿Eliminar la categoría "${c.name}"?`)) deleteM.mutate(c.id);
                      }}
                      aria-label="Eliminar"
                      className="p-2 hover:text-wine"
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

      {deleteM.error instanceof Error && (
        <p className="mt-3 text-sm text-wine">{deleteM.error.message}</p>
      )}

      {editing && (
        <CategoryEditor
          initial={editing}
          onCancel={() => setEditing(null)}
          saving={saveM.isPending}
          error={saveM.error instanceof Error ? saveM.error.message : null}
          onSubmit={(v) => saveM.mutate(v)}
        />
      )}
    </section>
  );
}

function CategoryEditor({
  initial,
  onCancel,
  onSubmit,
  saving,
  error,
}: {
  initial: Partial<CategoryRow>;
  onCancel: () => void;
  onSubmit: (v: CategoryForm) => void;
  saving: boolean;
  error: string | null;
}) {
  const [v, setV] = useState<CategoryForm>({
    id: initial.id,
    slug: initial.slug ?? "",
    name: initial.name ?? "",
    image_url: initial.image_url ?? "",
    sort_order: initial.sort_order ?? 0,
    is_active: initial.is_active ?? true,
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const set = <K extends keyof CategoryForm>(k: K, val: CategoryForm[K]) =>
    setV({ ...v, [k]: val });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto bg-background p-8 shadow-2xl">
        <div className="flex items-start justify-between">
          <h2 className="font-serif text-2xl">{v.id ? "Editar categoría" : "Nueva categoría"}</h2>
          <button onClick={onCancel} aria-label="Cerrar" className="p-2 hover:text-wine">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(v);
          }}
          className="mt-6 grid gap-4"
        >
          <Field label="Nombre" value={v.name} onChange={(x) => set("name", x)} required />
          <Field
            label="Slug (URL — solo minúsculas, números y guiones)"
            value={v.slug}
            onChange={(x) => set("slug", x.toLowerCase())}
            required
          />
          <Field label="Imagen (URL, opcional)" value={v.image_url} onChange={(x) => set("image_url", x)} />
          <FieldNumber label="Orden" value={v.sort_order} onChange={(n) => set("sort_order", n)} />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={v.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
            />
            Categoría activa (visible en la tienda)
          </label>

          {error && <p className="text-sm text-wine">{error}</p>}

          <div className="mt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-3 text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-wine"
            >
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
// ---------- Promotions ----------

type PromoRow = Awaited<ReturnType<typeof adminListPromotions>>[number];
type PromoForm = {
  id?: string;
  name: string;
  kind: "percent" | "amount";
  value: number;
  starts_at: string;
  ends_at: string | null;
  is_active: boolean;
  product_id: string | null;
  priority: number;
};

function PromotionsAdmin({ products }: { products: Array<{ id: string; name: string }> }) {
  const list = useServerFn(adminListPromotions);
  const save = useServerFn(upsertPromotion);
  const del = useServerFn(deletePromotion);
  const qc = useQueryClient();

  const q = useQuery({ queryKey: ["admin", "promotions"], queryFn: () => list() });
  const [editing, setEditing] = useState<Partial<PromoRow> | null>(null);

  const saveM = useMutation({
    mutationFn: (data: PromoForm) => save({ data }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "promotions"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product"] });
      setEditing(null);
    },
  });
  const deleteM = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "promotions"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product"] });
    },
  });

  const fmtDate = (s: string | null | undefined) =>
    s ? new Date(s).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <section>
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="font-serif text-2xl">Promociones</h2>
        <button
          onClick={() => setEditing({})}
          className="inline-flex items-center gap-2 bg-wine px-5 py-3 text-[11px] uppercase tracking-[0.25em] text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Nueva promoción
        </button>
      </div>

      {q.isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando promociones…</p>
      ) : (q.data ?? []).length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin promociones aún.</p>
      ) : (
        <div className="overflow-x-auto border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
              <tr>
                <th className="p-3">Nombre</th>
                <th className="p-3">Descuento</th>
                <th className="p-3">Aplica a</th>
                <th className="p-3">Vigencia</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {(q.data ?? []).map((p) => {
                const prod = products.find((x) => x.id === p.product_id);
                const now = Date.now();
                const active =
                  p.is_active &&
                  new Date(p.starts_at).getTime() <= now &&
                  (!p.ends_at || new Date(p.ends_at).getTime() > now);
                return (
                  <tr key={p.id} className="border-t border-border/60">
                    <td className="p-3 font-serif">{p.name}</td>
                    <td className="p-3">
                      {p.kind === "percent" ? `${p.value}%` : formatCOP(p.value)}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {prod ? prod.name : "Todos los productos"}
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">
                      {fmtDate(p.starts_at)} → {fmtDate(p.ends_at)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 text-[10px] uppercase tracking-wider ${
                          active ? "bg-wine text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {active ? "Vigente" : p.is_active ? "Programada/expirada" : "Inactiva"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => setEditing(p)} aria-label="Editar" className="mr-2 p-2 hover:text-wine">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar "${p.name}"?`)) deleteM.mutate(p.id);
                        }}
                        aria-label="Eliminar"
                        className="p-2 hover:text-wine"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <PromotionEditor
          initial={editing}
          products={products}
          onCancel={() => setEditing(null)}
          saving={saveM.isPending}
          error={saveM.error instanceof Error ? saveM.error.message : null}
          onSubmit={(v) => saveM.mutate(v)}
        />
      )}
    </section>
  );
}

function PromotionEditor({
  initial,
  products,
  onCancel,
  onSubmit,
  saving,
  error,
}: {
  initial: Partial<PromoRow>;
  products: Array<{ id: string; name: string }>;
  onCancel: () => void;
  onSubmit: (v: PromoForm) => void;
  saving: boolean;
  error: string | null;
}) {
  const toLocalInput = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [v, setV] = useState<PromoForm>({
    id: initial.id,
    name: initial.name ?? "",
    kind: (initial.kind as "percent" | "amount") ?? "percent",
    value: initial.value ?? 10,
    starts_at: toLocalInput(initial.starts_at) || toLocalInput(new Date().toISOString()),
    ends_at: toLocalInput(initial.ends_at) || "",
    is_active: initial.is_active ?? true,
    product_id: initial.product_id ?? null,
    priority: initial.priority ?? 0,
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const set = <K extends keyof PromoForm>(k: K, val: PromoForm[K]) =>
    setV({ ...v, [k]: val });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto bg-background p-8 shadow-2xl">
        <div className="flex items-start justify-between">
          <h2 className="font-serif text-2xl">{v.id ? "Editar promoción" : "Nueva promoción"}</h2>
          <button onClick={onCancel} aria-label="Cerrar" className="p-2 hover:text-wine">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              ...v,
              starts_at: v.starts_at ? new Date(v.starts_at).toISOString() : new Date().toISOString(),
              ends_at: v.ends_at ? new Date(v.ends_at).toISOString() : null,
            });
          }}
          className="mt-6 grid gap-4 sm:grid-cols-2"
        >
          <Field label="Nombre" value={v.name} onChange={(x) => set("name", x)} required className="sm:col-span-2" />

          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Tipo</label>
            <select
              value={v.kind}
              onChange={(e) => set("kind", e.target.value as "percent" | "amount")}
              className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-wine"
            >
              <option value="percent">Porcentaje (%)</option>
              <option value="amount">Monto fijo (COP)</option>
            </select>
          </div>
          <FieldNumber
            label={v.kind === "percent" ? "Valor (%)" : "Valor (COP)"}
            value={v.value}
            onChange={(n) => set("value", n)}
            required
          />

          <div className="sm:col-span-2">
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Producto (vacío = aplica a todos)
            </label>
            <select
              value={v.product_id ?? ""}
              onChange={(e) => set("product_id", e.target.value || null)}
              className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-wine"
            >
              <option value="">— Todos los productos —</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Inicia</label>
            <input
              type="datetime-local"
              value={v.starts_at}
              onChange={(e) => set("starts_at", e.target.value)}
              required
              className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-wine"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Finaliza (vacío = sin fin)
            </label>
            <input
              type="datetime-local"
              value={v.ends_at ?? ""}
              onChange={(e) => set("ends_at", e.target.value || null)}
              className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-wine"
            />
          </div>

          <FieldNumber label="Prioridad" value={v.priority} onChange={(n) => set("priority", n)} />
          <label className="flex items-center gap-2 self-end text-sm">
            <input
              type="checkbox"
              checked={v.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
            />
            Promoción activa
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

function HomeSectionsAdmin() {
  const list = useServerFn(listSiteContent);
  const save = useServerFn(upsertSiteContent);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin", "site-content"], queryFn: () => list() });
  const [edit, setEdit] = useState<Record<string, string>>({});

  const saveM = useMutation({
    mutationFn: (v: { key: string; data: any }) => save({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "site-content"] });
      qc.invalidateQueries({ queryKey: ["site-content"] });
    },
  });

  if (q.isLoading) return <p className="text-sm text-muted-foreground">Cargando secciones…</p>;
  const data = q.data ?? {};
  const keys = ["home_pillars", "home_categories_section", "home_emotional", "home_featured", "home_benefits"];
  const labels: Record<string, string> = {
    home_pillars: "Pilares (4 ítems con icon: watch|gem|shield|bag|sparkles)",
    home_categories_section: "Sección Categorías (eyebrow, title)",
    home_emotional: "Banner Emocional (eyebrow, title, cta_label, cta_url, image)",
    home_featured: "Sección Destacados (eyebrow, title, cta_label, cta_url)",
    home_benefits: "Beneficios (3 ítems con icon: shield|sparkles|gem)",
  };

  return (
    <section>
      <h2 className="mb-6 font-serif text-2xl">Secciones Home</h2>
      <div className="space-y-6">
        {keys.map((k) => {
          const current = JSON.stringify(data[k] ?? {}, null, 2);
          const value = edit[k] ?? current;
          let isValid = true;
          try { JSON.parse(value); } catch { isValid = false; }
          return (
            <div key={k} className="border border-border/60 p-4">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{labels[k] || k}</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEdit((e) => ({ ...e, [k]: current }))}
                    className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-wine"
                  >
                    Restaurar
                  </button>
                  <button
                    type="button"
                    disabled={!isValid || saveM.isPending}
                    onClick={() => saveM.mutate({ key: k, data: JSON.parse(value) })}
                    className="bg-wine px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-primary-foreground hover:opacity-90 disabled:opacity-40"
                  >
                    Guardar
                  </button>
                </div>
              </div>
              <textarea
                value={value}
                onChange={(e) => setEdit((s) => ({ ...s, [k]: e.target.value }))}
                rows={10}
                className={`w-full border bg-transparent p-3 font-mono text-xs outline-none ${isValid ? "border-foreground/20 focus:border-wine" : "border-destructive"}`}
              />
              {!isValid && <p className="mt-1 text-xs text-destructive">JSON inválido</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}
