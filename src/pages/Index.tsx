import { useEffect } from "react";

import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingPage } from "@/components/landing/LandingPage";

const Index = () => {
  useEffect(() => {
    document.title = "Além da Pele | Terapias Integrativas em Passo Fundo";

    const ensureMeta = (name: string, content: string) => {
      let tag = document.querySelector(`meta[name=\"${name}\"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    ensureMeta(
      "description",
      "Clínica de terapias integrativas Além da Pele, com Carla Schmitt em Passo Fundo - RS. Atendimento presencial e online. Agende pelo WhatsApp.",
    );
  }, []);

  return (
    <div className="bg-background text-foreground">
      <LandingHeader />
      <LandingPage />
    </div>
  );
};

export default Index;
