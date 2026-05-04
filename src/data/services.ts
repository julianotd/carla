export interface Service {
  id: string;
  name: string;
  title?: string; // For compatibility
  icon: string;
  therapistId: string;
  therapistSlug?: string; // New field
  description: string;
  phrase?: string;
  duration?: string;
  price?: string;
  modality?: string;
}

export interface Therapist {
  id: string;
  slug: string;
  name: string;
  role: "principal" | "convidado";
  roleLabel: string;
  bio: string;
  photo?: string | null;
  emoji: string;
  initials: string;
  serviceCount: number;
  socialUrl?: string | null;
}

// Initial data mapped from existing landingContent.ts for bootstrap
export const services: Service[] = [
  {
    id: "desbloqueio",
    name: "Desbloqueio Emocional",
    icon: "🫧",
    therapistId: "carla",
    therapistSlug: "carla",
    description: "Trabalho integrativo com respiração consciente, toque terapêutico e escuta sutil para liberar tensões emocionais armazenadas no corpo.",
  },
  {
    id: "regressao",
    name: "Regressão Terapêutica",
    icon: "🌀",
    therapistId: "carla",
    therapistSlug: "carla",
    description: "Sessão guiada de regressão para acessar memórias significativas, compreender padrões repetitivos e promover resolução emocional profunda.",
  },
  {
    id: "mandalas",
    name: "Mandalas de Cristais",
    icon: "💎",
    therapistId: "carla",
    therapistSlug: "carla",
    description: "Composição terapêutica com cristais em padrões geométricos sobre o corpo, harmonizando energia e promovendo equilíbrio vibracional.",
  },
  {
    id: "leitura-campo",
    name: "Leitura do Campo",
    icon: "👁",
    therapistId: "carla",
    therapistSlug: "carla",
    description: "Percepção intuitiva do campo energético para identificar bloqueios, desalinhos e potenciais adormecidos.",
  },
  {
    id: "aromaterapia",
    name: "Aromaterapia",
    icon: "🌿",
    therapistId: "carla",
    therapistSlug: "carla",
    description: "Óleos essenciais selecionados intuitivamente para acessar emoções sutis.",
  },
  {
    id: "constelacao",
    name: "Constelação Familiar",
    icon: "🪞",
    therapistId: "carla",
    therapistSlug: "carla",
    description: "Dinâmica terapêutica que revela padrões transgeracionais inconscientes.",
  },
  {
    id: "tarot",
    name: "Tarot Terapêutico",
    icon: "🃏",
    therapistId: "guest-maria",
    therapistSlug: "guest-maria",
    description: "Leitura de tarot com abordagem terapêutica e autoconhecimento.",
  },
  {
    id: "barras-access",
    name: "Barras de Access",
    icon: "⚡",
    therapistId: "guest-rafael",
    therapistSlug: "guest-rafael",
    description: "Técnica de toque suave que libera cargas eletromagnéticas acumuladas.",
  },
];
