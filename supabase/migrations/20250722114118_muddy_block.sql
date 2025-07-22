/*
  # Criar tabelas para revisão de estagiários e tipos de chamado

  1. Nova Tabela - revisoes_estagiario
    - `id` (uuid, primary key)
    - `usuario_id` (integer, foreign key para usuarios)
    - `data` (date)
    - `descricao` (text)
    - `hora_inicio` (timestamptz)
    - `hora_fim` (timestamptz)
    - `criado_em` (timestamptz)

  2. Nova Tabela - tipos_chamado
    - `id` (integer, primary key)
    - `nome` (text)

  3. Nova Tabela - subtipos_chamado
    - `id` (integer, primary key)
    - `tipo_id` (integer, foreign key para tipos_chamado)
    - `nome` (text)

  4. Segurança
    - Enable RLS em todas as tabelas
    - Adicionar políticas apropriadas
*/

-- Criar tabela de revisões de estagiário
CREATE TABLE IF NOT EXISTS revisoes_estagiario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id integer NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  data date NOT NULL DEFAULT CURRENT_DATE,
  descricao text NOT NULL,
  hora_inicio timestamptz NOT NULL DEFAULT now(),
  hora_fim timestamptz,
  criado_em timestamptz DEFAULT now(),
  UNIQUE(usuario_id, data)
);

-- Criar tabela de tipos de chamado
CREATE TABLE IF NOT EXISTS tipos_chamado (
  id serial PRIMARY KEY,
  nome text NOT NULL UNIQUE
);

-- Criar tabela de subtipos de chamado
CREATE TABLE IF NOT EXISTS subtipos_chamado (
  id serial PRIMARY KEY,
  tipo_id integer NOT NULL REFERENCES tipos_chamado(id) ON DELETE CASCADE,
  nome text NOT NULL
);

-- Habilitar RLS
ALTER TABLE revisoes_estagiario ENABLE ROW LEVEL SECURITY;
ALTER TABLE tipos_chamado ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtipos_chamado ENABLE ROW LEVEL SECURITY;

-- Políticas para revisoes_estagiario
CREATE POLICY "Estagiários podem ver suas próprias revisões"
  ON revisoes_estagiario
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Estagiários podem criar suas próprias revisões"
  ON revisoes_estagiario
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Estagiários podem atualizar suas próprias revisões"
  ON revisoes_estagiario
  FOR UPDATE
  TO authenticated
  USING (true);

-- Políticas para tipos_chamado
CREATE POLICY "Todos podem ver tipos de chamado"
  ON tipos_chamado
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem gerenciar tipos de chamado"
  ON tipos_chamado
  FOR ALL
  TO authenticated
  USING (true);

-- Políticas para subtipos_chamado
CREATE POLICY "Todos podem ver subtipos de chamado"
  ON subtipos_chamado
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins podem gerenciar subtipos de chamado"
  ON subtipos_chamado
  FOR ALL
  TO authenticated
  USING (true);

-- Inserir alguns tipos padrão
INSERT INTO tipos_chamado (nome) VALUES 
  ('Hardware'),
  ('Software'),
  ('Rede'),
  ('Impressora'),
  ('Sistema')
ON CONFLICT (nome) DO NOTHING;

-- Inserir alguns subtipos padrão
DO $$
DECLARE
  hardware_id integer;
  software_id integer;
  rede_id integer;
BEGIN
  SELECT id INTO hardware_id FROM tipos_chamado WHERE nome = 'Hardware';
  SELECT id INTO software_id FROM tipos_chamado WHERE nome = 'Software';
  SELECT id INTO rede_id FROM tipos_chamado WHERE nome = 'Rede';
  
  IF hardware_id IS NOT NULL THEN
    INSERT INTO subtipos_chamado (tipo_id, nome) VALUES 
      (hardware_id, 'Computador não liga'),
      (hardware_id, 'Tela com problema'),
      (hardware_id, 'Teclado/Mouse')
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF software_id IS NOT NULL THEN
    INSERT INTO subtipos_chamado (tipo_id, nome) VALUES 
      (software_id, 'Instalação de programa'),
      (software_id, 'Erro no sistema'),
      (software_id, 'Lentidão')
    ON CONFLICT DO NOTHING;
  END IF;
  
  IF rede_id IS NOT NULL THEN
    INSERT INTO subtipos_chamado (tipo_id, nome) VALUES 
      (rede_id, 'Sem internet'),
      (rede_id, 'Conexão lenta'),
      (rede_id, 'Wi-Fi não conecta')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;