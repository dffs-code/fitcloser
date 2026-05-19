-- Supabase migration: FitCloser MVP schema

create extension if not exists pgcrypto;

create table if not exists business_settings (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null unique references auth.users(id) on delete cascade,
  business_name text not null,
  contact_email text not null,
  phone text,
  brand_color text default '#3b82f6',
  logo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  phone text,
  email text,
  age int,
  goal text,
  source text,
  status text not null default 'New Lead',
  tags text[] default array[]::text[],
  notes text,
  next_follow_up timestamptz,
  estimated_value numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists proposals (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid references leads(id) on delete set null,
  title text not null,
  plan text not null,
  frequency text not null,
  duration_weeks int not null,
  price numeric(10,2) not null,
  observations text,
  payment_conditions text,
  status text not null default 'draft',
  token text not null unique,
  viewed_at timestamptz,
  accepted_at timestamptz,
  rejected_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists contracts (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid references leads(id) on delete set null,
  title text not null,
  template text,
  variables jsonb default '{}'::jsonb,
  status text not null default 'pending',
  signature text,
  signed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists follow_ups (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid references leads(id) on delete set null,
  note text not null,
  due_at timestamptz not null,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists message_templates (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  title text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists activities (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references auth.users(id) on delete cascade,
  lead_id uuid references leads(id) on delete set null,
  description text not null,
  created_at timestamptz not null default now()
);

alter table business_settings enable row level security;
alter table leads enable row level security;
alter table proposals enable row level security;
alter table contracts enable row level security;
alter table follow_ups enable row level security;
alter table message_templates enable row level security;
alter table activities enable row level security;

create policy "Authenticated business access" on business_settings
  for all
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

create policy "Authenticated lead access" on leads
  for all
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

create policy "Authenticated proposal access" on proposals
  for all
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

create policy "Authenticated contract access" on contracts
  for all
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

create policy "Authenticated follow-up access" on follow_ups
  for all
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

create policy "Authenticated template access" on message_templates
  for all
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

create policy "Authenticated activity access" on activities
  for all
  using (trainer_id = auth.uid())
  with check (trainer_id = auth.uid());

comment on table business_settings is 'Configurações de perfil e marca para propostas e contratos.';
comment on table leads is 'Leads do pipeline para treinadores pessoais com status, follow-ups e estimativas de valor.';
comment on table proposals is 'Registros de propostas com tokens compartilháveis, preços e status de aceitação.';
comment on table contracts is 'Acordos de serviço, status de assinatura e controle de vencimento.';
comment on table follow_ups is 'Lembretes de follow-up do cliente e controle de conclusão.';
comment on table message_templates is 'Modelos reutilizáveis prontos para WhatsApp com categorias.';
comment on table activities is 'Eventos recentes de atividade para feed do painel e histórico de lead.';

-- Seed demo data for a sample trainer
insert into leads (trainer_id, name, phone, email, age, goal, source, status, tags, notes, next_follow_up, estimated_value) values
('11111111-1111-1111-1111-111111111111', 'Gabriel Costa', '+55 11 98877-6655', 'gabriel@example.com', 29, 'Perder 8 kg e ganhar confiança', 'Instagram', 'Contacted', array['feminino','emagrecimento'], 'Seguiu após a consulta inicial.', now() + interval '2 days', 2600.00),
('11111111-1111-1111-1111-111111111111', 'Julia Soares', '+55 21 99955-2200', 'julia@example.com', 34, 'Ganhar massa muscular para casamento', 'Indicação', 'Proposal Sent', array['noiva','força'], 'Pronta para o programa de demonstração. Enviar proposta.', now() + interval '3 days', 4500.00),
('11111111-1111-1111-1111-111111111111', 'Rafael Lima', '+55 31 98844-1100', 'rafael@example.com', 41, 'Recuperar de dor no joelho', 'WhatsApp', 'New Lead', array['reabilitação'], 'Perguntar sobre frequência de treino.', now() + interval '5 days', 1800.00);

insert into proposals (trainer_id, lead_id, title, plan, frequency, duration_weeks, price, observations, payment_conditions, status, token) values
('11111111-1111-1111-1111-111111111111', (select id from leads where email = 'julia@example.com'), 'Plano para casamento', 'Treino de força', '3 sessões / semana', 12, 349.00, 'Inclui acompanhamento nutricional, chamadas semanais e ajuste de programa.', '50% na assinatura, 50% na semana 6.', 'sent', 'sample-wedding-token-001');

insert into contracts (trainer_id, lead_id, title, template, variables, status, expires_at) values
('11111111-1111-1111-1111-111111111111', (select id from leads where email = 'gabriel@example.com'), 'Acordo de serviço para Gabriel Costa', 'Contrato padrão de coaching com escopo e termos de pagamento.', '{"clientName":"Gabriel Costa"}', 'pending', now() + interval '30 days');

insert into follow_ups (trainer_id, lead_id, note, due_at, completed) values
('11111111-1111-1111-1111-111111111111', (select id from leads where email = 'gabriel@example.com'), 'Confirmar horário da primeira sessão', now() + interval '2 days', false),
('11111111-1111-1111-1111-111111111111', (select id from leads where email = 'rafael@example.com'), 'Enviar questionário de avaliação de dor', now() + interval '5 days', false);

insert into message_templates (trainer_id, category, title, body) values
('11111111-1111-1111-1111-111111111111', 'Primeiro contato', 'Primeiro contato', 'Oi {{name}}, aqui é o {{trainer}}. Vi que você está interessado em treinar. Quando podemos conversar?'),
('11111111-1111-1111-1111-111111111111', 'Acompanhamento', 'Follow-up amigável', 'Olá {{name}}, só passando para saber se você teve tempo de ler a proposta. Posso ajudar com alguma dúvida?'),
('11111111-1111-1111-111111111111', 'Proposta enviada', 'Proposta enviada', 'Enviei a proposta via FitCloser. Quando puder, confira e me avise se quiser ajustar algo.');

insert into activities (trainer_id, lead_id, description) values
('11111111-1111-1111-1111-111111111111', (select id from leads where email = 'julia@example.com'), 'Proposta enviada para Julia.'),
('11111111-1111-1111-1111-111111111111', (select id from leads where email = 'gabriel@example.com'), 'Lembrete de follow-up agendado.'),
('11111111-1111-1111-1111-111111111111', (select id from leads where email = 'rafael@example.com'), 'Novo lead adicionado pelo WhatsApp.');
