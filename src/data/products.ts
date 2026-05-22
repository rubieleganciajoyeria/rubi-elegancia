import p1 from "@/assets/product-1.jpg";
import p2 from "@/assets/product-2.jpg";
import p3 from "@/assets/product-3.jpg";
import p4 from "@/assets/product-4.jpg";
import p5 from "@/assets/product-5.jpg";
import p6 from "@/assets/product-6.jpg";

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

export const products: Product[] = [
  {
    id: "1",
    slug: "cronografo-celeste",
    name: "Cronógrafo Celeste",
    category: "relojeria",
    categoryLabel: "Relojería",
    brand: "Rubí Atelier",
    material: "Acero inoxidable 316L",
    price: 1290000,
    discountPrice: 1090000,
    image: p1,
    gallery: [p1, p2, p6],
    description:
      "Un cronógrafo de líneas puras y movimiento preciso. La esfera plateada captura la luz como un eco discreto del tiempo que pasa.",
    warranty: "2 años de garantía oficial",
  },
  {
    id: "2",
    slug: "heritage-dorado",
    name: "Heritage Dorado",
    category: "relojeria",
    categoryLabel: "Relojería",
    brand: "Rubí Atelier",
    material: "Caja en oro 18k, correa cuero italiano",
    price: 1850000,
    image: p2,
    gallery: [p2, p1, p6],
    description:
      "Inspirado en la elegancia atemporal. Caja dorada y correa de cuero curtido a mano para acompañar cada momento importante.",
    warranty: "3 años de garantía oficial",
  },
  {
    id: "3",
    slug: "anillo-aurora",
    name: "Anillo Aurora",
    category: "joyeria",
    categoryLabel: "Joyería",
    brand: "Rubí Collection",
    material: "Oro 18k con diamantes naturales",
    price: 2450000,
    discountPrice: 2190000,
    image: p3,
    gallery: [p3, p5, p4],
    description:
      "Una pieza icónica: el diamante central rodeado por una halo de gemas pequeñas que refractan la luz en todos los ángulos.",
    warranty: "Garantía de por vida en la pieza",
  },
  {
    id: "4",
    slug: "pulsera-carmesi",
    name: "Pulsera Carmesí",
    category: "joyeria",
    categoryLabel: "Joyería",
    brand: "Rubí Collection",
    material: "Oro 18k con rubí natural",
    price: 1690000,
    image: p4,
    gallery: [p4, p3, p5],
    description:
      "Cadena dorada delicada con un rubí rojo profundo. Pensada para celebrar momentos que merecen recordarse.",
    warranty: "5 años de garantía",
  },
  {
    id: "5",
    slug: "aretes-perla",
    name: "Aretes Perla",
    category: "joyeria",
    categoryLabel: "Joyería",
    brand: "Rubí Collection",
    material: "Oro 18k con perlas naturales",
    price: 890000,
    discountPrice: 790000,
    image: p5,
    gallery: [p5, p3, p4],
    description:
      "Perlas naturales en montura dorada minimalista. Una joya versátil para el día a día o las ocasiones especiales.",
    warranty: "2 años de garantía",
  },
  {
    id: "6",
    slug: "reloj-rose-gold",
    name: "Reloj Rose Gold",
    category: "relojeria",
    categoryLabel: "Relojería",
    brand: "Rubí Atelier",
    material: "Acero con baño en oro rosa",
    price: 980000,
    image: p6,
    gallery: [p6, p1, p2],
    description:
      "Tonos rosados, esfera limpia y un movimiento cuarzo confiable. Un reloj que combina con todo sin perder protagonismo.",
    warranty: "2 años de garantía oficial",
  },
];

export const brands = Array.from(new Set(products.map((p) => p.brand)));
export const materials = Array.from(new Set(products.map((p) => p.material)));

export const formatCOP = (n: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);