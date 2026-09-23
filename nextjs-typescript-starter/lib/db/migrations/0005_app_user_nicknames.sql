-- Nicknames are optional for existing H5 users. The partial expression index
-- keeps non-null nicknames unique without changing registration requirements.

alter table public.app_users
  add column nick_name varchar(24) null;

create unique index app_users_nick_name_lower_unique
  on public.app_users(lower(btrim(nick_name)))
  where nick_name is not null;
