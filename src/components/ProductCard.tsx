import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { formatCOP, type Product } from "@/data/products";
import { useWishlist } from "@/context/WishlistContext";

export function ProductCard({ product }: { product: Product }) {
  const hasDiscount = !!product.discountPrice;
  const soldOut = product.stock !== null && product.stock <= 0;
  const { has, toggle } = useWishlist();
  const fav = has(product.id);
  return (
    <Link
      to="/producto/$slug"
      params={{ slug: product.slug }}
      className="group block"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={1000}
          height={1200}
          className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
        />
        {hasDiscount && (
          <span className="absolute left-3 top-3 bg-wine px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-primary-foreground">
            Oferta
          </span>
        )}
        {soldOut && (
          <span className="absolute left-3 top-3 bg-foreground/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] text-background">
            Agotado
          </span>
        )}
        <button
          type="button"
          aria-label={fav ? "Quitar de favoritos" : "Agregar a favoritos"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle(product.id);
          }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/85 backdrop-blur transition-colors hover:text-wine"
        >
          <Heart
            className="h-4 w-4"
            strokeWidth={1.5}
            fill={fav ? "currentColor" : "none"}
            color={fav ? "var(--wine, #7a1f2b)" : undefined}
          />
        </button>
      </div>
      <div className="mt-5 space-y-1.5">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          {product.categoryLabel}
        </p>
        <h3 className="font-serif text-lg leading-snug text-foreground transition-colors group-hover:text-wine">
          {product.name}
        </h3>
        <div className="flex items-baseline gap-2 pt-1">
          {hasDiscount ? (
            <>
              <span className="text-sm font-medium text-wine">{formatCOP(product.discountPrice!)}</span>
              <span className="text-xs text-muted-foreground line-through">{formatCOP(product.price)}</span>
            </>
          ) : (
            <span className="text-sm font-medium text-foreground">{formatCOP(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}