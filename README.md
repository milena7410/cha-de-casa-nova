# Chá de Casa Nova da Bruna

Site de lista de presentes para chá de casa nova, com reservas em tempo real,
links de compra, mural de recados e painel administrativo.

### [Abrir o site publicado](https://cha-casa-nova-bruna.ubsf-mata-do-jacinto.workers.dev)

O painel fica em
[`/admin`](https://cha-casa-nova-bruna.ubsf-mata-do-jacinto.workers.dev/admin)
e exige a senha configurada em `ADMIN_PASSWORD`.

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

| Camada | Tecnologia |
| --- | --- |
| Aplicação | Next.js 16, React 19 e TypeScript |
| Interface | Tailwind CSS 4, Base UI e Lucide |
| Banco | PostgreSQL Neon, Drizzle ORM e driver serverless |
| Hospedagem | Cloudflare Workers e OpenNext |

## Requisitos

- Node.js 20 ou mais recente;
- pnpm 10;
- um banco PostgreSQL (o plano gratuito do Neon é suficiente);
- uma conta gratuita no Cloudflare para publicar.

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

6. Abra:

   - site: [http://localhost:3000](http://localhost:3000)
   - admin: [http://localhost:3000/admin](http://localhost:3000/admin)

## Publicar no Cloudflare

O projeto usa o adaptador OpenNext para rodar o Next.js completo no Cloudflare
Workers, incluindo Server Actions e as rotas dinâmicas do admin.

1. Faça login no Cloudflare:

   ```bash
   pnpm wrangler login
   ```

2. Crie o arquivo de produção a partir do exemplo:

   ```bash
   cp .env.example .env.production
   ```

3. Preencha `DATABASE_URL`, `ADMIN_PASSWORD` e `ADMIN_SECRET` no
   `.env.production`. Esse arquivo está ignorado pelo Git e não deve ser
   enviado para repositórios.

4. No primeiro deploy, envie código e segredos juntos:

   ```bash
   pnpm deploy:setup
   ```

   O Wrangler mostrará um endereço público no formato
   `https://cha-casa-nova-bruna.<sua-conta>.workers.dev`.

5. Nos próximos deploys, use:

   ```bash
   pnpm deploy
   ```

Os segredos ficam criptografados no Cloudflare. O deploy usa `--keep-vars` para
não remover as variáveis que já estiverem configuradas.

## Prévia no runtime do Cloudflare

Para compilar e abrir uma prévia no runtime do Cloudflare:

```bash
pnpm preview
```

O `pnpm dev` continua sendo o comando mais rápido para trabalhar no dia a dia.

## Configurar o banco

No [Neon](https://neon.tech):

1. crie um projeto PostgreSQL gratuito;
2. copie a connection string com SSL;
3. use essa string como `DATABASE_URL`;
4. execute `database/schema.sql` uma vez.

Não use um arquivo local como banco na hospedagem: reservas e alterações do
admin precisam ser compartilhadas entre todos os convidados.

## Comandos úteis

| Comando | Função |
| --- | --- |
| `pnpm dev` | desenvolvimento local |
| `pnpm build` | build de produção do Next.js |
| `pnpm preview` | prévia no runtime do Cloudflare |
| `pnpm deploy:setup` | primeiro deploy com segredos |
| `pnpm deploy` | próximos deploys |
| `pnpm cf-typegen` | gera tipos dos bindings Cloudflare |

## Estrutura principal

```text
app/
  admin/               painel e ações administrativas
  actions/gifts.ts     reservas e recados
components/
  admin-panel.tsx      interface do admin
  gift-board.tsx       lista e filtros
  message-wall.tsx     mural de recados
database/schema.sql    criação das tabelas
lib/db/                conexão e schema Drizzle
wrangler.jsonc         configuração do Cloudflare Worker
```

## Segurança

- nunca envie `.env.local` ou `.env.production` para o Git;
- nunca coloque a senha do admin no README;
- mantenha `ADMIN_SECRET` longo e aleatório;
- se uma credencial do banco vazar, gere uma nova no Neon.
