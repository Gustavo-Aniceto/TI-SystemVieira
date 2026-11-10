/*
  # Schema base do VieiraStock

  Cria as tabelas principais usadas pela aplicação. Todas usam
  IF NOT EXISTS para que a migration seja segura em bancos que já
  possuem estas tabelas.

  Tabelas: empresas, setores, usuarios, categorias, produtos,
  eventos_calendario, anotacoes, senhas, chamados
*/

CREATE TABLE IF NOT EXISTS empresas (
  id serial PRIMARY KEY,
  nome text NOT NULL,
  descricao text,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS setores (
  id serial PRIMARY KEY,
  nome text NOT NULL,
  empresa_id integer NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id serial PRIMARY KEY,
  nome text NOT NULL,
  nome_usuario text NOT NULL UNIQUE,
  email text NOT NULL,
  senha text NOT NULL,
  funcao text NOT NULL DEFAULT 'usuario'
    CHECK (funcao IN ('usuario', 'administrador', 'supervisor', 'estagiario')),
  empresa_id integer REFERENCES empresas(id) ON DELETE SET NULL,
  setor_id integer REFERENCES setores(id) ON DELETE SET NULL,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS categorias (
  id serial PRIMARY KEY,
  nome text NOT NULL,
  descricao text,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS produtos (
  id serial PRIMARY KEY,
  nome text NOT NULL,
  descricao text,
  categoria_id integer NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
  status text NOT NULL DEFAULT 'ativo'
    CHECK (status IN ('ativo', 'inativo', 'em_manutencao')),
  quantidade integer NOT NULL DEFAULT 0 CHECK (quantidade >= 0),
  quantidade_minima integer NOT NULL DEFAULT 0 CHECK (quantidade_minima >= 0),
  numero_serie text,
  localizacao text,
  data_compra date,
  fim_garantia date,
  notas text,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS eventos_calendario (
  id serial PRIMARY KEY,
  titulo text NOT NULL,
  descricao text,
  tipo text NOT NULL CHECK (tipo IN ('assinatura', 'tarefa', 'lembrete')),
  data_inicio timestamptz NOT NULL,
  data_termino timestamptz NOT NULL,
  cor text,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS anotacoes (
  id serial PRIMARY KEY,
  titulo text NOT NULL,
  conteudo text NOT NULL DEFAULT '',
  cor_fundo text,
  tornar_publico boolean NOT NULL DEFAULT false,
  criado_por integer REFERENCES usuarios(id) ON DELETE CASCADE,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS senhas (
  id serial PRIMARY KEY,
  sistema text NOT NULL,
  usuario_acesso text NOT NULL,
  senha_criptografada text NOT NULL,
  categoria text,
  observacoes text,
  criado_por integer REFERENCES usuarios(id) ON DELETE CASCADE,
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chamados (
  id serial PRIMARY KEY,
  problema text NOT NULL,
  supervisor_id integer NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
  posicao_operador text,
  empresa_id integer NOT NULL REFERENCES empresas(id) ON DELETE RESTRICT,
  setor_id integer NOT NULL REFERENCES setores(id) ON DELETE RESTRICT,
  id_acesso text,
  anexo text,
  status text NOT NULL DEFAULT 'aberto'
    CHECK (status IN ('aberto', 'em_andamento', 'resolvido')),
  criado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE setores ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos_calendario ENABLE ROW LEVEL SECURITY;
ALTER TABLE anotacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE senhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE chamados ENABLE ROW LEVEL SECURITY;
