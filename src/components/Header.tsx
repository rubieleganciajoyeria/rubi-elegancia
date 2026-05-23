import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag, User, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export function Header() {
  const { count, setOpen } = useCart();
  const { ids } = useWishlist();
  const favCount = ids.length;
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:h-20 md:px-10">
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

        <Link to="/" className="flex flex-1 items-center justify-center md:flex-none">
          <span className="font-serif text-2xl tracking-[0.3em] text-foreground md:text-3xl">
            RUBÍ
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-end gap-5 text-foreground/80">
          <button aria-label="Buscar" className="hidden hover:text-wine md:block">
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
          <Link to="/login" aria-label="Cuenta" className="hidden hover:text-wine md:block">
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
    </header>
  );
}