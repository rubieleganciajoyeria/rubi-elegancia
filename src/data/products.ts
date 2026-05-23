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
};

export function mapProduct(row: DbRow): Product {
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
    image: row.image,
    gallery: Array.isArray(row.gallery) ? (row.gallery as string[]) : [],
    description: row.description,
    warranty: row.warranty,
  };
}

export const formatCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);