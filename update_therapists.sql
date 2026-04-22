-- Adicionar a coluna social_url na tabela therapists
ALTER TABLE therapists ADD COLUMN IF NOT EXISTS social_url TEXT;
