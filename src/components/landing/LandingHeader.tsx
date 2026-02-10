import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { BRAND, WHATSAPP_LINK } from "./landingContent";

const NAV_ITEMS = [
  { label: "Sobre", href: "#sobre" },
  { label: "Serviços", href: "#servicos" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Local", href: "#local" },
  { label: "Contato", href: "#contato" },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Menu" className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
      {NAV_ITEMS.map((item) => (
        <a
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className="text-sm font-medium text-foreground/90 transition-colors hover:text-ink"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}

export function LandingHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <a href="#topo" className="group inline-flex items-baseline gap-2">
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            {BRAND.name}
          </span>
          <span className="hidden text-xs text-foreground/70 sm:inline">• {BRAND.modality}</span>
        </a>

        <div className="hidden items-center gap-8 sm:flex">
          <NavLinks />
          <Button asChild variant="premium" size="sm">
            <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer">
              Agendar
            </a>
          </Button>
        </div>

        <div className="sm:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Abrir menu">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-background">
              <SheetHeader>
                <SheetTitle className="font-display text-ink">Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-6 flex flex-col gap-6">
                <nav aria-label="Menu" className="flex flex-col gap-2">
                  {NAV_ITEMS.map((item) => (
                    <SheetClose asChild key={item.href}>
                      <a
                        href={item.href}
                        className="text-sm font-medium text-foreground/90 transition-colors hover:text-ink"
                      >
                        {item.label}
                      </a>
                    </SheetClose>
                  ))}
                </nav>
                <Button asChild variant="premium">
                  <a href={WHATSAPP_LINK} target="_blank" rel="noreferrer">
                    Agendar pelo WhatsApp
                  </a>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
