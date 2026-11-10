# VieiraStock

Sistema de Estoque TI — gerenciamento de inventário de tecnologia, chamados técnicos e ferramentas de apoio para a equipe de TI.

## Funcionalidades

- **Dashboard** com indicadores de estoque, chamados e eventos
- **Estoque**: categorias e produtos, alerta de estoque baixo, ajuste rápido de quantidade com histórico de movimentações
- **Chamados**: abertura, edição e mudança de status (aberto → em andamento → resolvido), tipos/subtipos, histórico com exportação
- **Calendário** de eventos (assinaturas, tarefas, lembretes) com chamados do dia
- **Anotações** (texto ou lista de tarefas), privadas ou públicas
- **Gerenciador de senhas** pessoal com gerador de senhas fortes
- **Relatórios** em Excel (produtos, categorias, eventos, chamados, usuários)
- **Administração**: usuários e permissões, empresas, setores, tipos de chamado

## Perfis de acesso

| Perfil | Acesso |
| --- | --- |
| Administrador | Tudo, incluindo Configurações, Relatórios e Histórico de Chamados |
| Usuário | Dashboard, Chamados, Estoque e Ferramentas |
| Estagiário | Dashboard, Chamados e Ferramentas |
| Supervisor | Apenas Chamados da própria empresa (abre e acompanha) |

## Tecnologias

React 18 + TypeScript, Vite, Tailwind CSS, Supabase (PostgreSQL), Lucide React, SheetJS (xlsx).

## Configuração

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Crie um projeto no [Supabase](https://supabase.com) e aplique as migrations da pasta `supabase/migrations`, em ordem (pelo SQL Editor ou com `supabase db push`).
3. Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. Rode em desenvolvimento:
   ```bash
   npm run dev
   ```
5. Build de produção:
   ```bash
   npm run build
   ```

## Login padrão

Criado pela migration `20251110000000_finalizacao.sql`:

- Usuário: `AdminMaster`
- Senha: `@dminM@ster`

**Troque essa senha logo após o primeiro acesso** (Configurações > Usuários).

## Segurança

- As senhas de login são armazenadas com bcrypt (`pgcrypto`) e verificadas no banco pela função `autenticar_usuario`; a coluna `usuarios.senha` não é legível pela API.
- O sistema usa login próprio (não o Supabase Auth), então as requisições chegam ao banco com o papel `anon` e as políticas RLS liberam as tabelas para esse papel. Qualquer pessoa com a URL e a chave anon consegue acessar os dados pela API. Para uso em rede pública, o recomendado é migrar para o Supabase Auth e restringir as políticas por usuário.
- As senhas do Gerenciador de Senhas ficam em texto no banco (coluna `senha_criptografada`); não guarde ali credenciais críticas enquanto não houver criptografia.

## Scripts

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Servir o build localmente |
| `npm run lint` | ESLint |
