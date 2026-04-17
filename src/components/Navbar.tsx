
import { BRAND } from "@/components/landing/landingContent";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

export function Navbar() {
    return (
        <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-50">
            <div className="container flex h-16 items-center justify-between">
                <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                    <span className="text-sm font-medium">Voltar ao Início</span>
                </Link>

                <Link to="/" className="font-display text-lg font-semibold tracking-tight text-ink">
                    {BRAND.name}
                </Link>

                {/* Placeholder for balance layout */}
                <div className="w-[100px]" />
            </div>
        </header>
    );
}
