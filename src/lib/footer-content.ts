export type FooterLink = {
  label: string;
  href?: string;
};

export type FooterColumn = {
  title: string;
  items: FooterLink[];
};

export type FooterContent = {
  description: string;
  columns: FooterColumn[];
  pdf_url?: string;
  copyright: string;
  tagline: string;
};

export const DEFAULT_FOOTER_CONTENT: FooterContent = {
  description:
    "Elegancia que trasciende. Relojería y joyería seleccionada para los momentos que importan.",
  columns: [
    {
      title: "Tienda",
      items: [
        { label: "Relojería", href: "/catalogo?cat=relojeria" },
        { label: "Joyería", href: "/catalogo?cat=joyeria" },
        { label: "Novedades", href: "/catalogo" },
        { label: "Promociones", href: "/catalogo" },
      ],
    },
    {
      title: "Ayuda",
      items: [
        { label: "Envíos", href: "/catalogo" },
        { label: "Garantía", href: "/catalogo" },
        { label: "Devoluciones", href: "/catalogo" },
        { label: "Contacto", href: "/catalogo" },
      ],
    },
    {
      title: "Rubí",
      items: [
        { label: "Nuestra historia", href: "/" },
        { label: "Atelier", href: "/" },
        { label: "Prensa", href: "/" },
        { label: "Boutiques", href: "/" },
      ],
    },
  ],
  copyright: "© {year} Rubí Relojería & Joyería. Todos los derechos reservados.",
  tagline: "Hecho con elegancia en Colombia",
};

function normalizeLink(value: unknown): FooterLink | null {
  if (!value || typeof value !== "object") return null;
  const link = value as Partial<FooterLink>;
  const label = typeof link.label === "string" ? link.label.trim() : "";
  if (!label) return null;
  const href = typeof link.href === "string" ? link.href.trim() : "";
  return href ? { label, href } : { label };
}

export function normalizeFooterContent(value: unknown): FooterContent {
  if (!value || typeof value !== "object") return DEFAULT_FOOTER_CONTENT;
  const footer = value as Partial<FooterContent>;
  const defaultColumns = DEFAULT_FOOTER_CONTENT.columns;
  const columns = Array.isArray(footer.columns) ? footer.columns : defaultColumns;

  return {
    description:
      typeof footer.description === "string"
        ? footer.description
        : DEFAULT_FOOTER_CONTENT.description,
    columns: columns.map((column, index) => {
      const fallback = defaultColumns[index] ?? { title: "Columna", items: [] };
      const source = column && typeof column === "object" ? (column as Partial<FooterColumn>) : {};
      const items = Array.isArray(source.items)
        ? source.items.map(normalizeLink).filter((item): item is FooterLink => Boolean(item))
        : fallback.items;
      return {
        title:
          typeof source.title === "string" && source.title.trim() ? source.title : fallback.title,
        items,
      };
    }),
    pdf_url: typeof footer.pdf_url === "string" ? footer.pdf_url : undefined,
    copyright:
      typeof footer.copyright === "string" ? footer.copyright : DEFAULT_FOOTER_CONTENT.copyright,
    tagline: typeof footer.tagline === "string" ? footer.tagline : DEFAULT_FOOTER_CONTENT.tagline,
  };
}

export function renderFooterCopyright(template: string, year = new Date().getFullYear()) {
  return template.replaceAll("{year}", String(year));
}
