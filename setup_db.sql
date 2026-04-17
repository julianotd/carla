
-- Create site_content table
CREATE TABLE IF NOT EXISTS public.site_content (
    key text PRIMARY KEY,
    value text,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create services table
CREATE TABLE IF NOT EXISTS public.services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text NOT NULL,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    role_label text NOT NULL,
    quote text NOT NULL,
    is_active boolean DEFAULT true,
    sort_order integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access" ON public.site_content FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.services FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON public.testimonials FOR SELECT USING (true);

-- Insert initial site_content data
INSERT INTO public.site_content (key, value) VALUES
('brand_name', 'Além da Pele'),
('brand_slogan', 'Conecte-se com sua essência. Transforme sua vida.'),
('brand_modality', 'Atende presencial e online'),
('brand_schedule', 'Segunda a sexta, conforme agendamento'),
('instagram_handle', '@navemistica'),
('whatsapp_display', '(54) 99999-6668'),
('address', 'R. Álvares Cabral, 408 - Petrópolis, Passo Fundo - RS, 99050-070'),
('brand_therapist', 'Carla Schmitt'),
('whatsapp_link', 'https://wa.me/5554999996668?text=Ol%C3%A1%2C%20Carla!%20Quero%20agendar%20um%20atendimento%20na%20Al%C3%A9m%20da%20Pele.%20Pode%20me%20passar%20hor%C3%A1rios%20dispon%C3%ADveis%3F'),
('maps_link', 'https://www.google.com/maps/search/?api=1&query=R.%20%C3%81lvares%20Cabral%2C%20408%20-%20Petr%C3%B3polis%2C%20Passo%20Fundo%20-%20RS%2C%2099050-070')
ON CONFLICT (key) DO NOTHING;

-- Insert initial services data
INSERT INTO public.services (title, description, sort_order) VALUES
('Desbloqueio emocional, energético e inconsciente', 'Um cuidado profundo para liberar padrões e emoções que impactam sua rotina e seu corpo.', 1),
('Investigação energética', 'Leitura sutil do seu campo para compreender origens, excessos e necessidades do momento.', 2),
('Regressão', 'Acesso guiado a memórias e experiências para ressignificar e integrar aprendizados com segurança.', 3),
('Massagem terapêutica', 'Toque consciente para aliviar tensões, restaurar presença e apoiar o equilíbrio do sistema.', 4),
('Mandalas de cristais', 'Geometrias harmonizadoras para intenção, alinhamento e uma sensação de clareza interior.', 5),
('Aromaterapia', 'Óleos essenciais selecionados para apoiar emoções, respiração e bem-estar no dia a dia.', 6);

-- Insert initial testimonials data
INSERT INTO public.testimonials (role_label, quote, sort_order) VALUES
('Cliente', 'Me senti acolhida desde o início. Saí mais leve, com clareza e um senso real de cuidado comigo mesma.', 1),
('Cliente', 'A experiência foi profunda e ao mesmo tempo muito tranquila. Um espaço seguro para olhar para dentro.', 2),
('Cliente', 'Percebi mudanças no corpo e na mente nas semanas seguintes. O acompanhamento fez toda a diferença.', 3);
