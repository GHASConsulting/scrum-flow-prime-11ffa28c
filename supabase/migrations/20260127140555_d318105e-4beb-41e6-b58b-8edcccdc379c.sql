-- Add new column for tickets open more than 15 days
ALTER TABLE public.produtividade_global
ADD COLUMN abertos_15_dias integer NOT NULL DEFAULT 0;