import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { Fragment, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Pencil, Trash2, Plus, LogOut, X } from "lucide-react";
import { WompiEnvBadge } from "@/components/WompiEnvBadge";
import { supabase } from "@/integrations/supabase/client";
import { ImageUpload } from "@/components/ImageUpload";
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
  adminListCoupons,
  upsertCoupon,
  deleteCoupon,
} from "@/lib/coupons.functions";
import {
  adminListSellers,
  upsertSeller,
  deleteSeller,
} from "@/lib/sellers.functions";
import {
  adminListOrders,
  updateOrderStatus,
  deleteOrder,
  adminGetMetrics,
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

      <DashboardAdmin />

      <div className="gold-divider my-12" />

      <BannersAdmin />

      <div className="gold-divider my-12" />

      <CategoriesAdmin />

      <div className="gold-divider my-12" />

      <PromotionsAdmin products={productsQ.data ?? []} />

      <div className="gold-divider my-12" />

      <CouponsAdmin />

      <div className="gold-divider my-12" />

      <SellersAdmin />

      <div className="gold-divider my-12" />

      <OrdersAdmin />

      <div className="gold-divider my-12" />

      <HomeSectionsAdmin />

      <div className="gold-divider my-12" />

      <GlobalSettingsAdmin />

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
              <span className="mx-3 text-foreground/30">·</span>
              <ImageUpload
                folder="products"
                label="↑ Subir desde mi PC"
                onUploaded={(url) => {
                  const next = [...v.images, { url, alt: "" }];
                  setV({ ...v, images: next, image: next[0]?.url ?? "" });
                }}
              />
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
  const listSells = useServerFn(adminListSellers);
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [refFilter, setRefFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const ordersQ = useQuery({ queryKey: ["admin", "orders"], queryFn: () => list() });
  const sellersQ = useQuery({ queryKey: ["admin", "sellers"], queryFn: () => listSells() });
  const sellersMap = new Map((sellersQ.data ?? []).map((s: any) => [s.id, s]));

  const updM = useMutation({
    mutationFn: (v: { id: string; status: (typeof ORDER_STATUSES)[number] }) =>
      upd({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "orders"] }),
  });
  const delM = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "orders"] }),
  });

  const allOrders = (ordersQ.data ?? []) as any[];
  const filtered = allOrders.filter((o) => {
    const ref = (o.wompi_reference || "").toLowerCase();
    const tx = (o.wompi_transaction_id || "").toLowerCase();
    const q = refFilter.trim().toLowerCase();
    const refOk = !q || ref.includes(q) || tx.includes(q);
    const statusOk = statusFilter === "all" || o.status === statusFilter;
    return refOk && statusOk;
  });

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h2 className="font-serif text-2xl">Pedidos</h2>
        <WompiEnvBadge />
      </div>
      <div className="mb-4 flex flex-wrap gap-3">
        <input
          value={refFilter}
          onChange={(e) => setRefFilter(e.target.value)}
          placeholder="Buscar referencia o tx Wompi…"
          className="flex-1 min-w-[240px] border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-wine"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-foreground/20 bg-transparent px-3 py-2 text-sm"
        >
          <option value="all">Todos los estados</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
        {(refFilter || statusFilter !== "all") && (
          <button
            onClick={() => { setRefFilter(""); setStatusFilter("all"); }}
            className="border border-foreground/20 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-wine"
          >
            Limpiar
          </button>
        )}
      </div>
      {ordersQ.isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando pedidos…</p>
      ) : allOrders.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aún no hay pedidos.</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sin pedidos para los filtros aplicados.</p>
      ) : (
        <div className="overflow-x-auto border border-border/60">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-left text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
              <tr>
                <th className="p-3">Fecha</th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Wompi</th>
                <th className="p-3">Total</th>
                <th className="p-3">Estado</th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o: any) => (
                <Fragment key={o.id}>
                  <tr className="border-t border-border/60">
                    <td className="p-3 text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString()}
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{o.customer_name}</div>
                      <div className="text-xs text-muted-foreground">{o.customer_email} · {o.customer_phone}</div>
                      <div className="text-xs text-muted-foreground">{o.city} — {o.address}</div>
                      {o.seller_id && (
                        <div className="mt-1 text-xs text-wine font-medium">
                          Asesor: <span className="uppercase font-semibold">{sellersMap.get(o.seller_id)?.name || "Cargando..."}</span> ({sellersMap.get(o.seller_id)?.code})
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-xs">
                      {o.wompi_reference ? (
                        <>
                          <div className="font-mono">{o.wompi_reference}</div>
                          {o.wompi_transaction_id && (
                            <div className="font-mono text-muted-foreground">tx: {o.wompi_transaction_id}</div>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
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
                      <td colSpan={6} className="p-4">
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
                            {o.seller_id && (
                              <>
                                {" · "}
                                <span className="text-wine font-medium">
                                  Comisión Asesor: {formatCOP(o.seller_commission_earned)}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="mt-2 border-t border-border/60 pt-3">
                            <div className="mb-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                              Webhook Wompi
                            </div>
                            {o.wompi_payload && Object.keys(o.wompi_payload).length > 0 ? (
                              <pre className="max-h-80 overflow-auto rounded bg-background/60 p-3 text-[11px] leading-relaxed">
{JSON.stringify(o.wompi_payload, null, 2)}
                              </pre>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                Aún no se ha recibido webhook para este pedido.
                              </p>
                            )}
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
          <div className="sm:col-span-2 -mt-2 flex items-center gap-3">
            {v.image && <img src={v.image} alt="" className="h-14 w-24 object-cover" />}
            <ImageUpload
              folder="banners"
              label={v.image ? "↑ Reemplazar imagen" : "↑ Subir desde mi PC"}
              onUploaded={(url) => set("image", url)}
            />
          </div>
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

function GlobalSettingsAdmin() {
  const list = useServerFn(listSiteContent);
  const save = useServerFn(upsertSiteContent);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin", "site-content"], queryFn: () => list() });
  const initial = (q.data?.global_settings ?? {}) as any;
  const [form, setForm] = useState<any | null>(null);
  const v = form ?? initial;
  const set = (k: string, val: any) => setForm({ ...(form ?? initial), [k]: val });

  const saveM = useMutation({
    mutationFn: () => save({ data: { key: "global_settings", data: v } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "site-content"] });
      qc.invalidateQueries({ queryKey: ["site-content"] });
      qc.invalidateQueries({ queryKey: ["global-settings"] });
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product"] });
      setForm(null);
    },
  });

  return (
    <section>
      <h2 className="mb-6 font-serif text-2xl">Configuración global</h2>
      <div className="grid gap-5 border border-border/60 p-5 md:grid-cols-2">
        <Labeled label="WhatsApp (con código país, sin +)">
          <input
            value={v.whatsapp ?? ""}
            onChange={(e) => set("whatsapp", e.target.value)}
            placeholder="573001234567"
            className="w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-wine"
          />
        </Labeled>
        <Labeled label="Mensaje WhatsApp por defecto">
          <input
            value={v.whatsapp_message ?? ""}
            onChange={(e) => set("whatsapp_message", e.target.value)}
            className="w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-wine"
          />
        </Labeled>
        <Labeled label="Anuncio superior del sitio (vacío = oculto)" className="md:col-span-2">
          <input
            value={v.announcement ?? ""}
            onChange={(e) => set("announcement", e.target.value)}
            placeholder="Envío gratis sobre $500.000"
            className="w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-wine"
          />
        </Labeled>
        <Labeled label="Descuento global (%)">
          <input
            type="number"
            min={0}
            max={99}
            value={v.global_discount_percent ?? 0}
            onChange={(e) => set("global_discount_percent", Number(e.target.value))}
            className="w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-wine"
          />
        </Labeled>
        <Labeled label="Activar descuento global">
          <label className="mt-2 inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={!!v.global_discount_active}
              onChange={(e) => set("global_discount_active", e.target.checked)}
            />
            Aplicar a todos los productos
          </label>
        </Labeled>
        <div className="md:col-span-2 flex justify-end">
          <button
            disabled={saveM.isPending}
            onClick={() => saveM.mutate()}
            className="bg-wine px-6 py-3 text-[11px] uppercase tracking-[0.25em] text-primary-foreground hover:opacity-90 disabled:opacity-40"
          >
            {saveM.isPending ? "Guardando…" : "Guardar configuración"}
          </button>
        </div>
      </div>
    </section>
  );
}

function CouponsAdmin() {
  const list = useServerFn(adminListCoupons);
  const save = useServerFn(upsertCoupon);
  const del = useServerFn(deleteCoupon);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin", "coupons"], queryFn: () => list() });
  const [editing, setEditing] = useState<any | null>(null);

  const saveM = useMutation({
    mutationFn: (v: any) => save({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "coupons"] });
      setEditing(null);
    },
  });
  const delM = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "coupons"] }),
  });

  return (
    <section>
      <div className="flex items-end justify-between">
        <h2 className="font-serif text-2xl">Cupones</h2>
        <button
          onClick={() => setEditing({ kind: "percent", value: 10, is_active: true, min_subtotal: 0 })}
          className="inline-flex items-center gap-2 bg-wine px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Nuevo cupón
        </button>
      </div>

      <div className="mt-6 overflow-x-auto border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
            <tr>
              <th className="p-3">Código</th>
              <th className="p-3">Descuento</th>
              <th className="p-3">Mín. compra</th>
              <th className="p-3">Usos</th>
              <th className="p-3">Vence</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(q.data ?? []).map((c: any) => (
              <tr key={c.id} className="border-t border-border/60">
                <td className="p-3 font-mono text-xs">{c.code}</td>
                <td className="p-3">
                  {c.kind === "percent" ? `${c.value}%` : formatCOP(c.value)}
                </td>
                <td className="p-3 text-muted-foreground">
                  {c.min_subtotal ? formatCOP(c.min_subtotal) : "—"}
                </td>
                <td className="p-3 text-muted-foreground">
                  {c.used_count}{c.max_uses ? ` / ${c.max_uses}` : ""}
                </td>
                <td className="p-3 text-muted-foreground">
                  {c.expires_at ? new Date(c.expires_at).toLocaleDateString("es-CO") : "—"}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-[10px] uppercase tracking-wider ${c.is_active ? "bg-secondary" : "bg-muted text-muted-foreground"}`}>
                    {c.is_active ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => setEditing(c)} className="mr-2 p-2 hover:text-wine" aria-label="Editar">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => { if (confirm(`¿Eliminar cupón ${c.code}?`)) delM.mutate(c.id); }}
                    className="p-2 hover:text-wine"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {(q.data ?? []).length === 0 && (
              <tr><td colSpan={7} className="p-6 text-center text-sm text-muted-foreground">No hay cupones aún.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <CouponEditor
          initial={editing}
          onCancel={() => setEditing(null)}
          onSubmit={(v) => saveM.mutate(v)}
          saving={saveM.isPending}
          error={saveM.error instanceof Error ? saveM.error.message : null}
        />
      )}
    </section>
  );
}

function CouponEditor({
  initial, onCancel, onSubmit, saving, error,
}: {
  initial: any;
  onCancel: () => void;
  onSubmit: (v: any) => void;
  saving: boolean;
  error: string | null;
}) {
  const [v, setV] = useState({
    id: initial.id,
    code: initial.code ?? "",
    kind: (initial.kind ?? "percent") as "percent" | "fixed",
    value: initial.value ?? 10,
    min_subtotal: initial.min_subtotal ?? 0,
    max_uses: initial.max_uses ?? null as number | null,
    expires_at: initial.expires_at ? String(initial.expires_at).slice(0, 10) : "",
    is_active: initial.is_active ?? true,
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto bg-background p-8 shadow-2xl">
        <div className="flex items-start justify-between">
          <h2 className="font-serif text-2xl">{v.id ? "Editar cupón" : "Nuevo cupón"}</h2>
          <button onClick={onCancel} aria-label="Cerrar" className="p-2 hover:text-wine">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              ...v,
              code: v.code.trim().toUpperCase(),
              value: Number(v.value),
              min_subtotal: Number(v.min_subtotal) || 0,
              max_uses: v.max_uses ? Number(v.max_uses) : null,
              expires_at: v.expires_at ? new Date(v.expires_at).toISOString() : null,
            });
          }}
          className="mt-6 grid gap-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Código</label>
            <input
              value={v.code}
              onChange={(e) => setV({ ...v, code: e.target.value.toUpperCase() })}
              required pattern="[A-Za-z0-9_-]+"
              className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm uppercase focus:border-wine"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Tipo</label>
            <select
              value={v.kind}
              onChange={(e) => setV({ ...v, kind: e.target.value as any })}
              className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-wine"
            >
              <option value="percent">Porcentaje (%)</option>
              <option value="fixed">Monto fijo (COP)</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Valor {v.kind === "percent" ? "(%)" : "(COP)"}
            </label>
            <input
              type="number" min={1} value={v.value}
              onChange={(e) => setV({ ...v, value: Number(e.target.value) })}
              className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-wine"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Mínimo compra (COP)</label>
            <input
              type="number" min={0} value={v.min_subtotal}
              onChange={(e) => setV({ ...v, min_subtotal: Number(e.target.value) })}
              className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-wine"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Usos máximos (opcional)</label>
            <input
              type="number" min={1} value={v.max_uses ?? ""}
              onChange={(e) => setV({ ...v, max_uses: e.target.value ? Number(e.target.value) : null })}
              className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-wine"
            />
          </div>
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Vence (opcional)</label>
            <input
              type="date" value={v.expires_at}
              onChange={(e) => setV({ ...v, expires_at: e.target.value })}
              className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm focus:border-wine"
            />
          </div>
          <label className="sm:col-span-2 flex items-center gap-2 text-sm">
            <input
              type="checkbox" checked={v.is_active}
              onChange={(e) => setV({ ...v, is_active: e.target.checked })}
            />
            Activo
          </label>

          {error && <p className="sm:col-span-2 text-sm text-destructive">{error}</p>}

          <div className="sm:col-span-2 mt-4 flex justify-end gap-3">
            <button type="button" onClick={onCancel} className="px-5 py-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-wine">
              Cancelar
            </button>
            <button
              type="submit" disabled={saving}
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

function SellersAdmin() {
  const list = useServerFn(adminListSellers);
  const save = useServerFn(upsertSeller);
  const del = useServerFn(deleteSeller);
  const listOrders = useServerFn(adminListOrders);
  const qc = useQueryClient();
  
  const q = useQuery({ queryKey: ["admin", "sellers"], queryFn: () => list() });
  const ordersQ = useQuery({ queryKey: ["admin", "orders"], queryFn: () => listOrders() });
  
  const [editing, setEditing] = useState<any | null>(null);

  const saveM = useMutation({
    mutationFn: (v: any) => save({ data: v }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "sellers"] });
      setEditing(null);
    },
  });
  const delM = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "sellers"] }),
  });

  const getSellerMetrics = (sellerId: string) => {
    const paidOrCompleted = (s: string) =>
      s === "paid" || s === "shipped" || s === "delivered" || s === "confirmed";
    const sellerOrders = (ordersQ.data ?? []).filter(
      (o: any) => o.seller_id === sellerId && paidOrCompleted(o.status)
    );
    const count = sellerOrders.length;
    const totalAmount = sellerOrders.reduce((sum: number, o: any) => sum + Number(o.total ?? 0), 0);
    const commission = sellerOrders.reduce((sum: number, o: any) => sum + Number(o.seller_commission_earned ?? 0), 0);
    return { count, totalAmount, commission };
  };

  return (
    <section>
      <div className="flex items-end justify-between">
        <div>
          <h2 className="font-serif text-2xl">Asesores / Vendedores</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Gestiona a tus asesores y haz seguimiento de sus ventas y comisiones generadas.
          </p>
        </div>
        <button
          onClick={() => setEditing({ active: true, commission_percent: 5 })}
          className="inline-flex items-center gap-2 bg-wine px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Nuevo Asesor
        </button>
      </div>

      <div className="mt-6 overflow-x-auto border border-border/60">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50 text-left text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Código</th>
              <th className="p-3">Comisión (%)</th>
              <th className="p-3">Ventas</th>
              <th className="p-3">Total Vendido</th>
              <th className="p-3">Comisión Acumulada</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(q.data ?? []).map((s: any) => {
              const metrics = getSellerMetrics(s.id);
              return (
                <tr key={s.id} className="border-t border-border/60">
                  <td className="p-3 font-medium">{s.name}</td>
                  <td className="p-3 font-mono text-xs text-wine">{s.code}</td>
                  <td className="p-3">{s.commission_percent}%</td>
                  <td className="p-3 text-muted-foreground">{metrics.count}</td>
                  <td className="p-3 font-medium">{formatCOP(metrics.totalAmount)}</td>
                  <td className="p-3 text-wine font-medium">{formatCOP(metrics.commission)}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 text-[10px] uppercase tracking-wider ${s.active ? "bg-secondary text-foreground" : "bg-muted text-muted-foreground"}`}>
                      {s.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button onClick={() => setEditing(s)} className="mr-2 p-2 hover:text-wine" aria-label="Editar">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => { if (confirm(`¿Eliminar al asesor ${s.name}?`)) delM.mutate(s.id); }}
                      className="p-2 hover:text-wine"
                      aria-label="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {(q.data ?? []).length === 0 && (
              <tr><td colSpan={8} className="p-6 text-center text-sm text-muted-foreground">No hay asesores creados aún.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {editing && (
        <SellerEditor
          initial={editing}
          onCancel={() => setEditing(null)}
          onSubmit={(v) => saveM.mutate(v)}
          saving={saveM.isPending}
          error={saveM.error instanceof Error ? saveM.error.message : null}
        />
      )}
    </section>
  );
}

function SellerEditor({
  initial, onCancel, onSubmit, saving, error,
}: {
  initial: any;
  onCancel: () => void;
  onSubmit: (v: any) => void;
  saving: boolean;
  error: string | null;
}) {
  const [v, setV] = useState({
    id: initial.id,
    name: initial.name ?? "",
    code: initial.code ?? "",
    commission_percent: initial.commission_percent ?? 5,
    active: initial.active ?? true,
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const set = <K extends keyof typeof v>(k: K, val: (typeof v)[K]) => setV({ ...v, [k]: val });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto bg-background p-8 shadow-2xl">
        <div className="flex items-start justify-between">
          <h3 className="font-serif text-2xl">{v.id ? "Editar asesor" : "Nuevo asesor"}</h3>
          <button onClick={onCancel} aria-label="Cerrar" className="p-2 hover:text-wine">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit({
              ...v,
              code: v.code.trim().toUpperCase(),
              commission_percent: Number(v.commission_percent) || 0,
            });
          }}
          className="mt-6 space-y-4"
        >
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Nombre completo</label>
            <input
              value={v.name}
              onChange={(e) => set("name", e.target.value)}
              required
              className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-wine"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Código de Asesor</label>
            <input
              value={v.code}
              onChange={(e) => set("code", e.target.value.toUpperCase())}
              required
              placeholder="Ej: MARIO, LORENA05"
              className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm uppercase outline-none focus:border-wine"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Porcentaje de Comisión (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              step={0.1}
              value={v.commission_percent}
              onChange={(e) => set("commission_percent", e.target.value)}
              required
              className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-wine"
            />
          </div>

          <label className="flex items-center gap-2 py-2 text-sm">
            <input
              type="checkbox"
              checked={v.active}
              onChange={(e) => set("active", e.target.checked)}
            />
            Asesor activo (puede recibir ventas)
          </label>

          {error && <p className="text-sm text-wine">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onCancel} className="px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-wine">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-wine px-6 py-2 text-[11px] uppercase tracking-[0.25em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Labeled({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function DashboardAdmin() {
  const metrics = useServerFn(adminGetMetrics);
  const q = useQuery({ queryKey: ["admin", "metrics"], queryFn: () => metrics() });

  if (q.isLoading) {
    return (
      <section>
        <h2 className="mb-6 font-serif text-2xl">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Cargando métricas…</p>
      </section>
    );
  }
  if (q.error || !q.data) {
    return (
      <section>
        <h2 className="mb-6 font-serif text-2xl">Dashboard</h2>
        <p className="text-sm text-destructive">Error cargando métricas.</p>
      </section>
    );
  }

  const { totals, ordersByStatus, days, topProducts, lowStock } = q.data;
  const maxRev = Math.max(1, ...days.map((d) => d.revenue));

  const cards: { label: string; value: string }[] = [
    { label: "Ingresos (total)", value: formatCOP(totals.revenueAll) },
    { label: "Ingresos · 30 días", value: formatCOP(totals.revenue30) },
    { label: "Ingresos · 7 días", value: formatCOP(totals.revenue7) },
    { label: "Pedidos totales", value: String(totals.ordersAll) },
    { label: "Pendientes", value: String(totals.pending) },
    { label: "Productos activos", value: String(totals.activeProducts) },
  ];

  return (
    <section>
      <h2 className="mb-6 font-serif text-2xl">Dashboard</h2>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <div key={c.label} className="border border-border/60 p-4">
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{c.label}</div>
            <div className="mt-2 font-serif text-lg">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="border border-border/60 p-5 lg:col-span-2">
          <h3 className="mb-4 text-sm uppercase tracking-[0.18em] text-muted-foreground">
            Ingresos · últimos 14 días
          </h3>
          <div className="flex h-40 items-end gap-1">
            {days.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1" title={`${d.date}: ${formatCOP(d.revenue)} · ${d.orders} pedidos`}>
                <div
                  className="w-full bg-wine/80"
                  style={{ height: `${(d.revenue / maxRev) * 100}%`, minHeight: d.revenue > 0 ? 2 : 0 }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
            <span>{days[0]?.date.slice(5)}</span>
            <span>{days[days.length - 1]?.date.slice(5)}</span>
          </div>
        </div>

        <div className="border border-border/60 p-5">
          <h3 className="mb-4 text-sm uppercase tracking-[0.18em] text-muted-foreground">Pedidos por estado</h3>
          <ul className="space-y-2 text-sm">
            {(["pending", "confirmed", "paid", "shipped", "delivered", "cancelled"] as const).map((s) => (
              <li key={s} className="flex items-center justify-between">
                <span className="text-muted-foreground">{STATUS_LABEL[s]}</span>
                <span className="font-medium">{ordersByStatus[s] ?? 0}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="border border-border/60 p-5">
          <h3 className="mb-4 text-sm uppercase tracking-[0.18em] text-muted-foreground">
            Top productos · 30 días
          </h3>
          {topProducts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin ventas aún.</p>
          ) : (
            <ul className="divide-y divide-border/60 text-sm">
              {topProducts.map((p, i) => (
                <li key={i} className="flex items-center justify-between py-2">
                  <span className="truncate pr-3">{p.name}</span>
                  <span className="shrink-0 text-muted-foreground">
                    {p.qty} uds · {formatCOP(p.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border border-border/60 p-5">
          <h3 className="mb-4 text-sm uppercase tracking-[0.18em] text-muted-foreground">Stock bajo</h3>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todo el inventario tiene stock saludable.</p>
          ) : (
            <ul className="divide-y divide-border/60 text-sm">
              {lowStock.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2">
                  <span className="truncate pr-3">{p.name}</span>
                  <span className={`shrink-0 ${(p.stock ?? 0) === 0 ? "text-destructive" : "text-wine"}`}>
                    {p.stock ?? 0} uds
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
