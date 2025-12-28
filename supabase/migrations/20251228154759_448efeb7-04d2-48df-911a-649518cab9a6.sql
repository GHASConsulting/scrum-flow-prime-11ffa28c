-- Create enum for risk levels
-- Tabela de riscos
CREATE TABLE public.risco (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  -- Identificação do Risco
  projeto TEXT NOT NULL,
  area_impactada TEXT NOT NULL,
  tipo_risco_ghas TEXT NOT NULL,
  tipo_risco_cliente TEXT NOT NULL,
  descricao TEXT NOT NULL,
  -- Avaliação do Risco
  probabilidade TEXT NOT NULL,
  impacto TEXT NOT NULL,
  nivel_risco TEXT GENERATED ALWAYS AS (
    CASE
      WHEN (probabilidade = 'Alta' AND impacto = 'Alta') THEN 'Alto'
      WHEN (probabilidade = 'Alta' AND impacto = 'Média') THEN 'Alto'
      WHEN (probabilidade = 'Média' AND impacto = 'Alta') THEN 'Alto'
      WHEN (probabilidade = 'Baixa' AND impacto = 'Baixa') THEN 'Baixo'
      WHEN (probabilidade = 'Baixa' AND impacto = 'Média') THEN 'Baixo'
      WHEN (probabilidade = 'Média' AND impacto = 'Baixa') THEN 'Baixo'
      ELSE 'Médio'
    END
  ) STORED,
  -- Responsabilidade e Ação
  origem_risco TEXT NOT NULL,
  responsavel TEXT,
  plano_mitigacao TEXT,
  status_risco TEXT NOT NULL DEFAULT 'Aberto',
  -- Tempo e Controle
  data_identificacao DATE NOT NULL DEFAULT CURRENT_DATE,
  data_limite_acao DATE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  comentario_acompanhamento TEXT,
  historico TEXT,
  -- Resultado
  risco_ocorreu BOOLEAN DEFAULT FALSE,
  impacto_real_ocorrido TEXT,
  licao_aprendida TEXT,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.risco ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Usuários autenticados podem ver riscos"
ON public.risco
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir riscos"
ON public.risco
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar riscos"
ON public.risco
FOR UPDATE
USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar riscos"
ON public.risco
FOR DELETE
USING (auth.role() = 'authenticated');

-- Create trigger for updated_at
CREATE TRIGGER update_risco_updated_at
BEFORE UPDATE ON public.risco
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add comment
COMMENT ON TABLE public.risco IS 'Tabela para registro e acompanhamento de riscos do projeto';