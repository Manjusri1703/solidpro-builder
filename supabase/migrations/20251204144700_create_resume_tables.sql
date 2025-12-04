-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create enum for user roles
create type user_role as enum ('admin', 'user');

-- Users table
create table if not exists public.users (
  id uuid references auth.users on delete cascade not null primary key,
  email text unique not null,
  role user_role not null default 'user',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for users table
alter table public.users enable row level security;

-- Resumes table
create table if not exists public.resumes (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  personal_info jsonb not null,
  summary text,
  skills text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Work experiences table
create table if not exists public.work_experiences (
  id uuid default uuid_generate_v4() primary key,
  resume_id uuid references public.resumes(id) on delete cascade not null,
  company_name text not null,
  job_title text not null,
  start_year text not null,
  end_year text not null,
  responsibilities text[] not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Projects table
create table if not exists public.projects (
  id uuid default uuid_generate_v4() primary key,
  resume_id uuid references public.resumes(id) on delete cascade not null,
  name text not null,
  description text not null,
  technologies text[] not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Education table
create table if not exists public.education (
  id uuid default uuid_generate_v4() primary key,
  resume_id uuid references public.resumes(id) on delete cascade not null,
  degree text not null,
  institution text not null,
  graduation_year text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies for resumes table
alter table public.resumes enable row level security;

create policy "Users can view their own resumes"
  on public.resumes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own resumes"
  on public.resumes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own resumes"
  on public.resumes for update
  using (auth.uid() = user_id);

create policy "Users can delete their own resumes"
  on public.resumes for delete
  using (auth.uid() = user_id);

-- RLS Policies for work_experiences table
alter table public.work_experiences enable row level security;

create policy "Users can view their own work experiences"
  on public.work_experiences for select
  using (exists (
    select 1 from public.resumes
    where resumes.id = work_experiences.resume_id
    and resumes.user_id = auth.uid()
  ));

-- Similar policies for insert, update, delete on work_experiences
create policy "Users can manage their own work experiences"
  on public.work_experiences
  for all
  using (exists (
    select 1 from public.resumes
    where resumes.id = work_experiences.resume_id
    and resumes.user_id = auth.uid()
  ));

-- RLS Policies for projects table
alter table public.projects enable row level security;

create policy "Users can view their own projects"
  on public.projects for select
  using (exists (
    select 1 from public.resumes
    where resumes.id = projects.resume_id
    and resumes.user_id = auth.uid()
  ));

create policy "Users can manage their own projects"
  on public.projects
  for all
  using (exists (
    select 1 from public.resumes
    where resumes.id = projects.resume_id
    and resumes.user_id = auth.uid()
  ));

-- RLS Policies for education table
alter table public.education enable row level security;

create policy "Users can view their own education"
  on public.education for select
  using (exists (
    select 1 from public.resumes
    where resumes.id = education.resume_id
    and resumes.user_id = auth.uid()
  ));

create policy "Users can manage their own education"
  on public.education
  for all
  using (exists (
    select 1 from public.resumes
    where resumes.id = education.resume_id
    and resumes.user_id = auth.uid()
  ));

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'user');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to get current user's role
create or replace function public.get_user_role()
returns user_role as $$
  select role from public.users where id = auth.uid();
$$ language sql security definer;

-- Function to check if current user is admin
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.users 
    where id = auth.uid() and role = 'admin'::user_role
  );
$$ language sql security definer;
