import { createFileRoute, redirect, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getMyAccount, updateMyProfile } from "@/lib/account.functions";
import { formatCOP } from "@/data/products";

export const Route = createFileRoute("/cuenta")({
  head: () => ({ meta: [{ title: "Mi cuenta — Rubí" }] }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/login" });
  },
  component: AccountPage,
});

const STATUS_LABEL: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  paid: "Pagado",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

function AccountPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const account = useServerFn(getMyAccount);
  const save = useServerFn(updateMyProfile);

  const accountQ = useQuery({ queryKey: ["my-account"], queryFn: () => account() });

  const [form, setForm] = useState({ full_name: "", phone: "", city: "", address: "" });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (accountQ.data?.profile) {
      setForm({
        full_name: accountQ.data.profile.full_name ?? "",
        phone: accountQ.data.profile.phone ?? "",
        city: accountQ.data.profile.city ?? "",
        address: accountQ.data.profile.address ?? "",
      });
    }
  }, [accountQ.data?.profile]);

  const saveM = useMutation({
    mutationFn: () => save({ data: form }),
    onSuccess: () => {
      setSaved(true);
      qc.invalidateQueries({ queryKey: ["my-account"] });
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const orders = accountQ.data?.orders ?? [];

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 md:px-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Mi cuenta</p>
          <h1 className="mt-3 font-serif text-4xl">Hola{form.full_name ? `, ${form.full_name.split(" ")[0]}` : ""}</h1>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/" });
          }}
          aria-label="Cerrar sesión"
          className="flex items-center gap-2 border border-foreground/30 px-4 py-2 text-[11px] uppercase tracking-[0.2em] hover:border-wine hover:text-wine"
        >
          <LogOut className="h-4 w-4" /> Salir
        </button>
      </div>

      <div className="gold-divider my-10" />

      <section>
        <h2 className="mb-6 font-serif text-2xl">Mis datos</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveM.mutate();
          }}
          className="grid gap-4 md:grid-cols-2"
        >
          <Field label="Nombre completo">
            <input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-wine"
            />
          </Field>
          <Field label="Teléfono">
            <input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-wine"
            />
          </Field>
          <Field label="Ciudad">
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className="w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-wine"
            />
          </Field>
          <Field label="Dirección" className="md:col-span-2">
            <input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-wine"
            />
          </Field>
          <div className="flex items-center gap-4 md:col-span-2">
            <button
              type="submit"
              disabled={saveM.isPending}
              className="bg-wine px-6 py-3 text-[11px] uppercase tracking-[0.25em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {saveM.isPending ? "Guardando…" : "Guardar"}
            </button>
            {saved && <span className="text-xs text-muted-foreground">Guardado ✓</span>}
            {saveM.error && <span className="text-xs text-destructive">Error al guardar</span>}
          </div>
        </form>
      </section>

      <div className="gold-divider my-12" />

      <section>
        <h2 className="mb-6 font-serif text-2xl">Mis pedidos</h2>
        {accountQ.isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando…</p>
        ) : orders.length === 0 ? (
          <div className="border border-border/60 p-10 text-center">
            <p className="text-sm text-muted-foreground">Aún no tienes pedidos.</p>
            <Link
              to="/catalogo"
              className="mt-6 inline-block bg-wine px-8 py-3 text-[11px] uppercase tracking-[0.25em] text-primary-foreground hover:opacity-90"
            >
              Ver catálogo
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {orders.map((o: any) => (
              <li key={o.id} className="border border-border/60 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                      Pedido · {new Date(o.created_at).toLocaleDateString("es-CO")}
                    </p>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">#{String(o.id).slice(0, 8)}</p>
                  </div>
                  <span className="border border-foreground/30 px-3 py-1 text-[10px] uppercase tracking-[0.2em]">
                    {STATUS_LABEL[o.status] ?? o.status}
                  </span>
                </div>
                <ul className="mt-4 divide-y divide-border/60 text-sm">
                  {(o.order_items ?? []).map((it: any) => (
                    <li key={it.id} className="flex items-center gap-3 py-3">
                      {it.product_image && (
                        <img src={it.product_image} alt="" className="h-12 w-12 object-cover" />
                      )}
                      <div className="flex-1">
                        <p className="truncate">{it.product_name}</p>
                        <p className="text-xs text-muted-foreground">x{it.qty}</p>
                      </div>
                      <p className="text-sm">{formatCOP(it.subtotal)}</p>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex justify-between border-t border-border/60 pt-3 text-sm">
                  <span className="text-muted-foreground">
                    Envío: {o.shipping === 0 ? "Gratis" : formatCOP(o.shipping)}
                  </span>
                  <span className="font-serif text-base">Total: {formatCOP(o.total)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}