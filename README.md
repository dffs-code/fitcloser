 # FitCloser — MVP SaaS

 FitCloser é um MVP SaaS em Next.js (App Router) voltado para treinadores pessoais gerenciarem leads, propostas, contratos, follow-ups e o pipeline de vendas.

 ## Stack

 - Next.js (App Router)
 - TypeScript
 - Tailwind CSS
 - shadcn/ui (componentes)
 - Supabase Auth + Postgres + RLS
 - React Hook Form + Zod
 - Recharts
 - Framer Motion
 - Zustand (quando aplicável)

 ## Configuração do ambiente

 Copie `.env.example` para `.env` e preencha com os valores do seu projeto Supabase.

 Variáveis obrigatórias:

 - `NEXT_PUBLIC_SUPABASE_URL`
 - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
 - `SUPABASE_SERVICE_ROLE_KEY`

 ## Configuração do Supabase

 1. Crie um projeto no Supabase.
 2. Abra o editor SQL e execute a migration:

    - `supabase/migrations/20260516000000_init.sql`

 3. Ative o Authentication e configure o login por e-mail.
 4. (Opcional) Crie um bucket de storage para assets das propostas:

    - Nome do bucket: `proposal-assets`
    - Acesso público: opcional (caso queira arquivos públicos)

 ## Desenvolvimento local

 Instale dependências e inicie o app:

 ```bash
 npm install
 npm run dev
 ```

 Acesse: http://localhost:3000

 ## Tabelas principais do banco

 - `business_settings`
 - `leads`
 - `proposals`
 - `contracts`
 - `follow_ups`
 - `message_templates`
 - `activities`

 ## Visualização pública de propostas

 A visualização pública da proposta fica em `app/public/proposal/[token]/page.tsx` e utiliza uma rota que atualiza o status por meio do service role (aceitação).

 ## Criação de novo contrato

 - `app/contracts/page.tsx` lista contratos
 - `app/contracts/new/page.tsx` fornece o formulário de criação
 - `app/api/contracts/route.ts` trata a criação no backend

 ## Observações

 - Os dados de exemplo na migration usam um `trainer_id` de demo (`11111111-1111-1111-1111-111111111111`).
 - Para ver os dados seed, crie um usuário no Supabase com o mesmo UID ou ajuste os IDs na migration para sua conta.
 - O projeto foi estruturado com um layout protegido e checagens de autenticação no servidor para as páginas do painel.
