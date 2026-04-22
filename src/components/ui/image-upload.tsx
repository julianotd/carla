import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    bucket?: string;
    folder?: string;
}

export function ImageUpload({ value, onChange, bucket = "uploads", folder = "images" }: ImageUploadProps) {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setIsUploading(true);
            const file = event.target.files?.[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith("image/")) {
                toast({
                    title: "Erro",
                    description: "O arquivo deve ser uma imagem.",
                    variant: "destructive",
                });
                return;
            }

            // Create unique filename
            const fileExt = file.name.split(".").pop();
            const fileName = `${folder}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;

            // Upload to Supabase Storage
            const { error: uploadError, data } = await supabase.storage
                .from(bucket)
                .upload(fileName, file, { upsert: false });

            if (uploadError) {
                console.error("Upload error:", uploadError);
                throw new Error("Erro ao fazer upload: " + uploadError.message + ". Verifique se o bucket '" + bucket + "' existe e é público no Supabase.");
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from(bucket)
                .getPublicUrl(fileName);

            onChange(publicUrl);
            toast({
                title: "Sucesso",
                description: "Imagem enviada com sucesso!",
            });

        } catch (error: any) {
            toast({
                title: "Erro no Upload",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleRemove = () => {
        onChange("");
    };

    return (
        <div className="flex items-center gap-4">
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleUpload}
            />
            
            {value ? (
                <div className="relative h-20 w-20 overflow-hidden rounded-md border border-border group">
                    <img src={value} alt="Upload preview" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-background/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="h-8 w-8"
                            onClick={handleRemove}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="h-20 w-20 rounded-md border border-dashed flex items-center justify-center bg-secondary/50">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
            )}
            
            <div className="flex-1">
                <Button
                    type="button"
                    variant="outline"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <Upload className="mr-2 h-4 w-4" />
                            {value ? "Trocar Imagem" : "Fazer Upload"}
                        </>
                    )}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG ou WebP. Recomendado: proporção 1:1.
                </p>
            </div>
        </div>
    );
}
