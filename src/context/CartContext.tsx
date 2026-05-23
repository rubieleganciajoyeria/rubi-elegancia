import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { Product } from "@/data/products";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  image: string;
  price: number; // unit price (already with discount applied)
  qty: number;
  stock: number | null;
};

type CartState = {
  items: CartItem[];
  open: boolean;
  setOpen: (v: boolean) => void;
  add: (p: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const Ctx = createContext<CartState | null>(null);
const STORAGE_KEY = "rubi.cart.v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const add = (p: Product, qty = 1) => {
    const unit = p.discountPrice ?? p.price;
    const max = p.stock;
    if (max !== null && max <= 0) {
      toast.error(`${p.name} está agotado`);
      return;
    }
    setItems((prev) => {
      const found = prev.find((i) => i.id === p.id);
      if (found) {
        return prev.map((i) =>
          i.id === p.id
            ? { ...i, qty: max === null ? i.qty + qty : Math.min(i.qty + qty, max), stock: max }
            : i,
        );
      }
      return [
        ...prev,
        {
          id: p.id,
          slug: p.slug,
          name: p.name,
          image: p.image,
          price: unit,
          qty: max === null ? qty : Math.min(qty, max),
          stock: max,
        },
      ];
    });
    setOpen(true);
    toast.success("Agregado al carrito", { description: p.name });
  };

  const remove = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  const setQty = (id: string, qty: number) =>
    setItems((prev) =>
      prev
        .map((i) =>
          i.id === id
            ? {
                ...i,
                qty:
                  i.stock === null
                    ? Math.max(0, qty)
                    : Math.max(0, Math.min(qty, i.stock)),
              }
            : i,
        )
        .filter((i) => i.qty > 0)
    );
  const clear = () => setItems([]);

  const value = useMemo<CartState>(
    () => ({
      items,
      open,
      setOpen,
      add,
      remove,
      setQty,
      clear,
      count: items.reduce((a, i) => a + i.qty, 0),
      subtotal: items.reduce((a, i) => a + i.qty * i.price, 0),
    }),
    [items, open]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}