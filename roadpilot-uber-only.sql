-- RoadPilot: bloquear nuevos registros independientes.
-- La única vía de alta nueva debe ser el flujo de Uber, que crea el usuario
-- con raw_user_meta_data.auth_provider = 'uber'.

create or replace function public.roadpilot_only_uber_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(new.raw_user_meta_data->>'auth_provider', '') <> 'uber' then
    raise exception 'RoadPilot solo permite iniciar sesión mediante Uber';
  end if;
  return new;
end;
$$;

drop trigger if exists roadpilot_only_uber_signup_trigger on auth.users;
create trigger roadpilot_only_uber_signup_trigger
before insert on auth.users
for each row
execute function public.roadpilot_only_uber_signup();
