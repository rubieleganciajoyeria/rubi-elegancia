export function Footer() {
  return (
    <footer className="mt-32 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <div className="font-serif text-2xl tracking-[0.3em]">RUBÍ</div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Elegancia que trasciende. Relojería y joyería seleccionada para los momentos que importan.
            </p>
          </div>
          <FooterCol title="Tienda" items={["Relojería", "Joyería", "Novedades", "Promociones"]} />
          <FooterCol title="Ayuda" items={["Envíos", "Garantía", "Devoluciones", "Contacto"]} />
          <FooterCol title="Rubí" items={["Nuestra historia", "Atelier", "Prensa", "Boutiques"]} />
        </div>
        <div className="gold-divider mt-14" />
        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground md:flex-row">
          <span>© {new Date().getFullYear()} Rubí Relojería & Joyería. Todos los derechos reservados.</span>
          <span className="tracking-widest uppercase">Hecho con elegancia en Colombia</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="font-serif text-xs uppercase tracking-[0.25em] text-foreground/80">{title}</h4>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {items.map((i) => (
          <li key={i} className="hover:text-wine transition-colors cursor-pointer">{i}</li>
        ))}
      </ul>
    </div>
  );
}