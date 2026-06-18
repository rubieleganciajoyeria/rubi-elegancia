export type Product = {
  id: string;
  slug: string;
  name: string;
  category: "relojeria" | "joyeria";
  categoryLabel: string;
  brand: string;
  color: string | null;
  colorId: string | null;
  material: string | null;
  materialId: string | null;
  usageType: string | null;
  usageTypeId: string | null;
  gender: string | null;
  genderId: string | null;
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
  color_id?: string | null;
  material_id?: string | null;
  usage_type_id?: string | null;
  gender_id?: string | null;
  color_ref?: { name: string } | null;
  material_ref?: { name: string } | null;
  usage_type_ref?: { name: string } | null;
  gender_ref?: { name: string } | null;
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
    color: row.color_ref?.name ?? null,
    colorId: row.color_id ?? null,
    material: row.material_ref?.name ?? null,
    materialId: row.material_id ?? null,
    usageType: row.usage_type_ref?.name ?? null,
    usageTypeId: row.usage_type_id ?? null,
    gender: row.gender_ref?.name ?? null,
    genderId: row.gender_id ?? null,
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