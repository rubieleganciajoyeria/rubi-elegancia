import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import appCss from "../styles.css?url";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/CartDrawer";
import { WishlistProvider } from "@/context/WishlistContext";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { WhatsAppFAB } from "@/components/WhatsAppFAB";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

const SITE_URL = "https://rubi-joyeria.com";
const OG_IMAGE = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/9e65ee21-1732-4909-82a1-53c0ff79676a/id-preview-09a18a16--6a50b2d9-6abb-4961-b9b5-4f6201a1689c.lovable.app-1779545011696.png";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Rubí — Relojería & Joyería | Elegancia que trasciende" },
      { name: "description", content: "Relojería y joyería premium en Colombia. Relojes suizos, joyas de oro y plata. Piezas únicas para momentos que perduran. Envío a todo el país con garantía." },
      { name: "author", content: "Rubí Relojería & Joyería" },
      { name: "robots", content: "index, follow" },
      { name: "language", content: "Spanish" },
      { name: "geo.region", content: "CO" },
      { name: "geo.placename", content: "Colombia" },
      // Open Graph
      { property: "og:site_name", content: "Rubí Relojería & Joyería" },
      { property: "og:title", content: "Rubí — Relojería & Joyería | Elegancia que trasciende" },
      { property: "og:description", content: "Relojería y joyería premium en Colombia. Relojes suizos, joyas de oro y plata. Piezas únicas para momentos que perduran." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:locale", content: "es_CO" },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      // Twitter Card
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Rubí — Relojería & Joyería" },
      { name: "twitter:description", content: "Relojería y joyería premium en Colombia. Relojes suizos, joyas de oro y plata." },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "canonical", href: SITE_URL },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${SITE_URL}/#organization`,
              name: "Rubí Relojería & Joyería",
              url: SITE_URL,
              logo: `${SITE_URL}/favicon.png`,
              description: "Relojería y joyería premium en Colombia. Relojes suizos, joyas de oro y plata.",
              address: { "@type": "PostalAddress", addressCountry: "CO" },
              contactPoint: { "@type": "ContactPoint", contactType: "customer support", availableLanguage: "Spanish" },
            },
            {
              "@type": "WebSite",
              "@id": `${SITE_URL}/#website`,
              url: SITE_URL,
              name: "Rubí Relojería & Joyería",
              publisher: { "@id": `${SITE_URL}/#organization` },
              potentialAction: {
                "@type": "SearchAction",
                target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/catalogo?q={search_term_string}` },
                "query-input": "required name=search_term_string",
              },
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <WishlistProvider>
        <CartProvider>
          <div className="flex min-h-screen flex-col">
            <AnnouncementBar />
            <Header />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
            <CartDrawer />
            <WhatsAppFAB />
            <Toaster position="top-right" richColors closeButton />
          </div>
        </CartProvider>
      </WishlistProvider>
    </QueryClientProvider>
  );
}
