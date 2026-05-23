export type Product = {
  id: string;
  slug: string;
  name: string;
  category: "relojeria" | "joyeria";
  categoryLabel: string;
  brand: string;
  material: string;
  price: number;
  discountPrice?: number;
  image: string;
  gallery: string[];
  description: string;
  warranty: string;
  stock: number | null; // null = ilimitado
};

// Mapeador de fila de BD → tipo Product usado por la UI
type DbRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  category_label: string;
  brand: string;
  material: string;
  price: number;
  discount_price: number | null;
  image: string;
  gallery: unknown;
  description: string;
  warranty: string;
  stock?: number | null;
  product_images?: Array<{ url: string; sort_order: number; is_primary: boolean }> | null;
};

export function mapProduct(row: DbRow): Product {
  const imgs = Array.isArray(row.product_images) ? [...row.product_images] : [];
  imgs.sort((a, b) => a.sort_order - b.sort_order);
  const orderedUrls = imgs.map((i) => i.url);
  const legacyGallery = Array.isArray(row.gallery) ? (row.gallery as string[]) : [];
  const gallery = orderedUrls.length > 0 ? orderedUrls : [row.image, ...legacyGallery].filter(Boolean);
  const primary = gallery[0] ?? row.image ?? "";
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: (row.category as "relojeria" | "joyeria") ?? "relojeria",
    categoryLabel: row.category_label,
    brand: row.brand,
    material: row.material,
    price: row.price,
    discountPrice: row.discount_price ?? undefined,
    image: primary,
    gallery,
    description: row.description,
    warranty: row.warranty,
    stock: typeof row.stock === "number" ? row.stock : null,
  };
}

export const formatCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);