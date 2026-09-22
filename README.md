# Chá de Casa Nova da Brenda

Site de lista de presentes para chá de casa nova da minha namorada, com reservas em tempo real, links de compra, mural de recados e painel administrativo.

A aplicação conta com um painel admin onde são adicionados os itens, links etc.

### Site publicado atualmente

https://cha-casa-nova-bruna.milenaalegre.workers.dev

O conteúdo da Brenda foi publicado nesse Worker existente para preservar o banco e as variáveis
atuais. A configuração do próximo Worker já usa o nome `cha-casa-nova-brenda`.

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

## Publicar no Cloudflare Workers

O projeto já está configurado com OpenNext e Wrangler. Faça login uma vez e publique:

```bash
pnpm exec wrangler login
pnpm deploy:setup
```

O comando usa o nome `cha-casa-nova-brenda`, que gera uma URL `*.workers.dev` própria.
Para usar uma URL personalizada, abra o Worker no painel da Cloudflare e adicione o domínio em
**Settings → Domains & Routes → Add Custom Domain**. O domínio precisa estar na conta Cloudflare.

Antes do primeiro deploy, deixe o arquivo `.env.production` preenchido com `DATABASE_URL`,
`ADMIN_PASSWORD` e `ADMIN_SECRET`; ele não deve ser commitado.
