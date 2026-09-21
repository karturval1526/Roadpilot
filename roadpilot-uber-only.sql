-- RoadPilot: acceso exclusivamente mediante Uber.
-- Se permite una sesión anónima SOLO como identidad técnica temporal para completar
-- el OAuth de Uber. No se permite crear una cuenta independiente con correo/contraseña.

create or replace function public.roadpilot_only_uber_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Supabase Anonymous Sign-In necesita crear usuarios anónimos.
  -- Esos usuarios no son cuentas independientes visibles para el conductor.
  if coalesce(new.is_anonymous, false) = true then
    return new;
  end if;

  if coalesce(new.raw_user_meta_data->>'auth_provider', '') <> 'uber' then
    raise exception 'RoadPilot solo permite acceso mediante Uber';
  end if;
  return new;
end;
$$;

drop trigger if exists roadpilot_only_uber_signup_trigger on auth.users;
create trigger roadpilot_only_uber_signup_trigger
before insert on auth.users
for each row
execute function public.roadpilot_only_uber_signup();
