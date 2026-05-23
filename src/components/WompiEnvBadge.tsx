import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { FlaskConical, Globe, AlertTriangle } from "lucide-react";
import { getWompiEnvironment } from "@/lib/wompi.functions";

export function WompiEnvBadge({ className = "" }: { className?: string }) {
  const fn = useServerFn(getWompiEnvironment);
  const { data } = useQuery({
    queryKey: ["wompi-env"],
    queryFn: () => fn(),
    staleTime: 5 * 60_000,
  });
  if (!data) return null;

  if (!data.configured) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 border border-destructive/50 bg-destructive/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-destructive ${className}`}
      >
        <AlertTriangle className="h-3 w-3" /> Wompi no configurado
      </span>
    );
  }

  const isSandbox = data.environment === "sandbox";
  const isProd = data.environment === "production";
  const Icon = isSandbox ? FlaskConical : isProd ? Globe : AlertTriangle;
  const label = isSandbox ? "Wompi · Sandbox" : isProd ? "Wompi · Producción" : "Wompi · Desconocido";
  const styles = isSandbox
    ? "border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-400"
    : isProd
      ? "border-emerald-600/50 bg-emerald-600/10 text-emerald-700 dark:text-emerald-400"
      : "border-foreground/30 text-muted-foreground";

  return (
    <span
      className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] ${styles} ${className}`}
      title={isSandbox ? "Pagos de prueba — no se cobra dinero real" : isProd ? "Pagos reales en producción" : ""}
    >
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}