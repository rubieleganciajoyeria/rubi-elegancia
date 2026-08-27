import { cn } from "@/lib/utils";

type ProductNameProps = {
  name: string;
  className?: string;
  referenceClassName?: string;
};

const REFERENCE_PATTERN = /\s([A-Z]{2,}[A-Z0-9-]*\d[A-Z0-9-]*)$/;

export function ProductName({ name, className, referenceClassName }: ProductNameProps) {
  const match = name.match(REFERENCE_PATTERN);

  if (!match?.index) {
    return <span className={className}>{name}</span>;
  }

  const title = name.slice(0, match.index);
  const reference = match[1];

  return (
    <span className={className}>
      {title}{" "}
      <span
        className={cn(
          "font-serif font-normal tracking-normal [font-variant-numeric:tabular-nums]",
          referenceClassName,
        )}
      >
        {reference}
      </span>
    </span>
  );
}
