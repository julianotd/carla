
-- Phase 5: Multi-Therapist Agenda & Advanced Rules

-- 1. Therapist Services (Many-to-Many)
-- Link therapists to specific services they perform.
CREATE TABLE IF NOT EXISTS public.therapist_services (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    therapist_id uuid REFERENCES public.therapists(id) ON DELETE CASCADE NOT NULL,
    service_id uuid REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(therapist_id, service_id)
);

-- Enable RLS for therapist_services
ALTER TABLE public.therapist_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read therapist_services" ON public.therapist_services FOR SELECT USING (true);
CREATE POLICY "Admin/Therapist manage therapist_services" ON public.therapist_services FOR ALL USING (public.has_role('admin') OR public.has_role('editor'));


-- 2. Update Availability Rules (Add 'mode')
-- Mode: 'online', 'presencial', 'both'
ALTER TABLE public.availability_rules 
ADD COLUMN IF NOT EXISTS mode text DEFAULT 'both' CHECK (mode IN ('online', 'presencial', 'both'));


-- 3. Availability Blocks (Range-based exceptions)
-- Replaces/Supplements availability_exceptions with more precise blocking
CREATE TABLE IF NOT EXISTS public.availability_blocks (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    therapist_id uuid REFERENCES public.therapists(id) ON DELETE CASCADE NOT NULL,
    starts_at timestamp with time zone NOT NULL,
    ends_at timestamp with time zone NOT NULL,
    reason text,
    created_by uuid REFERENCES auth.users(id), -- Audit who created the block
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for availability_blocks
ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read blocks" ON public.availability_blocks FOR SELECT USING (true);
CREATE POLICY "Admin/Therapist manage blocks" ON public.availability_blocks FOR ALL USING (public.has_role('admin') OR public.has_role('therapist') OR public.has_role('editor'));


-- 4. Update Appointments (Add 'mode')
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS mode text DEFAULT 'presencial' CHECK (mode IN ('online', 'presencial'));

-- 5. RPC Function to check availability (Optional but recommended for "Smart" logic later)
-- For now we stick to client-side logic + basic queries as per user instruction "without becoming a monster".

