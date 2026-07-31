# Chá de Casa Nova da Bruna

Site de lista de presentes para chá de casa nova da minha namorada, com reservas em tempo real, links de compra, mural de recados e painel administrativo.

### [site publicado](https://cha-casa-nova-bruna.milenaalegre.workers.dev)

A aplicacao conta com um painel admin onde sao adicionados os itens, links etc

## Funcionalidades

- interface responsiva para celular e computador;
- busca, filtro por cômodo, filtro por preço e ordenação;
- reserva e liberação de presentes em tempo real;
- preço e link externo para cada sugestão;
- mural de recados dos convidados;
- painel para cadastrar, editar, ordenar e excluir presentes;
- autenticação do admin por cookie seguro;
- banco PostgreSQL Neon;
- deploy gratuito no Cloudflare Workers.

## Tecnologias

Aplicação: Next.js 16, React 19 e TypeScript |
Interface: Tailwind CSS 4, Base UI e Lucide |
Banco: PostgreSQL Neon, Drizzle ORM e driver serverless |
Hospedagem: Cloudflare Workers e OpenNext |

## Requisitos

- Node.js 20 ou mais recente;
- pnpm 10;
- um banco PostgreSQL 

## Rodar localmente

1. Instale as dependências:

   ```bash
   npm install -g pnpm@10
   pnpm install --frozen-lockfile
   ```

2. Crie o arquivo local de variáveis:

   ```bash
   cp .env.example .env.local
   ```

3. Preencha o `.env.local`:

   ```env
   DATABASE_URL=postgresql://usuario:senha@host/banco?sslmode=require
   ADMIN_PASSWORD=uma-senha-forte
   ADMIN_SECRET=uma-chave-aleatoria-longa
   ```

   `ADMIN_PASSWORD` deve ter pelo menos 8 caracteres. Para gerar o
   `ADMIN_SECRET`, você pode usar:

   ```bash
   openssl rand -hex 32
   ```

4. Crie as tabelas no banco:

   ```bash
   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/schema.sql
   ```

   Se o seu terminal não carregar automaticamente o `.env.local`, copie a
   conexão e passe diretamente ao `psql`.

5. Inicie o projeto:

   ```bash
   pnpm dev
   ```