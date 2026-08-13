import { useQuery } from "@tanstack/react-query";
import rubiLogo from "@/assets/rubi-logo.png";
import { listSiteContent } from "@/lib/site-content.functions";
import {
  normalizeFooterContent,
  renderFooterCopyright,
  type FooterLink,
} from "@/lib/footer-content";

export function Footer() {
  const { data } = useQuery({
    queryKey: ["site-content"],
    queryFn: () => listSiteContent(),
    staleTime: 60_000,
  });
  const footer = normalizeFooterContent(data?.footer);

  return (
    <footer className="mt-32 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <img
              src={rubiLogo}
              alt="Rubí Relojería & Joyería"
              className="mb-4 h-[45px] w-auto object-contain"
            />
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              {footer.description}
            </p>
          </div>
          {footer.columns.map((column) => (
            <FooterCol
              key={column.title}
              title={column.title}
              items={column.items}
              pdfUrl={footer.pdf_url}
            />
          ))}
        </div>
        <div className="gold-divider mt-14" />
        <div className="mt-6 flex flex-col items-center justify-between gap-3 text-xs text-muted-foreground md:flex-row">
          <span>{renderFooterCopyright(footer.copyright)}</span>
          <span className="tracking-widest uppercase">{footer.tagline}</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  items,
  pdfUrl,
}: {
  title: string;
  items: FooterLink[];
  pdfUrl?: string;
}) {
  const columnTitle = pdfUrl ? (
    <a
      href={pdfUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="transition-colors hover:text-wine"
    >
      {title}
    </a>
  ) : (
    title
  );

  return (
    <div>
      <h4 className="font-serif text-xs uppercase tracking-[0.25em] text-foreground/80">
        {columnTitle}
      </h4>
      <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={`${title}-${item.label}`}>
            {pdfUrl ? (
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer transition-colors hover:text-wine"
              >
                {item.label}
              </a>
            ) : item.href ? (
              <a href={item.href} className="cursor-pointer transition-colors hover:text-wine">
                {item.label}
              </a>
            ) : (
              <span>{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
