import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ShoppingBag, User, Heart, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import rubiLogo from "@/assets/rubi-logo.jpg";

export function Header() {
  const { count, setOpen } = useCart();
  const { ids } = useWishlist();
  const favCount = ids.length;
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [q, setQ] = useState("");
  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    navigate({ to: "/catalogo", search: { q: term.length > 0 ? term : undefined } as never });
    setSearchOpen(false);
    setMenuOpen(false);
  };
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="bg-wine text-background">
        <p className="mx-auto max-w-7xl px-6 py-1.5 text-center text-[10px] uppercase tracking-[0.4em] md:px-10">
          Elegancia que trasciende
        </p>
      </div>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:h-20 md:px-10">
        <button
          aria-label="Menú"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex-1 text-left hover:text-wine md:hidden"
        >
          {menuOpen ? <X className="h-5 w-5" strokeWidth={1.4} /> : <Menu className="h-5 w-5" strokeWidth={1.4} />}
        </button>
        <nav className="hidden flex-1 items-center gap-8 text-[0.78rem] uppercase tracking-[0.18em] text-foreground/80 md:flex">
          <Link to="/catalogo" search={{ cat: "relojeria" } as never} className="hover:text-wine transition-colors">
            Relojería
          </Link>
          <Link to="/catalogo" search={{ cat: "joyeria" } as never} className="hover:text-wine transition-colors">
            Joyería
          </Link>
          <Link to="/catalogo" className="hover:text-wine transition-colors">
            Colección
          </Link>
        </nav>

        <Link to="/" aria-label="Rubí — Inicio" className="flex flex-1 items-center justify-center md:flex-none">
          <img src={rubiLogo} alt="Rubí Relojería & Joyería" className="h-[62px] w-auto md:h-[73px]" />
        </Link>

        <div className="flex flex-1 items-center justify-end gap-5 text-foreground/80">
          <button
            aria-label="Buscar"
            onClick={() => { setSearchOpen((v) => !v); setMenuOpen(false); }}
            className="hover:text-wine"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={1.4} />
          </button>
          <Link to="/favoritos" aria-label="Favoritos" className="relative hidden hover:text-wine md:block">
            <Heart className="h-[18px] w-[18px]" strokeWidth={1.4} />
            {favCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-wine text-[10px] font-medium text-primary-foreground">
                {favCount}
              </span>
            )}
          </Link>
          <Link to="/cuenta" aria-label="Mi cuenta" className="hidden hover:text-wine md:block">
            <User className="h-[18px] w-[18px]" strokeWidth={1.4} />
          </Link>
          <button
            aria-label="Carrito"
            onClick={() => setOpen(true)}
            className="relative hover:text-wine"
          >
            <ShoppingBag className="h-[19px] w-[19px]" strokeWidth={1.4} />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-wine text-[10px] font-medium text-primary-foreground">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-6 py-4 text-sm uppercase tracking-[0.2em] text-foreground/80">
            <Link to="/catalogo" search={{ cat: "relojeria" } as never} onClick={() => setMenuOpen(false)} className="py-3 hover:text-wine">Relojería</Link>
            <Link to="/catalogo" search={{ cat: "joyeria" } as never} onClick={() => setMenuOpen(false)} className="py-3 hover:text-wine">Joyería</Link>
            <Link to="/catalogo" onClick={() => setMenuOpen(false)} className="py-3 hover:text-wine">Colección</Link>
            <div className="my-2 h-px bg-border/60" />
            <Link to="/favoritos" onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-3 hover:text-wine">
              <span>Favoritos</span>
              {favCount > 0 && <span className="text-[10px] text-wine">{favCount}</span>}
            </Link>
            <Link to="/cuenta" onClick={() => setMenuOpen(false)} className="py-3 hover:text-wine">Mi cuenta</Link>
          </nav>
        </div>
      )}
      {searchOpen && (
        <div className="border-t border-border/60 bg-background">
          <form onSubmit={submitSearch} className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-3 md:px-10">
            <Search className="h-4 w-4 text-muted-foreground" strokeWidth={1.4} />
            <input
              autoFocus
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar piezas, marcas, materiales…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="text-[11px] uppercase tracking-[0.25em] text-wine hover:opacity-80"
            >
              Buscar
            </button>
          </form>
        </div>
      )}
    </header>
  );
}