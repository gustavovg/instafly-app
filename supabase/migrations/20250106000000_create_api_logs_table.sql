-- Criar tabela api_logs para armazenar logs das Edge Functions
CREATE TABLE IF NOT EXISTS api_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name TEXT NOT NULL,
  request_data JSONB,
  response_data JSONB,
  error_data JSONB,
  status_code INTEGER,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_api_logs_function_name ON api_logs(function_name);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_logs_status_code ON api_logs(status_code);

-- Adicionar política RLS (Row Level Security)
ALTER TABLE api_logs ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de logs (apenas para service role)
CREATE POLICY "Allow service role to insert logs" ON api_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Política para permitir leitura de logs (apenas para usuários autenticados)
CREATE POLICY "Allow authenticated users to read logs" ON api_logs
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL
  );

-- Comentários para documentação
COMMENT ON TABLE api_logs IS 'Tabela para armazenar logs de execução das Edge Functions';
COMMENT ON COLUMN api_logs.function_name IS 'Nome da Edge Function que gerou o log';
COMMENT ON COLUMN api_logs.request_data IS 'Dados da requisição em formato JSON';
COMMENT ON COLUMN api_logs.response_data IS 'Dados da resposta em formato JSON';
COMMENT ON COLUMN api_logs.error_data IS 'Dados do erro em formato JSON (se houver)';
COMMENT ON COLUMN api_logs.status_code IS 'Código de status HTTP da resposta';
COMMENT ON COLUMN api_logs.execution_time_ms IS 'Tempo de execução em milissegundos';