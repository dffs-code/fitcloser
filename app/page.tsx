import Link from "next/link";

const stats = [
  { value: "1.200+", label: "Treinadores ativos" },
  { value: "38%", label: "Aumento médio em conversões" },
  { value: "R$ 80M+", label: "Em propostas fechadas" },
  { value: "4,9 ★", label: "Avaliação dos usuários" },
];

const features = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <rect x="3" y="3" width="7" height="18" rx="2" />
        <rect x="14" y="3" width="7" height="10" rx="2" />
        <rect x="14" y="17" width="7" height="4" rx="2" />
      </svg>
    ),
    title: "Pipeline visual de vendas",
    description: "Arraste seus leads do primeiro contato até o fechamento. Nada cai no esquecimento."
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    title: "Propostas com link único",
    description: "Envie uma proposta profissional com um link. O cliente aceita com um clique — e você é notificado na hora."
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
      </svg>
    ),
    title: "Contratos digitais",
    description: "Gere contratos completos em segundos. Profissionalismo que converte e protege você."
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    title: "Follow-ups inteligentes",
    description: "Receba lembretes de quem precisa de atenção agora. Nunca mais perca uma janela de fechamento."
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "Modelos para WhatsApp",
    description: "Mensagens personalizadas com nome do lead, objetivo e mais. Envie com um clique direto para o WhatsApp."
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
    title: "Dashboard em tempo real",
    description: "Receita, leads ativos, conversão e follow-ups. Tudo numa tela, atualizado a cada ação."
  },
];

const pains = [
  "Lead que respondeu e você esqueceu de acompanhar",
  "Proposta no Word que nunca virou contrato assinado",
  "Follow-up que ficou para amanhã… e para o outro",
  "Cliente que sumiu porque a concorrência respondeu primeiro",
];

const steps = [
  {
    number: "01",
    title: "Cadastre seus leads",
    description: "Adicione prospects do Instagram, indicação ou qualquer fonte. Organize em segundos com campos de objetivo, telefone e valor estimado."
  },
  {
    number: "02",
    title: "Envie uma proposta profissional",
    description: "Crie e compartilhe um link de proposta com preço, plano e condições. O cliente aceita digitalmente — e o pipeline atualiza sozinho."
  },
  {
    number: "03",
    title: "Feche mais, esqueça menos",
    description: "Follow-ups automáticos, contratos gerados e dashboard atualizado. Você foca em treinar e vender, o FitCloser cuida do resto."
  },
];

const testimonials = [
  {
    quote: "Antes eu perdia leads toda semana por falta de organização. Com o FitCloser, fechei 3 novos alunos já no primeiro mês de uso.",
    name: "Lucas Andrade",
    role: "Personal Trainer · São Paulo",
    initials: "LA",
    color: "bg-brand-100 text-brand-700",
  },
  {
    quote: "O link de proposta mudou tudo. O cliente abre, lê e aceita na hora. Minha conversão foi de 22% para 51% em dois meses.",
    name: "Fernanda Costa",
    role: "Personal Trainer · Belo Horizonte",
    initials: "FC",
    color: "bg-emerald-100 text-emerald-700",
  },
  {
    quote: "Nunca mais esqueci um follow-up. O sistema me avisa quem está esfriando e eu ajo antes de perder o lead.",
    name: "Rodrigo Mendes",
    role: "Personal Trainer · Curitiba",
    initials: "RM",
    color: "bg-amber-100 text-amber-700",
  },
];

export default function HomePage() {
  return (
    <main className="overflow-x-hidden bg-white">

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
          <span className="flex items-center gap-2">
            <img src="/fitcloser.svg" alt="" className="h-8 w-8 rounded-xl" aria-hidden="true" />
            <span className="text-xl font-bold tracking-tight text-slate-950">FitCloser</span>
          </span>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
              Entrar
            </Link>
            <Link href="/login">
              <button className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-500">
                Comece grátis
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-6 pb-24 pt-20 sm:px-10 sm:pb-32 sm:pt-28">

        {/* Background layer stack */}
        <div aria-hidden className="pointer-events-none absolute inset-0">

          {/* Dot grid — fades radially from top */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(60,93,255,0.13) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              WebkitMaskImage: "radial-gradient(ellipse 90% 65% at 50% 0%, black 20%, transparent 100%)",
              maskImage: "radial-gradient(ellipse 90% 65% at 50% 0%, black 20%, transparent 100%)",
            }}
          />

          {/* Primary glow blob — top center */}
          <div className="absolute -top-32 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-brand-500/[0.09] blur-3xl" />
          {/* Secondary blob — upper right */}
          <div className="absolute -right-24 -top-24 h-[420px] w-[420px] rounded-full bg-violet-400/[0.07] blur-3xl" />
          {/* Tertiary blob — left center */}
          <div className="absolute -left-32 top-[35%] h-[320px] w-[320px] rounded-full bg-sky-400/[0.07] blur-3xl" />

          {/* Orbital radar rings — large, top-right, partially cropped */}
          <svg
            className="absolute -right-28 -top-20 h-[620px] w-[620px] text-brand-600"
            viewBox="0 0 620 620"
            fill="none"
          >
            <circle cx="310" cy="310" r="300" stroke="currentColor" strokeWidth="1" strokeOpacity="0.07" strokeDasharray="8 5" />
            <circle cx="310" cy="310" r="225" stroke="currentColor" strokeWidth="1" strokeOpacity="0.06" />
            <circle cx="310" cy="310" r="155" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.07" fill="currentColor" fillOpacity="0.025" />
            <circle cx="310" cy="310" r="55"  stroke="currentColor" strokeWidth="1"   strokeOpacity="0.08" fill="currentColor" fillOpacity="0.04" />
            {/* Cross-hairs */}
            <line x1="310" y1="5"   x2="310" y2="615" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.05" strokeDasharray="5 5" />
            <line x1="5"   y1="310" x2="615" y2="310" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.05" strokeDasharray="5 5" />
          </svg>

          {/* Smaller orbit — bottom left */}
          <svg
            className="absolute -left-16 bottom-[5%] h-[280px] w-[280px] text-brand-600"
            viewBox="0 0 280 280"
            fill="none"
          >
            <circle cx="140" cy="140" r="135" stroke="currentColor" strokeWidth="1" strokeOpacity="0.05" strokeDasharray="6 4" />
            <circle cx="140" cy="140" r="88"  stroke="currentColor" strokeWidth="1" strokeOpacity="0.05" />
            <circle cx="140" cy="140" r="42"  stroke="currentColor" strokeWidth="1" strokeOpacity="0.06" fill="currentColor" fillOpacity="0.02" />
          </svg>

          {/* Floating accent squares */}
          <div className="absolute left-[5%] top-[18%] h-14 w-14 rotate-[32deg] rounded-2xl border border-brand-400/20 bg-brand-50/40" />
          <div className="absolute left-[22%] top-[8%]  h-6  w-6  rotate-[18deg] rounded-lg  border border-brand-300/20 bg-brand-50/30" />
          <div className="absolute right-[5%] bottom-[18%] h-10 w-10 rotate-[-24deg] rounded-xl border border-violet-400/15 bg-violet-50/20" />
          <div className="absolute right-[20%] top-[5%] h-4 w-4 rotate-[10deg] rounded-md border border-brand-300/25" />

          {/* Floating dots */}
          <div className="absolute left-[12%] top-[42%] h-3 w-3 rounded-full bg-brand-500/25" />
          <div className="absolute left-[38%] top-[6%]  h-2 w-2 rounded-full bg-brand-400/35" />
          <div className="absolute right-[14%] top-[28%] h-2.5 w-2.5 rounded-full bg-violet-400/30" />

          {/* Bottom fade to white */}
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white to-transparent" />
        </div>

        {/* Content */}
        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-sm font-medium text-brand-700">
              <span className="h-2 w-2 rounded-full bg-brand-500" />
              CRM feito para personal trainers brasileiros
            </div>

            <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Pare de perder alunos{" "}
              <span className="bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">
                no caos do WhatsApp.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Pipeline, propostas digitais, contratos e follow-ups em um só lugar.
              Feche mais alunos com menos esforço — e nunca mais esqueça um lead.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link href="/login">
                <button className="rounded-full bg-brand-600 px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:bg-brand-500">
                  Começar grátis agora →
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="rounded-full border border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
                  Ver demonstração
                </button>
              </Link>
            </div>

            <p className="mt-4 text-xs text-slate-400">Sem cartão de crédito. Comece em 60 segundos.</p>
          </div>

          {/* Mock dashboard */}
          <div className="mt-16 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-brand-900/10 ring-1 ring-slate-100">
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-6 py-3">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-4 text-xs text-slate-400">fitcloser.app/dashboard</span>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-4">
              {[
                { label: "Leads totais",    value: "48",      color: "text-brand-600",   bg: "from-brand-50 to-brand-50/30" },
                { label: "Clientes ativos", value: "19",      color: "text-emerald-600", bg: "from-emerald-50 to-emerald-50/30" },
                { label: "Follow-ups hoje", value: "5",       color: "text-amber-600",   bg: "from-amber-50 to-amber-50/30" },
                { label: "Receita / mês",   value: "R$ 9.800",color: "text-slate-900",   bg: "from-slate-50 to-slate-50/30" },
              ].map((s) => (
                <div key={s.label} className={`rounded-2xl border border-slate-100 bg-gradient-to-br ${s.bg} p-4`}>
                  <p className="text-xs text-slate-500">{s.label}</p>
                  <p className={`mt-2 text-2xl font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="grid gap-3 px-6 pb-6 sm:grid-cols-3">
              {[
                { name: "João Silva",    stage: "Proposta enviada",  badge: "Quente",  color: "bg-amber-100 text-amber-700" },
                { name: "Mariana Luz",   stage: "Negociação",         badge: "Ativo",   color: "bg-brand-100 text-brand-700" },
                { name: "Rafael Torres", stage: "Fechado ganho ✓",   badge: "Ganho",   color: "bg-emerald-100 text-emerald-700" },
              ].map((l) => (
                <div key={l.name} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{l.name}</p>
                    <p className="text-xs text-slate-500">{l.stage}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${l.color}`}>
                    {l.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ───────────────────────────────────────────────────────── */}
      <section className="relative border-y border-slate-100 bg-white px-6 py-14 sm:px-10">
        {/* Thin brand accent line at top */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-400/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-brand-400/20 to-transparent" />
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-10 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="bg-gradient-to-br from-brand-600 to-brand-400 bg-clip-text text-3xl font-extrabold text-transparent">
                {s.value}
              </p>
              <p className="mt-1.5 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PAIN POINTS ─────────────────────────────────────────────────── */}
      <section className="relative px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Você já passou por isso?</p>
              <h2 className="mt-3 text-4xl font-extrabold leading-tight text-slate-950">
                Todo treinador perde dinheiro sem perceber.
              </h2>
              <p className="mt-4 leading-7 text-slate-600">
                Não é falta de talento. É falta de processo. Um lead esquecido aqui, uma proposta que nunca saiu ali — e no fim do mês a agenda não tá cheia.
              </p>
              <ul className="mt-8 space-y-4">
                {pains.map((pain) => (
                  <li key={pain} className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100">
                      <svg className="h-3 w-3 text-rose-500" viewBox="0 0 12 12" fill="currentColor">
                        <path d="M10 2L2 10M2 2l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none"/>
                      </svg>
                    </span>
                    <span className="text-slate-700">{pain}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solution card with inner decoration */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 to-brand-500 p-8 text-white shadow-xl shadow-brand-500/25">
              {/* Inner decorative circles */}
              <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
              <div aria-hidden className="pointer-events-none absolute -right-8  -top-8  h-36 w-36 rounded-full bg-white/8" />
              <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-black/10" />
              {/* Dot grid overlay */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />
              {/* Content */}
              <div className="relative">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">Com o FitCloser</p>
                <h3 className="mt-3 text-2xl font-bold leading-snug">
                  Cada lead tem um próximo passo. Cada proposta tem um status. Cada cliente tem um contrato.
                </h3>
                <p className="mt-4 text-sm leading-7 text-white/80">
                  Chega de perder tempo e dinheiro com desorganização. Você é personal trainer — não secretário. Deixa o FitCloser cuidar do processo de vendas.
                </p>
                <div className="mt-8 space-y-3">
                  {["Pipeline organizado", "Propostas aceitas digitalmente", "Contratos assinados", "Follow-ups no prazo"].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20">
                        <svg className="h-3 w-3" viewBox="0 0 12 10" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="1 5 4 8 11 1" />
                        </svg>
                      </span>
                      <span className="text-sm text-white/90">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-50 px-6 py-24 sm:px-10">
        {/* Subtle dot grid on the section */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: "radial-gradient(circle, #0f172a 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        {/* Corner accents */}
        <div aria-hidden className="pointer-events-none absolute -left-24 top-1/2 h-64 w-64 rounded-full bg-brand-400/5 blur-2xl" />
        <div aria-hidden className="pointer-events-none absolute -right-24 top-1/4 h-64 w-64 rounded-full bg-violet-400/5 blur-2xl" />

        <div className="relative mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Tudo que você precisa</p>
            <h2 className="mt-3 text-4xl font-extrabold text-slate-950">
              Uma plataforma. Zero planilha.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-600">
              Desenvolvido especificamente para personal trainers que querem crescer com profissionalismo — sem complicar.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-md hover:shadow-brand-500/8"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100">
                  {f.icon}
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-950">{f.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
      <section className="px-6 py-24 sm:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Como funciona</p>
            <h2 className="mt-3 text-4xl font-extrabold text-slate-950">Simples de começar. Impossível de parar.</h2>
          </div>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                {i < steps.length - 1 && (
                  <div
                    aria-hidden
                    className="absolute right-0 top-6 hidden h-px w-1/2 border-t-2 border-dashed border-brand-200 sm:block"
                    style={{ left: "calc(50% + 2rem)" }}
                  />
                )}
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-sm font-extrabold text-white shadow-lg shadow-brand-500/30">
                  {step.number}
                  {/* Glow ring on step number */}
                  <div className="absolute inset-0 rounded-2xl ring-4 ring-brand-500/15" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-7 text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-50 px-6 py-24 sm:px-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: "radial-gradient(circle, #0f172a 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/30 to-transparent" />
        <div className="relative mx-auto max-w-6xl">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-brand-600">Resultados reais</p>
            <h2 className="mt-3 text-4xl font-extrabold text-slate-950">O que treinadores falam.</h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="flex flex-col rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
                <svg className="h-6 w-6 text-brand-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.192 15.757c0-.88-.23-1.618-.69-2.217-.326-.412-.768-.683-1.327-.812-.55-.128-1.07-.137-1.54-.028-.16-.95.077-1.928.605-2.95.527-1.023 1.306-1.956 2.336-2.8l-1.696-1.75C7.028 6.192 6 7.42 5.236 8.83c-.764 1.41-1.146 2.83-1.146 4.26 0 1.757.515 3.14 1.546 4.148 1.03 1.01 2.274 1.515 3.73 1.515 1.346 0 2.44-.44 3.284-1.32.842-.88 1.263-1.99 1.263-3.33l-.72.654zm9.608 0c0-.88-.23-1.618-.69-2.217-.326-.42-.77-.692-1.327-.82-.55-.128-1.07-.136-1.54-.028-.16-.95.077-1.928.605-2.95.527-1.022 1.306-1.956 2.336-2.8l-1.696-1.75c-1.85 1.192-2.878 2.42-3.642 3.83-.764 1.41-1.146 2.83-1.146 4.26 0 1.758.515 3.14 1.546 4.15 1.03 1.01 2.274 1.514 3.73 1.514 1.346 0 2.44-.44 3.284-1.32.842-.88 1.263-1.99 1.263-3.33l-.723.66z" />
                </svg>
                <p className="mt-4 flex-1 text-sm leading-7 text-slate-700">{t.quote}</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${t.color}`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ───────────────────────────────────────────────────── */}
      <section className="px-6 py-24 sm:px-10">
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 to-brand-500 p-12 text-center shadow-2xl shadow-brand-500/30">

          {/* Inner decorations */}
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10" />
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/8" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-black/10" />
          <div aria-hidden className="pointer-events-none absolute bottom-8 left-8 h-20 w-20 rounded-full bg-white/5" />

          {/* Dot grid overlay */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Decorative ring at top-right */}
          <svg
            aria-hidden
            className="pointer-events-none absolute right-0 top-0 h-48 w-48 text-white/10"
            viewBox="0 0 200 200"
            fill="none"
          >
            <circle cx="200" cy="0" r="100" stroke="currentColor" strokeWidth="1" strokeDasharray="6 4" />
            <circle cx="200" cy="0" r="65"  stroke="currentColor" strokeWidth="1" />
          </svg>

          {/* Content */}
          <div className="relative">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-white/70">Pronto para crescer?</p>
            <h2 className="mt-3 text-4xl font-extrabold text-white">
              Seu próximo aluno está esperando uma resposta sua.
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-white/80">
              Junte-se a mais de 1.200 treinadores que pararam de perder leads e começaram a fechar mais — com muito menos esforço.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link href="/login">
                <button className="rounded-full bg-white px-8 py-3.5 text-base font-bold text-brand-600 shadow-lg transition hover:bg-brand-50">
                  Criar conta grátis
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="rounded-full border border-white/30 px-8 py-3.5 text-base font-semibold text-white transition hover:bg-white/10">
                  Ver o painel →
                </button>
              </Link>
            </div>
            <p className="mt-5 text-xs text-white/50">Sem cartão de crédito · Cancele quando quiser</p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100 px-6 py-10 sm:px-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <span className="text-sm font-bold text-slate-950">FitCloser</span>
          <p className="text-xs text-slate-400">© 2025 FitCloser. CRM para treinadores pessoais.</p>
          <div className="flex gap-6 text-xs text-slate-500">
            <Link href="/login" className="hover:text-slate-700">Entrar</Link>
            <Link href="/login" className="hover:text-slate-700">Cadastro</Link>
          </div>
        </div>
      </footer>

    </main>
  );
}
