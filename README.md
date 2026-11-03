# GreensManage

Painel de gestão de banca de apostas esportivas, com login, em vidro líquido verde.

## Stack

| Camada | Tecnologia |
|---|---|
| App | Next.js 16 (App Router, Server Components, Server Actions, Cache Components) |
| Linguagem | TypeScript strict |
| UI | React 19, Tailwind CSS 4, Motion, Lucide |
| Banco | Postgres + Drizzle ORM (migrações versionadas em `drizzle/`) |
| Auth | Senha com scrypt, sessão JWT (jose) em cookie HttpOnly, bloqueio após 5 erros |
| Validação | Zod em toda entrada do usuário |
| Testes | Vitest (regras de negócio e senha) |

## Estrutura

```
src/
  app/
    (auth)/login/        tela de login
    (app)/page.tsx       painel (protegido)
    actions/             Server Actions: auth.ts, bets.ts
    layout.tsx           fontes, tema sem flash, filtro de vidro
  components/
    auth/                formulário de login
    dashboard/           um componente por card do painel
    ui/                  primitivos: Card, Chip, Segmented, Sparkline, Toast...
  db/                    schema.ts (tabelas) e cliente Drizzle
  lib/
    dal.ts               Data Access Layer: cookie → usuário (único ponto de auth)
    session.ts           criar/ler/apagar sessão
    password.ts          hash scrypt
    stats.ts             todos os números do painel (função pura, testada)
    queries.ts           leitura do banco para o painel
  proxy.ts               barra quem não tem sessão antes de renderizar
scripts/seed.ts          cria o usuário dono e o histórico de exemplo
drizzle/                 migrações SQL
tests/                   Vitest
```

As tabelas ficam no schema Postgres `greensmanage`, então o app pode dividir um banco com outros projetos.

## Rodar localmente

```bash
cp .env.example .env.local   # preencha DATABASE_URL, SESSION_SECRET e SEED_PASSWORD
npm install
npm run db:migrate           # cria o schema e as tabelas
npm run db:seed              # cria o usuário e 30 dias de histórico
npm run dev
```

## Qualidade

```bash
npm run check   # typecheck + lint + testes
npm run build
```

## Deploy (Vercel)

1. Variáveis no projeto: `DATABASE_URL` (URL com pooler) e `SESSION_SECRET` (`openssl rand -hex 32`).
2. Rode `npm run db:migrate` e `npm run db:seed` apontando para o banco de produção.
3. Para trocar a senha: rode `npm run db:seed` de novo com outra `SEED_PASSWORD`. O histórico é mantido.
