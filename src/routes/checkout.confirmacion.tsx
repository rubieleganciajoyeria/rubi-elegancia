import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { CheckCircle2, XCircle, Loader2, RotateCw } from "lucide-react";
import { getOrderPaymentStatus, retryWompiPayment } from "@/lib/wompi.functions";
import { formatCOP } from "@/data/products";
import { WompiEnvBadge } from "@/components/WompiEnvBadge";

type Search = { ref?: string; id?: string };

export const Route = createFileRoute("/checkout/confirmacion")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    ref: typeof s.ref === "string" ? s.ref : undefined,
    id: typeof s.id === "string" ? s.id : undefined,
  }),
  head: () => ({ meta: [{ title: "Confirmación de pago — Rubí" }] }),
  component: ConfirmationPage,
});

function ConfirmationPage() {
  const { ref } = Route.useSearch();
  const getStatus = useServerFn(getOrderPaymentStatus);
  const retry = useServerFn(retryWompiPayment);
  const [retrying, setRetrying] = useState(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ["order-status", ref],
    queryFn: () => (ref ? getStatus({ data: { reference: ref } }) : null),
    enabled: !!ref,
    refetchInterval: (query) => {
      const s = (query.state.data as any)?.status;
      return s && s !== "pending" ? false : 4000;
    },
  });

  const onRetry = async () => {
    if (!ref) return;
    setRetrying(true);
    setRetryError(null);
    try {
      const res = await retry({ data: { reference: ref } });
      const redirectUrl = `${window.location.origin}/checkout/confirmacion?ref=${encodeURIComponent(res.reference)}`;
      const params = new URLSearchParams({
        "public-key": res.publicKey,
        currency: res.currency,
        "amount-in-cents": String(res.amountInCents),
        reference: res.reference,
        "signature:integrity": res.signature,
        "redirect-url": redirectUrl,
      });
      window.location.href = `https://checkout.wompi.co/p/?${params.toString()}`;
    } catch (err: any) {
      setRetryError(err?.message ?? "No pudimos reintentar el pago.");
      setRetrying(false);
    }
  };

  if (!ref) {
    return (
      <Wrap>
        <h1 className="font-serif text-3xl">Falta la referencia del pago</h1>
        <p className="mt-3 text-sm text-muted-foreground">No encontramos la referencia en la URL.</p>
        <HomeLink />
      </Wrap>
    );
  }

  if (q.isLoading) {
    return (
      <Wrap>
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-wine" />
        <p className="mt-4 text-sm text-muted-foreground">Consultando tu pedido…</p>
      </Wrap>
    );
  }

  const order = q.data;
  if (!order) {
    return (
      <Wrap>
        <h1 className="font-serif text-3xl">Pedido no encontrado</h1>
        <p className="mt-3 text-sm text-muted-foreground">Ref: {ref}</p>
        <HomeLink />
      </Wrap>
    );
  }

  const status = order.status as string;
  const isApproved = status === "paid" || status === "confirmed" || status === "shipped" || status === "delivered";
  const isRejected = status === "cancelled";
  const isPending = !isApproved && !isRejected;

  return (
    <Wrap>
      <div className="mb-6 flex justify-center">
        <WompiEnvBadge />
      </div>
      {isPending && (
        <>
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-wine" />
          <h1 className="mt-6 font-serif text-3xl">Pago pendiente</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Estamos esperando la confirmación de Wompi. Esta página se actualiza automáticamente.
          </p>
        </>
      )}
      {isApproved && (
        <>
          <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
          <h1 className="mt-6 font-serif text-3xl">¡Pago aprobado!</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Te enviaremos la confirmación a {order.customer_email}.
          </p>
        </>
      )}
      {isRejected && (
        <>
          <XCircle className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-6 font-serif text-3xl">Pago rechazado</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            La transacción no fue aprobada. Puedes intentar de nuevo.
          </p>
        </>
      )}

      <div className="mt-8 border-y border-border/60 py-4 text-left text-sm">
        <Row label="Referencia">{order.wompi_reference}</Row>
        {order.wompi_transaction_id && <Row label="Transacción">{order.wompi_transaction_id}</Row>}
        <Row label="Total">{formatCOP(Number(order.total))}</Row>
        <Row label="Estado">{statusLabel(status)}</Row>
      </div>

      <div className="mt-8 flex flex-col items-center gap-3">
        {isRejected && (
          <button
            onClick={onRetry}
            disabled={retrying}
            className="inline-flex items-center gap-2 bg-wine px-8 py-3 text-[11px] uppercase tracking-[0.25em] text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            <RotateCw className="h-4 w-4" />
            {retrying ? "Redirigiendo…" : "Reintentar pago"}
          </button>
        )}
        {retryError && <p className="text-xs text-destructive">{retryError}</p>}
        <HomeLink />
      </div>
    </Wrap>
  );
}

function Wrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-20 text-center md:px-10">{children}</div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <span className="font-mono text-xs">{children}</span>
    </div>
  );
}

function HomeLink() {
  return (
    <Link
      to="/"
      className="mt-2 text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-wine"
    >
      Volver al inicio
    </Link>
  );
}

function statusLabel(s: string) {
  return (
    {
      pending: "Pendiente",
      confirmed: "Confirmado",
      paid: "Pagado",
      shipped: "Enviado",
      delivered: "Entregado",
      cancelled: "Rechazado",
    } as Record<string, string>
  )[s] ?? s;
}