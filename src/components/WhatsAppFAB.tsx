import { MessageCircle } from "lucide-react";

export function WhatsAppFAB() {
  const phone = "59812345678";
  const message = "Hola Rubí, quisiera consultar sobre una pieza.";
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-wine text-white shadow-elegant transition-transform duration-300 hover:scale-110 hover:shadow-elegant focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-wine"
      style={{ boxShadow: "0 8px 32px -8px oklch(0.32 0.13 22 / 0.45)" }}
    >
      <MessageCircle size={26} strokeWidth={2} />
      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-75" />
        <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-[#25D366]" />
      </span>
    </a>
  );
}
