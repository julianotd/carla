
import { useQuery } from "@tanstack/react-query";
import { Check, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ServiceSelectionProps {
    onSelect: (service: any) => void;
    selectedId?: string;
}

export function ServiceSelection({ onSelect, selectedId }: ServiceSelectionProps) {
    const { data: services, isLoading } = useQuery({
        queryKey: ["public", "services"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("services")
                .select("*")
                .eq("is_active", true)
                .order("title");
            if (error) throw error;
            return data;
        },
    });

    if (isLoading) return <div className="p-8 text-center">Carregando serviços...</div>;

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {services?.map((service) => (
                <Card
                    key={service.id}
                    className={cn(
                        "cursor-pointer transition-all hover:border-primary",
                        selectedId === service.id ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
                    )}
                    onClick={() => onSelect(service)}
                >
                    <CardContent className="flex items-start gap-4 p-4">
                        {service.cover_image_url && (
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                                <img src={service.cover_image_url} alt={service.title} className="h-full w-full object-cover" />
                            </div>
                        )}
                        <div className="flex-1 space-y-1">
                            <div className="flex items-start justify-between">
                                <h3 className="font-semibold">{service.title}</h3>
                                {selectedId === service.id && <Check className="h-4 w-4 text-primary" />}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                            <div className="mt-2 flex items-center gap-4 text-xs font-medium">
                                {/* {service.price_text && (
                                    <span className="text-primary">{service.price_text}</span>
                                )} */}
                                {service.duration_min && (
                                    <span className="flex items-center gap-1 text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {service.duration_min} min
                                    </span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
