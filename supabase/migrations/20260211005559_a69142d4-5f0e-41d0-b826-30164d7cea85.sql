do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role' and typnamespace = 'public'::regnamespace) then
    create type public.app_role as enum ('admin','editor');
  end if;
end$$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

drop policy if exists "Users can view their own roles" on public.user_roles;
drop policy if exists "Admins can insert roles" on public.user_roles;
drop policy if exists "Admins can update roles" on public.user_roles;
drop policy if exists "Admins can delete roles" on public.user_roles;

create policy "Users can view their own roles"
on public.user_roles
for select
to authenticated
using (auth.uid() = user_id);

create policy "Admins can insert roles"
on public.user_roles
for insert
to authenticated
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can update roles"
on public.user_roles
for update
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create policy "Admins can delete roles"
on public.user_roles
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- SERVICES
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.services enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'services_set_updated_at'
  ) then
    create trigger services_set_updated_at before update on public.services for each row execute function public.set_updated_at();
  end if;
end$$;

drop policy if exists "Public can read active services" on public.services;
drop policy if exists "Admins can manage services" on public.services;

create policy "Public can read active services"
on public.services
for select
to anon, authenticated
using (is_active = true);

create policy "Admins can manage services"
on public.services
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- TESTIMONIALS
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  role_label text not null default 'Cliente',
  quote text not null,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.testimonials enable row level security;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'testimonials_set_updated_at') then
    create trigger testimonials_set_updated_at before update on public.testimonials for each row execute function public.set_updated_at();
  end if;
end$$;

drop policy if exists "Public can read active testimonials" on public.testimonials;
drop policy if exists "Admins can manage testimonials" on public.testimonials;

create policy "Public can read active testimonials"
on public.testimonials
for select
to anon, authenticated
using (is_active = true);

create policy "Admins can manage testimonials"
on public.testimonials
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- SITE CONTENT
create table if not exists public.site_content (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

create or replace function public.site_content_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'site_content_set_updated_at') then
    create trigger site_content_set_updated_at before update on public.site_content for each row execute function public.site_content_set_updated_at();
  end if;
end$$;

drop policy if exists "Public can read site content" on public.site_content;
drop policy if exists "Admins can manage site content" on public.site_content;

create policy "Public can read site content"
on public.site_content
for select
to anon, authenticated
using (true);

create policy "Admins can manage site content"
on public.site_content
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- POSTS
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  body text not null,
  published_at timestamptz,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts enable row level security;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'posts_set_updated_at') then
    create trigger posts_set_updated_at before update on public.posts for each row execute function public.set_updated_at();
  end if;
end$$;

drop policy if exists "Public can read published posts" on public.posts;
drop policy if exists "Admins can read all posts" on public.posts;
drop policy if exists "Admins can manage posts" on public.posts;

create policy "Public can read published posts"
on public.posts
for select
to anon, authenticated
using (is_published = true);

create policy "Admins can read all posts"
on public.posts
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage posts"
on public.posts
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

-- EVENTS
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  body text,
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.events enable row level security;

do $$
begin
  if not exists (select 1 from pg_trigger where tgname = 'events_set_updated_at') then
    create trigger events_set_updated_at before update on public.events for each row execute function public.set_updated_at();
  end if;
end$$;

drop policy if exists "Public can read published events" on public.events;
drop policy if exists "Admins can read all events" on public.events;
drop policy if exists "Admins can manage events" on public.events;

create policy "Public can read published events"
on public.events
for select
to anon, authenticated
using (is_published = true);

create policy "Admins can read all events"
on public.events
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create policy "Admins can manage events"
on public.events
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create index if not exists services_sort_order_idx on public.services (sort_order);
create index if not exists testimonials_sort_order_idx on public.testimonials (sort_order);
create index if not exists posts_published_idx on public.posts (is_published, published_at);
create index if not exists events_published_idx on public.events (is_published, starts_at);
