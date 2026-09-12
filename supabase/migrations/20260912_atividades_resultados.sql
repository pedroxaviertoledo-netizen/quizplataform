create table if not exists public.atividades (
    id uuid primary key default gen_random_uuid(),
    quiz_id uuid not null references public.quizzes(id) on delete cascade,
    destinatario_id uuid not null references auth.users(id) on delete cascade,
    remetente_id uuid not null references auth.users(id) on delete cascade,
    titulo text not null,
    remetente text not null,
    remetente_email text,
    status text not null default 'pendente' check (status in ('pendente', 'concluida')),
    enviada_em timestamptz not null default now(),
    concluida_em timestamptz,
    resultado jsonb
);

create unique index if not exists atividades_pendente_unica
    on public.atividades (quiz_id, destinatario_id)
    where status = 'pendente';

create table if not exists public.resultados (
    id uuid primary key default gen_random_uuid(),
    quiz_id uuid not null references public.quizzes(id) on delete cascade,
    aluno_id uuid not null references auth.users(id) on delete cascade,
    atividade_id uuid references public.atividades(id) on delete set null,
    acertos integer not null default 0,
    erros integer not null default 0,
    nota numeric(5,2) not null default 0,
    tempo_total_ms integer not null default 0,
    respostas jsonb not null default '[]'::jsonb,
    concluida_em timestamptz not null default now()
);

alter table public.atividades enable row level security;
alter table public.resultados enable row level security;

drop policy if exists "atividades participantes podem consultar" on public.atividades;
drop policy if exists "usuarios podem compartilhar quizzes" on public.atividades;
drop policy if exists "destinatarios podem concluir atividades" on public.atividades;
drop policy if exists "participantes podem consultar resultados" on public.resultados;
drop policy if exists "alunos podem registrar resultados" on public.resultados;

create policy "atividades participantes podem consultar"
    on public.atividades for select
    using (auth.uid() = destinatario_id or auth.uid() = remetente_id);
create policy "usuarios podem compartilhar quizzes"
    on public.atividades for insert
    with check (auth.uid() = remetente_id);
create policy "destinatarios podem concluir atividades"
    on public.atividades for update
    using (auth.uid() = destinatario_id)
    with check (auth.uid() = destinatario_id);

create policy "participantes podem consultar resultados"
    on public.resultados for select
    using (
        auth.uid() = aluno_id
        or exists (select 1 from public.quizzes q where q.id = quiz_id and q.criador = auth.uid())
    );
create policy "alunos podem registrar resultados"
    on public.resultados for insert
    with check (auth.uid() = aluno_id);