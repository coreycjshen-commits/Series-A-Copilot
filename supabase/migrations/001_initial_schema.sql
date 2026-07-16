create table memos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  company_name text,
  status text default 'processing',
  memo_content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table memo_files (
  id uuid primary key default gen_random_uuid(),
  memo_id uuid references memos(id) on delete cascade not null,
  file_name text not null,
  storage_path text not null,
  file_type text,
  extracted_text text,
  created_at timestamptz default now()
);

alter table memos enable row level security;
alter table memo_files enable row level security;

create policy "Users can view their own memos"
  on memos for select
  using (user_id = auth.uid());

create policy "Users can insert their own memos"
  on memos for insert
  with check (user_id = auth.uid());

create policy "Users can update their own memos"
  on memos for update
  using (user_id = auth.uid());

create policy "Users can delete their own memos"
  on memos for delete
  using (user_id = auth.uid());

create policy "Users can view files for their memos"
  on memo_files for select
  using (memo_id in (select id from memos where user_id = auth.uid()));

create policy "Users can insert files for their memos"
  on memo_files for insert
  with check (memo_id in (select id from memos where user_id = auth.uid()));

create policy "Users can delete files for their memos"
  on memo_files for delete
  using (memo_id in (select id from memos where user_id = auth.uid()));

insert into storage.buckets (id, name, public)
values ('memo-files', 'memo-files', false)
on conflict (id) do nothing;

create policy "Users can upload memo files"
  on storage.objects for insert
  with check (bucket_id = 'memo-files' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can view their memo files"
  on storage.objects for select
  using (bucket_id = 'memo-files' and (storage.foldername(name))[1] = auth.uid()::text);
