# GreensManage

SaaS de gestão de banca para apostas esportivas: cada cliente cria a conta, registra as entradas e acompanha banca, ROI, taxa de acerto e meta mensal. Interface em vidro líquido verde, tema claro e escuro, pronta para celular.

## Dois modos

| Modo | Quando | O que acontece |
|---|---|---|
| **Demo** | sem variáveis do Supabase | Uma conta demo (`demo@greensmanage.app` / `demo1234`) com 30 dias de dados de exemplo. O que o visitante muda fica num cookie assinado, só dele. Bom para mostrar a clientes. |
| **Supabase** | `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` definidas | Cadastro, login, confirmação por e-mail, recuperação de senha e dados reais. Cada usuário só enxerga os próprios dados (Row Level Security no Postgres). |

## Stack

| Camada | Tecnologia |
|---|---|
| App | Next.js 16 (App Router, Server Components, Server Actions, Cache Components, Proxy) |
| Linguagem | TypeScript strict |
| UI | React 19, Tailwind CSS 4, Motion, Lucide |
| Backend | Supabase: Auth + Postgres com RLS, migrações em `supabase/migrations` |
| Validação | Zod em toda entrada do usuário |
| Testes | Vitest |

## Estrutura

```
src/
  app/
    (auth)/              login, cadastro, esqueci-senha, nova-senha
    (app)/               painel (/) e minha conta (/conta), protegidos
    auth/confirm/        recebe os links de e-mail do Supabase
    actions/             Server Actions: auth, bets, profile
  components/
    auth/ account/       formulários
    dashboard/           um componente por card do painel
    ui/                  primitivos: Card, Chip, Segmented, Sparkline, Toast...
  lib/
    backend/             interface única + implementações supabase.ts e demo.ts
    supabase/            clientes (server, proxy) e tipos do banco
    dal.ts               Data Access Layer: requisição → usuário
    stats.ts             todos os números do painel (função pura, testada)
    validation.ts        schemas Zod
  proxy.ts               renova a sessão e barra quem não está logado
supabase/
  migrations/            tabelas, RLS, trigger que cria o perfil no cadastro
  config.toml
tests/                   Vitest
```

## Rodar localmente

```bash
npm install
cp .env.example .env.local   # deixe o Supabase vazio para o modo demo
npm run dev
```

## Ligar o Supabase

1. Crie um projeto em supabase.com e copie a URL e a publishable key (Project Settings → API) para `.env.local` / Vercel.
2. Aplique o banco:
   ```bash
   npx supabase login
   npm run db:link     # escolha o projeto
   npm run db:push     # roda supabase/migrations
   npm run db:types    # opcional: regenera os tipos
   ```
3. Em Authentication → URL Configuration, coloque a URL do site e adicione `https://SEU-DOMINIO/auth/confirm` nas Redirect URLs.
4. Em Authentication → Email Templates, troque o link dos modelos "Confirm signup" e "Reset password" para
   `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type={{ .Type }}&next={{ .RedirectTo }}`.
5. Faça um novo deploy (as variáveis `NEXT_PUBLIC_*` entram no build).

## Qualidade

```bash
npm run check   # typecheck + lint + testes
npm run build
```
