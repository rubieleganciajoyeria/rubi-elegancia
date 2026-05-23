import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck, Truck, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatCOP } from "@/data/products";
import { useServerFn } from "@tanstack/react-start";
import { createWompiCheckout } from "@/lib/wompi.functions";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { getGlobalSettings } from "@/lib/site-content.functions";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Rubí" },
      { name: "description", content: "Finaliza tu compra de forma segura." },
    ],
  }),
  notFoundComponent: () => null,
  errorComponent: ({ reset }) => (
    <div className="mx-auto max-w-xl px-6 py-32 text-center">
      <h1 className="font-serif text-2xl">No pudimos cargar el checkout</h1>
      <button onClick={reset} className="mt-6 text-sm uppercase tracking-[0.25em] text-wine">
        Reintentar
      </button>
    </div>
  ),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const create = useServerFn(createWompiCheckout);
  const { data: settings } = useQuery({
    queryKey: ["global-settings"],
    queryFn: () => getGlobalSettings(),
    staleTime: 60_000,
  });
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    notes: "",
  });
  const shipping = subtotal > 0 && subtotal < 500000 ? 25000 : 0;
  const total = subtotal + shipping;

  const onChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { data: u } = await supabase.auth.getUser();
      const res = await create({
        data: {
          customer_name: form.name,
          customer_email: form.email,
          customer_phone: form.phone,
          city: form.city,
          address: form.address,
          notes: form.notes,
          user_id: u.user?.id ?? null,
          items: items.map((i) => ({ product_id: i.id, qty: i.qty })),
        },
      });
      clear();
      const redirectUrl = `${window.location.origin}${u.user ? "/cuenta" : "/"}`;
      const params = new URLSearchParams({
        "public-key": res.publicKey,
        currency: res.currency,
        "amount-in-cents": String(res.amountInCents),
        reference: res.reference,
        "signature:integrity": res.signature,
        "redirect-url": redirectUrl,
        "customer-data:email": form.email,
        "customer-data:full-name": form.name,
        "customer-data:phone-number": form.phone,
      });
      window.location.href = `https://checkout.wompi.co/p/?${params.toString()}`;
    } catch (err: any) {
      setError(err?.message ?? "No pudimos registrar tu pedido. Intenta nuevamente.");
      setSubmitting(false);
    }
  };

  const whatsappHref = () => {
    const wa = (settings?.whatsapp ?? "").replace(/\D/g, "");
    const intro = settings?.whatsapp_message?.trim() || "Hola Rubí, me interesa este pedido:";
    const lines = [
      intro,
      ...items.map((i) => `• ${i.name} x${i.qty} — ${formatCOP(i.price * i.qty)}`),
      ``,
      `Subtotal: ${formatCOP(subtotal)}`,
      `Envío: ${shipping === 0 ? "Gratis" : formatCOP(shipping)}`,
      `Total: ${formatCOP(total)}`,
    ];
    return `https://wa.me/${wa}?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-6 py-32 text-center">
        <h1 className="font-serif text-3xl">Tu carrito está vacío</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Explora la colección para encontrar tu próxima pieza.
        </p>
        <Link
          to="/catalogo"
          className="mt-8 inline-block bg-wine px-8 py-4 text-[11px] uppercase tracking-[0.25em] text-primary-foreground hover:opacity-90"
        >
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-14 md:px-10 md:py-20">
      <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Paso final</p>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl">Checkout</h1>
      <div className="gold-divider mt-6" />

      <div className="mt-12 grid gap-12 md:grid-cols-[1.3fr_1fr]">
        {/* Formulario */}
        <form onSubmit={onSubmit} className="space-y-8">
          <section>
            <h2 className="font-serif text-2xl">Datos de contacto</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Nombre completo" value={form.name} onChange={onChange("name")} required />
              <Field label="Correo electrónico" type="email" value={form.email} onChange={onChange("email")} required />
              <Field label="Teléfono" value={form.phone} onChange={onChange("phone")} required />
              <Field label="Ciudad" value={form.city} onChange={onChange("city")} required />
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl">Dirección de envío</h2>
            <div className="mt-5 grid gap-4">
              <Field label="Dirección" value={form.address} onChange={onChange("address")} required />
              <div>
                <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Notas (opcional)
                </label>
                <textarea
                  value={form.notes}
                  onChange={onChange("notes")}
                  rows={3}
                  className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-wine"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-serif text-2xl">Pago</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Pago seguro con Wompi. Aceptamos tarjetas, PSE, Nequi y Bancolombia. Serás redirigido para completar tu pago.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex w-full items-center justify-center bg-wine px-8 py-4 text-[11px] uppercase tracking-[0.25em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Redirigiendo a Wompi..." : `Pagar con Wompi · ${formatCOP(total)}`}
            </button>
            {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

            <a
              href={whatsappHref()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 border border-foreground/30 px-8 py-4 text-[11px] uppercase tracking-[0.25em] hover:border-wine hover:text-wine"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
              Comprar por WhatsApp
            </a>
          </section>
        </form>

        {/* Resumen */}
        <aside className="md:sticky md:top-28 md:self-start">
          <div className="border border-border/60 bg-secondary/30 p-6 md:p-8">
            <h2 className="font-serif text-2xl">Tu pedido</h2>
            <div className="mt-6 space-y-4">
              {items.map((i) => (
                <div key={i.id} className="flex gap-4">
                  <div className="h-20 w-16 flex-shrink-0 overflow-hidden bg-background">
                    <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="font-serif text-base leading-snug">{i.name}</span>
                    <span className="text-xs text-muted-foreground">Cantidad: {i.qty}</span>
                    <span className="mt-auto text-sm">{formatCOP(i.price * i.qty)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="gold-divider my-6" />

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatCOP(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Envío</dt>
                <dd>{shipping === 0 ? "Gratis" : formatCOP(shipping)}</dd>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-3 text-base">
                <dt className="font-medium">Total</dt>
                <dd className="font-serif text-xl">{formatCOP(total)}</dd>
              </div>
            </dl>

            <ul className="mt-6 space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-wine" strokeWidth={1.4} /> Envío nacional asegurado
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-wine" strokeWidth={1.4} /> Pieza certificada y garantía
              </li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  required,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
        {required ? " *" : ""}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-wine"
      />
    </div>
  );
}