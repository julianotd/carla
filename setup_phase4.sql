-- Add benefits column to services table
ALTER TABLE public.services 
ADD COLUMN IF NOT EXISTS benefits text[];-- array of strings

-- Update specific services with benefits (Example data to populate)
-- You can run these or let the user edit in Admin
/*
UPDATE public.services 
SET benefits = ARRAY['Alívio de tensão', 'Equilíbrio energético', 'Bem-estar profundo']
WHERE slug = 'massagem-alem-da-pele';

UPDATE public.services 
SET benefits = ARRAY['Autoconhecimento', 'Liberação de traumas', 'Clareza emocional']
WHERE slug = 'investigacao-energetica';
*/
