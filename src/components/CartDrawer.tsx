import { Link } from "@tanstack/react-router";
import { Minus, Plus, X, ShoppingBag } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { formatCOP } from "@/data/products";

export function CartDrawer() {
  const { open, setOpen, items, setQty, remove, subtotal } = useCart();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="flex w-full flex-col bg-background sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-serif text-2xl tracking-wide">
            Tu selección
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" strokeWidth={1.2} />
            <p className="text-sm text-muted-foreground">
              Tu carrito está vacío.
            </p>
            <Link
              to="/catalogo"
              onClick={() => setOpen(false)}
              className="text-[11px] uppercase tracking-[0.25em] text-wine hover:underline"
            >
              Explorar colección
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-5 overflow-y-auto py-6">
              {items.map((i) => (
                <div key={i.id} className="flex gap-4">
                  <Link
                    to="/producto/$slug"
                    params={{ slug: i.slug }}
                    onClick={() => setOpen(false)}
                    className="h-24 w-20 flex-shrink-0 overflow-hidden bg-secondary"
                  >
                    <img src={i.image} alt={i.name} className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        to="/producto/$slug"
                        params={{ slug: i.slug }}
                        onClick={() => setOpen(false)}
                        className="font-serif text-base leading-snug hover:text-wine"
                      >
                        {i.name}
                      </Link>
                      <button
                        onClick={() => remove(i.id)}
                        aria-label="Quitar"
                        className="text-muted-foreground hover:text-wine"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-sm text-foreground/80">{formatCOP(i.price)}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center border border-foreground/20">
                        <button
                          onClick={() => setQty(i.id, i.qty - 1)}
                          className="px-2 py-1 hover:text-wine"
                          aria-label="Restar"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-[28px] text-center text-sm">{i.qty}</span>
                        <button
                          onClick={() => setQty(i.id, i.qty + 1)}
                          className="px-2 py-1 hover:text-wine"
                          aria-label="Sumar"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-sm font-medium">
                        {formatCOP(i.price * i.qty)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border/60 pt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="uppercase tracking-[0.2em] text-muted-foreground">
                  Subtotal
                </span>
                <span className="font-serif text-xl">{formatCOP(subtotal)}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Envío calculado en el checkout.
              </p>
              <Link
                to="/checkout"
                onClick={() => setOpen(false)}
                className="mt-5 flex w-full items-center justify-center bg-wine px-6 py-4 text-[11px] uppercase tracking-[0.25em] text-primary-foreground transition-opacity hover:opacity-90"
              >
                Finalizar compra
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="mt-2 w-full py-2 text-[11px] uppercase tracking-[0.25em] text-foreground/70 hover:text-wine"
              >
                Seguir comprando
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}