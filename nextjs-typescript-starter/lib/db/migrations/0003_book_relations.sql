-- Complete the shared book/word relationship migration owned by the admin app.
-- The H5 app owns learning_progress, so its restrictive book foreign key lives
-- here and is applied after word-admin/drizzle/0003_mixed_lucky_pierre.sql.

alter table public.learning_progress
  drop constraint if exists learning_progress_book_fk;

alter table public.learning_progress
  add constraint learning_progress_book_fk
  foreign key (book_id)
  references public.books (book_id)
  on update cascade
  on delete restrict;
