/*
  # Finalização do sistema

  1. Chamados: colunas tipo_id / subtipo_id ligadas a tipos_chamado / subtipos_chamado
  2. Nova tabela movimentacoes_estoque (histórico de entradas/saídas)
  3. Senhas de usuários armazenadas com bcrypt (pgcrypto) + trigger
  4. Função RPC `autenticar_usuario` para login sem expor a coluna `senha`
  5. Coluna `usuarios.senha` deixa de ser legível pela API
  6. Políticas RLS para o papel `anon` (a aplicação usa login próprio,
     não o Supabase Auth, então as requisições chegam como `anon`)
  7. Empresa e usuário administrador padrão
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1. Tipos de chamado -------------------------------------------------------
ALTER TABLE chamados
  ADD COLUMN IF NOT EXISTS tipo_id integer REFERENCES tipos_chamado(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subtipo_id integer REFERENCES subtipos_chamado(id) ON DELETE SET NULL;

-- 2. Movimentações de estoque -----------------------------------------------
CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
  id serial PRIMARY KEY,
  produto_id integer NOT NULL REFERENCES produtos(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  quantidade integer NOT NULL CHECK (quantidade > 0),
  observacao text,
  usuario_id integer REFERENCES usuarios(id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE movimentacoes_estoque ENABLE ROW LEVEL SECURITY;

-- 3. Hash de senhas -----------------------------------------------------------
CREATE OR REPLACE FUNCTION hash_senha_usuario()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public, extensions
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND NEW.senha IS NOT DISTINCT FROM OLD.senha THEN
    RETURN NEW;
  END IF;
  -- Não re-hasheia valores que já são hashes bcrypt
  IF NEW.senha !~ '^\$2[abxy]\$' THEN
    NEW.senha := crypt(NEW.senha, gen_salt('bf'));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_hash_senha_usuario ON usuarios;
CREATE TRIGGER trg_hash_senha_usuario
  BEFORE INSERT OR UPDATE OF senha ON usuarios
  FOR EACH ROW EXECUTE FUNCTION hash_senha_usuario();

-- Converte senhas existentes em texto puro
UPDATE usuarios
SET senha = extensions.crypt(senha, extensions.gen_salt('bf'))
WHERE senha !~ '^\$2[abxy]\$';

-- 4. Login via RPC ------------------------------------------------------------
CREATE OR REPLACE FUNCTION autenticar_usuario(p_nome_usuario text, p_senha text)
RETURNS TABLE (
  id integer,
  nome text,
  nome_usuario text,
  email text,
  funcao text,
  empresa_id integer,
  setor_id integer,
  criado_em timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
  SELECT u.id, u.nome, u.nome_usuario, u.email, u.funcao, u.empresa_id, u.setor_id, u.criado_em
  FROM usuarios u
  WHERE u.nome_usuario = p_nome_usuario
    AND u.senha = crypt(p_senha, u.senha);
$$;

REVOKE ALL ON FUNCTION autenticar_usuario(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION autenticar_usuario(text, text) TO anon, authenticated;

-- 5. Esconde a coluna senha da API -------------------------------------------
REVOKE SELECT ON usuarios FROM anon, authenticated;
GRANT SELECT (id, nome, nome_usuario, email, funcao, empresa_id, setor_id, criado_em)
  ON usuarios TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON usuarios TO anon, authenticated;

-- 6. Políticas RLS para o papel anon -----------------------------------------
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'empresas', 'setores', 'usuarios', 'categorias', 'produtos',
    'eventos_calendario', 'anotacoes', 'senhas', 'chamados',
    'tipos_chamado', 'subtipos_chamado', 'revisoes_estagiario',
    'movimentacoes_estoque'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies
      WHERE schemaname = 'public' AND tablename = t AND policyname = 'app_acesso_total'
    ) THEN
      EXECUTE format(
        'CREATE POLICY app_acesso_total ON %I FOR ALL TO anon, authenticated USING (true) WITH CHECK (true)',
        t
      );
    END IF;
  END LOOP;
END $$;

-- 7. Dados padrão -------------------------------------------------------------
INSERT INTO empresas (nome, descricao)
SELECT 'Empresa Principal', 'Empresa principal do sistema'
WHERE NOT EXISTS (SELECT 1 FROM empresas WHERE nome = 'Empresa Principal');

INSERT INTO usuarios (nome, nome_usuario, email, senha, funcao, empresa_id)
SELECT 'Administrador Master', 'AdminMaster', 'admin@sistema.com', '@dminM@ster', 'administrador',
       (SELECT id FROM empresas WHERE nome = 'Empresa Principal' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE nome_usuario = 'AdminMaster');
