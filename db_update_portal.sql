-- Tabela: faqs
CREATE TABLE IF NOT EXISTS public.faqs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    question text NOT NULL,
    answer text NOT NULL,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Tabela: process_steps
CREATE TABLE IF NOT EXISTS public.process_steps (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    phase text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    sort_order integer DEFAULT 0,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Modificando a tabela: services
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS hover_text text;

-- Arrumando permissões (Row Level Security) e Grants
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.process_steps ENABLE ROW LEVEL SECURITY;

GRANT ALL ON TABLE public.faqs TO postgres, service_role;
GRANT SELECT ON TABLE public.faqs TO anon, authenticated;
GRANT ALL ON TABLE public.faqs TO authenticated;

GRANT ALL ON TABLE public.process_steps TO postgres, service_role;
GRANT SELECT ON TABLE public.process_steps TO anon, authenticated;
GRANT ALL ON TABLE public.process_steps TO authenticated;

DROP POLICY IF EXISTS "Public read faqs" ON public.faqs;
DROP POLICY IF EXISTS "Admin manage faqs" ON public.faqs;
CREATE POLICY "Public read faqs" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "Admin manage faqs" ON public.faqs FOR ALL USING (true);

DROP POLICY IF EXISTS "Public read process_steps" ON public.process_steps;
DROP POLICY IF EXISTS "Admin manage process_steps" ON public.process_steps;
CREATE POLICY "Public read process_steps" ON public.process_steps FOR SELECT USING (true);
CREATE POLICY "Admin manage process_steps" ON public.process_steps FOR ALL USING (true);

-- Inserindo alguns dados iniciais
INSERT INTO public.faqs (question, answer, sort_order) VALUES 
('Preciso acreditar em alguma religião para que faça sentido?', 'Não. Você só precisa estar aberto ao processo. Trabalhamos fundamentados nas memórias do próprio corpo e processos energéticos universais que acontecem no seu campo vibratório.', 1),
('Como sei qual é o melhor tipo de atendimento para o meu momento?', 'Muitas vezes você chega motivado por um sintoma, e nós identificamos juntos a raiz durante nossa conversa. Não se preocupe em escolher de antemão; o caminho se revela naturalmente no nosso primeiro contato.', 2),
('Os encontros profundos também funcionam em meio online?', 'Sim. A física da energia e a ressonância não possuem parede. O impacto, acolhimento e liberação emocional no formato online é tão imersivo quanto estar no nosso espaço térreo em Passo Fundo.', 3);

INSERT INTO public.process_steps (phase, title, description, sort_order) VALUES 
('O Chamado', 'Sua intuição desperta', 'Você não busca este espaço de repente. Há algo dentro de você pedindo atenção, espaço e um cuidado profundo consigo mesma.', 1),
('A Escolha', 'O início da jornada', 'Nós conversamos, entendemos o seu momento atual e alinhamos a abordagem orgânica ideal para aquilo que seu campo pede.', 2),
('A Vivência', 'O acesso sutil', 'Em um ambiente seguro e de não-julgamento, acessamos seus bloqueios, liberamos nós densos e reconectamos vitalidade.', 3),
('A Integração', 'A transformação silenciosa', 'As semanas seguintes à sessão são onde a mágica assenta. Sua perspectiva muda lentamente, como sementes brotando.', 4);
