import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth/update-password")({
  head: () => ({
    meta: [{ title: "Nueva contraseña — Rubí" }],
  }),
  component: UpdatePasswordPage,
});

function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [success, setSuccess] = useState(false);

  // Supabase redirige aquí con un token en la URL hash.
  // Necesitamos esperar a que el cliente de Supabase lo procese.
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSuccess(true);
      setTimeout(() => navigate({ to: "/login" }), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Seguridad</p>
      <h1 className="mt-3 font-serif text-4xl">Nueva contraseña</h1>
      <p className="mt-2 text-sm text-muted-foreground">Ingresa tu nueva contraseña para continuar.</p>

      {success ? (
        <div className="mt-10 space-y-4">
          <div className="border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800">
            ✓ ¡Contraseña actualizada con éxito! Serás redirigido al inicio de sesión en unos segundos.
          </div>
          <Link
            to="/login"
            className="block text-center text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-wine"
          >
            Ir al inicio de sesión
          </Link>
        </div>
      ) : !ready ? (
        <div className="mt-10 space-y-4">
          <div className="border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
            Procesando tu enlace de restablecimiento... Si llegaste aquí por error, ve al{" "}
            <Link to="/login" className="underline hover:text-wine">
              inicio de sesión
            </Link>
            .
          </div>
          <p className="text-center text-xs text-muted-foreground animate-pulse">
            Esperando verificación del enlace...
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-10 space-y-4">
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Nueva contraseña
            </label>
            <input
              id="new-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-wine"
            />
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              Confirmar contraseña
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repite tu nueva contraseña"
              className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-wine"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            id="update-password-submit"
            type="submit"
            disabled={loading}
            className="w-full bg-wine px-6 py-3 text-[11px] uppercase tracking-[0.25em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Actualizando..." : "Guardar nueva contraseña"}
          </button>
        </form>
      )}

      {!success && (
        <Link
          to="/login"
          className="mt-6 text-center text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-wine"
        >
          ← Volver al inicio de sesión
        </Link>
      )}
    </div>
  );
}
