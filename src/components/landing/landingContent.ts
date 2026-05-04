export const WHATSAPP_LINK =
  "https://wa.me/5554999996668?text=Ol%C3%A1%2C%20Carla!%20Gostaria%20de%20saber%20mais%20sobre%20os%20atendimentos%20no%20Al%C3%A9m%20da%20Pele.";

export const MAPS_LINK =
  "https://www.google.com/maps/search/?api=1&query=R.%20%C3%81lvares%20Cabral%2C%20408%20-%20Petr%C3%B3polis%2C%20Passo%20Fundo%20-%20RS%2C%2099050-070";

export const INSTAGRAM_LINK = "https://instagram.com/navemistica";

export const BRAND = {
  name: "Além da Pele",
  slogan: "Um espaço de cuidado, presença e transformação.",
  description:
    "A clínica Além da Pele reúne atendimentos terapêuticos, vivências e produtos energéticos em um ambiente acolhedor em Passo Fundo.",
  modality: "Atendimentos presenciais e online",
  schedule: "Segunda a sexta, com hora marcada",
  instagramHandle: "@navemistica",
  whatsappDisplay: "(54) 99999-6668",
  address: "R. Álvares Cabral, 408 - Petrópolis, Passo Fundo - RS",
  therapist: "Carla Schmitt",
};

export const HERO = {
  title: "Um espaço de cuidado, presença e transformação.",
  subtitle:
    "A clínica Além da Pele reúne atendimentos terapêuticos, vivências e produtos energéticos em um ambiente acolhedor em Passo Fundo.",
  ctas: {
    primary: "Agendar atendimento",
    secondary: "Conhecer o espaço",
  },
};

export const CONCEPT_CARDS = [
  {
    title: "Atendimentos",
    description: "Sessões com Carla e terapeutas convidados, cada profissional com sua abordagem única.",
    icon: "HeartHandshake",
  },
  {
    title: "Produtos Autorais",
    description: "Mandalas e aromatizadores energéticos criados por Carla para harmonizar seu ambiente.",
    icon: "Sparkles",
  },
  {
    title: "Vivências e Eventos",
    description: "Encontros terapêuticos, rodas de conversa e experiências especiais no nosso espaço.",
    icon: "Users",
  },
];

export const SERVICES = [
  {
    id: "desbloqueio",
    title: "Desbloqueio Emocional",
    phrase: "Acessar memórias que o corpo ainda guarda",
    description: "Trabalho integrativo com respiração consciente, toque terapêutico e escuta sutil para liberar tensões emocionais armazenadas no corpo.",
    duration: "60 min",
    price: "R$ 220",
    modality: "Presencial / Online",
    category: "Individual",
    therapistId: "carla",
    featured: true,
    icon: "🫧",
  },
  {
    id: "regressao",
    title: "Regressão Terapêutica",
    phrase: "Retornar à raiz do emaranhado para libertá-lo",
    description: "Sessão guiada de regressão para acessar memórias significativas, compreender padrões repetitivos e promover resolução emocional profunda.",
    duration: "90 min",
    price: "R$ 280",
    modality: "Presencial",
    category: "Individual",
    therapistId: "carla",
    icon: "🌀",
  },
  {
    id: "mandalas",
    title: "Mandalas de Cristais",
    phrase: "Frequências da terra alinhando o seu espaço",
    description: "Composição terapêutica com cristais em padrões geométricos sobre o corpo, harmonizando energia e promovendo equilíbrio vibracional.",
    duration: "75 min",
    price: "R$ 250",
    modality: "Presencial",
    category: "Individual",
    therapistId: "carla",
    icon: "💎",
  },
  {
    id: "leitura-campo",
    title: "Leitura do Campo",
    phrase: "Ler o invisível que pede atenção",
    description: "Percepção intuitiva do campo energético para identificar bloqueios, desalinhos e potenciais adormecidos — seguida de orientação personalizada.",
    duration: "50 min",
    price: "R$ 180",
    modality: "Online / Presencial",
    category: "Individual",
    therapistId: "carla",
    icon: "👁",
  },
  {
    id: "aromaterapia",
    title: "Aromaterapia",
    phrase: "O que o aroma revela, a mente não esconde",
    description: "Óleos essenciais selecionados intuitivamente, aplicados por inalação e toque, para acessar emoções sutis e promover bem-estar profundo.",
    duration: "60 min",
    price: "R$ 200",
    modality: "Presencial",
    category: "Individual",
    therapistId: "carla",
    icon: "🌿",
  },
  {
    id: "constelacao",
    title: "Constelação Familiar",
    phrase: "O que foi herdado pode ser transformado",
    description: "Dinâmica terapêutica que revela padrões transgeracionais inconscientes, permitindo reconhecimento, pertencimento e libertação de lealdades.",
    duration: "120 min",
    price: "R$ 280",
    modality: "Presencial",
    category: "Grupo / Individual",
    therapistId: "carla",
    icon: "🪞",
  },
  {
    id: "tarot",
    title: "Tarot Terapêutico",
    phrase: "Espelhos que revelam o que já sabemos",
    description: "Leitura de tarot com abordagem terapêutica — não é adivinhação, é ferramenta de autoconhecimento e reflexão simbólica do momento.",
    duration: "60 min",
    price: "R$ 160",
    modality: "Online / Presencial",
    category: "Individual",
    therapistId: "guest-maria",
    icon: "🃏",
  },
  {
    id: "barras-access",
    title: "Barras de Access",
    phrase: "Liberar o que está fixo na mente",
    description: "Técnica de toque suave em 32 pontos da cabeça que libera cargas eletromagnéticas acumuladas — crenças e emoções armazenadas.",
    duration: "70 min",
    price: "R$ 190",
    modality: "Presencial",
    category: "Individual",
    therapistId: "guest-rafael",
    icon: "⚡",
  },
] as const;

export const PROFESSIONALS = [
  {
    id: "carla",
    name: "Carla Schmitt",
    role: "Terapeuta Integrativa e Fundadora",
    bio: "Há 12 anos dedicada ao caminho terapêutico sutil. Formada em terapia integrativa, regressão, constelação familiar e aromaterapia. Conduz os processos com escuta profunda.",
    specialty: "Desbloqueio Emocional e Energético",
    frequency: "Atendimento Diário",
    avatar: "CS",
    image: null,
  },
  {
    id: "guest-maria",
    name: "Maria Oliveira",
    role: "Taróloga e Terapeuta Holística",
    bio: "Especialista em tarot terapêutico com abordagem junguiana. Usa as cartas como ferramenta de autoconhecimento e reflexão — nunca como previsão de futuro.",
    specialty: "Tarot e Simbolismo",
    frequency: "Convidada",
    avatar: "MO",
    image: null,
  },
  {
    id: "guest-rafael",
    name: "Rafael Santos",
    role: "Facilitador de Barras de Access",
    bio: "Facilitador certificado de Access Consciousness. Conduz sessões de Barras com precisão e sensibilidade, ajudando a liberar padrões mentais que limitam a vida.",
    specialty: "Barras de Access",
    frequency: "Convidado",
    avatar: "RS",
    image: null,
  },
];

export const EVENTS = [
  {
    id: "evt1",
    title: "Roda de Mulheres: Ciclos e Luas",
    facilitator: "Carla Schmitt",
    date: "25 de Março, 19h",
    image: null,
  },
  {
    id: "evt2",
    title: "Vivência de Respiração Consciente",
    facilitator: "Terapeuta Convidado",
    date: "10 de Abril, 09h",
    image: null,
  },
];

export const PRODUCTS = [
  {
    title: "Mandalas Vibracionais",
    description: "Arte intuitiva com cristais para ancorar frequências de cura.",
  },
  {
    title: "Aromatizadores",
    description: "Sprays energéticos para limpeza e harmonização de ambientes.",
  },
];

export const TESTIMONIALS = [
  {
    role: "Camila R.",
    quote:
      "Eu não sabia explicar o que sentia. Só sabia que pesava muito. Quando a sessão acabou, foi como se eu respirasse com os pulmões completamente cheios pela primeira vez em anos.",
  },
  {
    role: "Gabriela S.",
    quote:
      "Nem tudo que transforma pode ser visto. A experiência ali dentro foi profunda, mas foi caminhando para casa que entendi que saí de lá bem diferente do que entrei.",
  },
  {
    role: "Processo Integrativo",
    quote:
      "O espaço por si só já acolhe, mas a escuta ativa da Carla limpou barreiras que eu construí durante a vida toda. Me reencontrei no silêncio.",
  },
] as const;

export const PROCESS_STEPS = [
  {
    phase: "O Chamado",
    title: "Sua intuição desperta",
    description: "Você não busca este espaço de repente. Há algo dentro de você pedindo atenção, espaço e um cuidado profundo consigo mesma."
  },
  {
    phase: "A Escolha",
    title: "O início da jornada",
    description: "Nós conversamos, entendemos o seu momento atual e alinhamos a abordagem orgânica ideal para aquilo que seu campo pede hoje."
  },
  {
    phase: "A Vivência",
    title: "O acesso sutil",
    description: "Em um ambiente seguro e de não-julgamento, acessamos seus bloqueios, liberamos nós densos e reconectamos o seu verdadeiro pulso vital."
  },
  {
    phase: "A Integração",
    title: "A transformação silenciosa",
    description: "As semanas seguintes à sessão são onde a mágica assenta. Sua perspectiva muda lentamente, como sementes brotando, e o caminho fica mais claro."
  }
];

export const FAQ_QUESTIONS = [
  {
    question: "O que é a clínica Além da Pele?",
    answer: "A Além da Pele é uma clínica de terapias integrativas localizada em Passo Fundo - RS, fundada pela terapeuta Carla Schmitt. Oferecemos um espaço seguro de cuidado, presença e transformação pessoal."
  },
  {
    question: "Onde fica a clínica Além da Pele e quem é Carla Schmitt?",
    answer: "A clínica está localizada na R. Álvares Cabral, 408 - Petrópolis, Passo Fundo, Rio Grande do Sul. Carla Schmitt é a terapeuta integrativa fundadora do espaço, especializada em desbloqueio emocional e energético, constelação familiar e barras de access."
  },
  {
    question: "Quais terapias são oferecidas na Além da Pele?",
    answer: "Nossa clínica oferece Desbloqueio Emocional, Investigação Energética, Regressão Terapêutica, Massagem Terapêutica, Mandalas Vibracionais e Aromaterapia."
  },
  {
    question: "Preciso acreditar em alguma religião para que faça sentido?",
    answer: "Não. Você só precisa estar aberto ao processo. Trabalhamos fundamentados nas memórias do próprio corpo e processos energéticos universais que acontecem no seu campo vibratório."
  },
  {
    question: "Como sei qual é o melhor tipo de atendimento para o meu momento?",
    answer: "Muitas vezes você chega motivado por um sintoma, e nós identificamos juntos a raiz durante nossa conversa. Não se preocupe em escolher de antemão; o caminho se revela naturalmente no nosso primeiro contato."
  },
  {
    question: "Os encontros profundos também funcionam em meio online?",
    answer: "Sim. A física da energia e a ressonância não possuem parede. O impacto, acolhimento e liberação emocional no formato online é tão imersivo quanto estar no nosso espaço em Passo Fundo."
  }
];
