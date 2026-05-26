import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getMyRole } from "@/lib/products.functions";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Acceder — Rubí" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        try {
          const role = await getMyRole();
          navigate({ to: role.isAdmin ? "/admin" : "/cuenta" });
        } catch {
          navigate({ to: "/cuenta" });
        }
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/cuenta" },
        });
        if (error) throw error;
        setSuccess("Cuenta creada con éxito. Por favor, verifica tu correo.");
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/auth/update-password",
        });
        if (error) throw error;
        setSuccess("Te hemos enviado un enlace para restablecer tu contraseña.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "login": return "Iniciar sesión";
      case "signup": return "Crear cuenta";
      case "forgot": return "Restablecer contraseña";
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <p className="text-[11px] uppercase tracking-[0.3em] text-muted-foreground">Acceso</p>
      <h1 className="mt-3 font-serif text-4xl">{getTitle()}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Panel de administración Rubí.</p>

      <form onSubmit={onSubmit} className="mt-10 space-y-4">
        <div>
          <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-wine"
          />
        </div>
        
        {mode !== "forgot" && (
          <div>
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Contraseña</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full border border-foreground/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-wine"
            />
          </div>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-wine px-6 py-3 text-[11px] uppercase tracking-[0.25em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Procesando..." : mode === "login" ? "Entrar" : mode === "signup" ? "Registrarse" : "Enviar instrucciones"}
        </button>
      </form>

      <div className="mt-6 flex flex-col gap-2 text-center text-xs text-muted-foreground">
        <button
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
            setSuccess(null);
          }}
          className="hover:text-wine"
        >
          {mode === "login" ? "¿No tienes cuenta? Regístrate" : "Ya tengo cuenta"}
        </button>
        {mode === "login" && (
          <button onClick={() => setMode("forgot")} className="hover:text-wine">
            ¿Olvidaste tu contraseña?
          </button>
        )}
      </div>

      <Link to="/" className="mt-4 text-center text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-wine">
        ← Volver a la tienda
      </Link>
    </div>
  );
}