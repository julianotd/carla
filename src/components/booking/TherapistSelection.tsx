
import { useQuery } from "@tanstack/react-query";
import { Check, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TherapistSelectionProps {
    service: any;
    onSelect: (therapist: any) => void;
    selectedId?: string;
}

export function TherapistSelection({ service, onSelect, selectedId }: TherapistSelectionProps) {
    const { data: therapists, isLoading } = useQuery({
        queryKey: ["public", "therapists"],
        queryFn: async () => {
            const { data, error } = await supabase
                .from("therapists")
                .select("*")
                .order("name");
            if (error) throw error;
            return data;
        },
    });

    // Filter therapists who perform this service (based on specialty matching service title)
    // MVP: Loose matching or just show all if no match found.
    const refinedTherapists = therapists?.filter(t => {
        if (!t.specialties || t.specialties.length === 0) return true; // generic therapist
        // Check if any specialty includes service title or vice versa
        const serviceName = service.title.toLowerCase();
        return t.specialties.some((s: string) => {
            const spec = s.toLowerCase();
            return spec.includes(serviceName) || serviceName.includes(spec);
        });
    });

    const displayList = (refinedTherapists && refinedTherapists.length > 0) ? refinedTherapists : therapists;

    if (isLoading) return <div className="p-8 text-center">Carregando profissionais...</div>;

    return (
        <div className="grid gap-4 md:grid-cols-2">
            {displayList?.map((therapist) => (
                <Card
                    key={therapist.id}
                    className={cn(
                        "cursor-pointer transition-all hover:border-primary",
                        selectedId === therapist.id ? "border-primary bg-primary/5 ring-1 ring-primary" : ""
                    )}
                    onClick={() => onSelect(therapist)}
                >
                    <CardContent className="flex items-center gap-4 p-4">
                        <Avatar className="h-14 w-14 border">
                            <AvatarImage src={therapist.photo_url || ""} />
                            <AvatarFallback><User /></AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                                <h3 className="font-semibold">{therapist.name}</h3>
                                {selectedId === therapist.id && <Check className="h-4 w-4 text-primary" />}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">{therapist.specialties?.join(", ")}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
