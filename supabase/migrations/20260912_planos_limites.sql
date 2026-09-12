alter table public.profiles add column if not exists plano text not null default 'free';
alter table public.profiles add column if not exists status_assinatura text not null default 'active';
alter table public.profiles add column if not exists plano_expira_em timestamptz;
alter table public.profiles add column if not exists provedor_pagamento text;
alter table public.profiles add column if not exists cliente_pagamento_id text;
alter table public.profiles add column if not exists assinatura_pagamento_id text;

alter table public.profiles drop constraint if exists profiles_plano_check;
alter table public.profiles add constraint profiles_plano_check check (plano in ('free', 'pro'));

create or replace function public.validar_limites_quiz()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    plano_atual text;
    quizzes_criados integer;
    possui_tipo_avancado boolean;
begin
    select coalesce(p.plano, 'free') into plano_atual
    from public.profiles p
    where p.id = auth.uid();

    plano_atual := coalesce(plano_atual, 'free');
    if plano_atual = 'pro' then
        return new;
    end if;

    select count(*) into quizzes_criados
    from public.quizzes q
    where q.criador = auth.uid() and q.ativo = true;

    if quizzes_criados >= 5 then
        raise exception 'Limite do plano gratuito atingido: você pode criar até 5 quizzes. Faça upgrade para o Pro.' using errcode = 'P0001';
    end if;

    select exists (
        select 1
        from jsonb_array_elements(coalesce(new.perguntas, '[]'::jsonb)) pergunta
        where coalesce(pergunta->>'tipo', 'multipla_escolha') not in ('multipla_escolha', 'verdadeiro_falso')
    ) into possui_tipo_avancado;

    if possui_tipo_avancado then
        raise exception 'O plano gratuito aceita apenas questões de múltipla escolha e verdadeiro/falso.' using errcode = 'P0001';
    end if;

    return new;
end;
$$;

drop trigger if exists validar_limites_quiz_antes_inserir on public.quizzes;
create trigger validar_limites_quiz_antes_inserir
    before insert on public.quizzes
    for each row execute function public.validar_limites_quiz();

grant execute on function public.validar_limites_quiz() to authenticated;
