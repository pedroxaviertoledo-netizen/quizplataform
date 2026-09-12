create or replace function public.sincronizar_perfil_usuario()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.profiles (id, email, nome)
    values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)))
    on conflict (id) do update set email = excluded.email;
    return new;
end;
$$;

drop trigger if exists ao_criar_usuario_sincronizar_perfil on auth.users;
create trigger ao_criar_usuario_sincronizar_perfil
    after insert on auth.users
    for each row execute function public.sincronizar_perfil_usuario();

insert into public.profiles (id, email, nome)
select id, email, coalesce(raw_user_meta_data ->> 'full_name', split_part(email, '@', 1))
from auth.users
on conflict (id) do update set email = excluded.email;

alter table public.profiles enable row level security;
drop policy if exists "usuarios autenticados podem localizar perfis" on public.profiles;
create policy "usuarios autenticados podem localizar perfis"
    on public.profiles for select
    using (auth.uid() is not null);