
import { Navbar } from "@/components/Navbar";
import { BookingWizard } from "@/components/booking/BookingWizard";

export default function Booking() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div className="container px-4 py-8 md:py-12">
                <div className="mx-auto max-w-3xl">
                    <div className="mb-8 text-center">
                        <h1 className="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
                            Agende sua Sessão
                        </h1>
                        <p className="mt-2 text-muted-foreground">
                            Escolha o serviço e o horário ideal para você.
                        </p>
                    </div>

                    <BookingWizard />
                </div>
            </div>
        </div>
    );
}
