alter table public.profiles add column if not exists nome text;
alter table public.profiles add column if not exists avatar text not null default 'aurora';
alter table public.profiles add column if not exists xp integer not null default 0;
alter table public.profiles add column if not exists acertos integer not null default 0;
alter table public.profiles add column if not exists erros integer not null default 0;
alter table public.profiles add column if not exists avatares_comprados text[] not null default array['aurora', 'oceano', 'bosque', 'sol'];

alter table public.profiles enable row level security;
drop policy if exists "usuarios podem atualizar o proprio perfil" on public.profiles;
create policy "usuarios podem atualizar o proprio perfil"
    on public.profiles for update
    using (auth.uid() = id)
    with check (auth.uid() = id);

create or replace function public.ranking_geral()
returns table (posicao bigint, nome text, xp integer)
language sql
security definer
set search_path = public
as $$
    select row_number() over (order by coalesce(p.xp, 0) desc, coalesce(p.nome, p.email)) as posicao,
           coalesce(p.nome, split_part(p.email, '@', 1)) as nome,
           coalesce(p.xp, 0)::integer as xp
    from public.profiles p
    order by coalesce(p.xp, 0) desc, nome
    limit 20;
$$;

grant execute on function public.ranking_geral() to authenticated;

create or replace function public.ranking_por_quiz(quiz_uuid uuid)
returns table (posicao bigint, nome text, xp integer)
language sql
security definer
set search_path = public
as $$
    select row_number() over (order by r.nota desc, r.tempo_total_ms asc) as posicao,
           coalesce(p.nome, split_part(p.email, '@', 1)) as nome,
           round(r.nota * 100)::integer as xp
    from public.resultados r
    join public.profiles p on p.id = r.aluno_id
    where r.quiz_id = quiz_uuid
    order by r.nota desc, r.tempo_total_ms asc
    limit 20;
$$;

grant execute on function public.ranking_por_quiz(uuid) to authenticated;
