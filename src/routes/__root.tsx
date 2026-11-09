import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { VestaShell } from "../components/vesta-shell";
import { Toaster } from "../components/ui/sonner";
import { useCartSync } from "../hooks/use-cart-sync";
import { trackPageView } from "../lib/meta-pixel";
import {
  AdsConsentProvider,
  openAdsConsentSettings,
  useAdsConsent,
} from "../components/ads-consent";

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

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

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

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "VESTA Joias" },
      { name: "description", content: "Joias brasileiras em edições limitadas e numeradas." },
      { name: "author", content: "VESTA Joias" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
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
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useCartSync();

  return (
    <QueryClientProvider client={queryClient}>
      <AdsConsentProvider>
        <RootContent pathname={pathname} />
      </AdsConsentProvider>
    </QueryClientProvider>
  );
}

function RootContent({ pathname }: { pathname: string }) {
  const { ready, allowed } = useAdsConsent();

  useEffect(() => {
    if (ready && allowed) trackPageView(true);
  }, [allowed, pathname, ready]);

  return (
    <div className="site-wrapper">
      <VestaShell />
      <div className="site-content">
        <Outlet />
      </div>
      <footer id="rodape" className="footer">
        <div className="footer-brand">
          <div className="footer-logo">
            <span>VESTA</span>
            <small>JOIAS</small>
          </div>
          <p>Joias para atravessar gerações.</p>
        </div>
        <div>
          <h3>Ajuda</h3>
          <a href="#acesso">Envios e trocas</a>
          <a href="#acesso">Guia de medidas</a>
          <a href="#acesso">Cuidados</a>
        </div>
        <div>
          <h3>A Vesta</h3>
          <a href="#historia">Nossa história</a>
          <a href="#acesso">Atendimento</a>
          <a href="#acesso">Instagram</a>
        </div>
        <div className="footer-contact">
          <h3>Contato</h3>
          <p>contato@vestajewelry.com.br</p>
          <p>Visa · Mastercard · Pix</p>
          <Link to="/privacidade">Política de Privacidade</Link>
          <button type="button" className="footer-privacy-button" onClick={openAdsConsentSettings}>
            Configurações de cookies
          </button>
        </div>
        <p className="copyright">© 2026 VESTA Joias</p>
      </footer>
      <Toaster />
    </div>
  );
}
