-- Corrigir a sequence para continuar a partir do maior código existente
SELECT setval('prestador_servico_codigo_seq', (SELECT COALESCE(MAX(codigo), 0) + 1 FROM prestador_servico), false);