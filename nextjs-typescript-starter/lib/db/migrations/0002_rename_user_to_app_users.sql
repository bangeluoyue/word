-- Give the H5 learner account table an explicit, lowercase name and keep the
-- administrator identity tables (admin_users/admin_sessions) independent.

do $$
begin
  if to_regclass('public.app_users') is not null
     and to_regclass('public."User"') is not null then
    raise exception 'Cannot rename "User": public.app_users already exists';
  elsif to_regclass('public."User"') is not null then
    alter table public."User" rename to app_users;
  elsif to_regclass('public.app_users') is null then
    raise exception 'Cannot rename "User": neither source nor target table exists';
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'User_pkey'
      and conrelid = 'public.app_users'::regclass
  ) then
    alter table public.app_users
      rename constraint "User_pkey" to app_users_pkey;
  end if;
end
$$;

do $$
begin
  if to_regclass('public."User_id_seq"') is not null
     and to_regclass('public.app_users_id_seq') is null then
    alter sequence public."User_id_seq" rename to app_users_id_seq;
  end if;
end
$$;

do $$
begin
  if to_regclass('public.user_email_lower_unique') is not null
     and to_regclass('public.app_users_email_lower_unique') is null then
    alter index public.user_email_lower_unique
      rename to app_users_email_lower_unique;
  end if;
end
$$;

do $$
begin
  if exists (
    select 1
    from pg_constraint
    where conname = 'learning_progress_user_fk'
      and conrelid = 'public.learning_progress'::regclass
  ) then
    alter table public.learning_progress
      rename constraint learning_progress_user_fk
      to learning_progress_app_user_fk;
  end if;
end
$$;

comment on table public.app_users is 'H5 word-learning application users';
