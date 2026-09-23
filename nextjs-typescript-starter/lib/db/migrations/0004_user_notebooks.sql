-- Private notebooks belong only to H5 app users. Public books and words stay
-- independent; deleting a notebook removes memberships, never dictionary data.

create table public.user_notebooks (
  id uuid primary key default gen_random_uuid(),
  user_id integer not null,
  name varchar(50) not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),

  constraint user_notebooks_app_user_fk
    foreign key (user_id)
    references public.app_users(id)
    on delete cascade,

  constraint user_notebooks_name_check
    check (char_length(btrim(name)) between 1 and 50)
);

create index user_notebooks_user_id_idx
  on public.user_notebooks(user_id);

create unique index user_notebooks_user_name_unique
  on public.user_notebooks(user_id, lower(btrim(name)));

create table public.user_notebook_words (
  notebook_id uuid not null,
  word_id bigint not null,
  created_at timestamp with time zone not null default now(),

  constraint user_notebook_words_pkey
    primary key (notebook_id, word_id),

  constraint user_notebook_words_notebook_fk
    foreign key (notebook_id)
    references public.user_notebooks(id)
    on delete cascade,

  constraint user_notebook_words_word_fk
    foreign key (word_id)
    references public.words(id)
    on delete restrict
);

create index user_notebook_words_word_id_idx
  on public.user_notebook_words(word_id);
