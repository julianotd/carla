insert into storage.buckets (id, name, public) 
values ('uploads', 'uploads', true) 
on conflict (id) do nothing;

create policy "Public Access" 
on storage.objects for select 
to public 
using ( bucket_id = 'uploads' );

create policy "Auth Insert" 
on storage.objects for insert 
to authenticated 
with check ( bucket_id = 'uploads' );

create policy "Auth Update" 
on storage.objects for update 
to authenticated 
using ( bucket_id = 'uploads' );

create policy "Auth Delete"
on storage.objects for delete
to authenticated
using ( bucket_id = 'uploads' );
