begin;

create table if not exists public.website_inquiries (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  phone text,
  company text,
  project_type text not null,
  cadence text not null,
  project_date date,
  location text,
  budget_range text not null,
  description text not null,
  status text not null default 'New',
  source text not null default 'Website inquiry',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint website_inquiries_status_check
    check (status in ('New', 'Reviewed', 'Replied', 'Archived'))
);

alter table public.website_inquiries enable row level security;
revoke all on table public.website_inquiries from anon;
grant select, update, delete on table public.website_inquiries to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'website_inquiries'
      and policyname = 'Owners can read website inquiries'
  ) then
    create policy "Owners can read website inquiries"
      on public.website_inquiries
      for select
      to authenticated
      using ((select auth.uid()) = owner_user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'website_inquiries'
      and policyname = 'Owners can update website inquiries'
  ) then
    create policy "Owners can update website inquiries"
      on public.website_inquiries
      for update
      to authenticated
      using ((select auth.uid()) = owner_user_id)
      with check ((select auth.uid()) = owner_user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'website_inquiries'
      and policyname = 'Owners can delete website inquiries'
  ) then
    create policy "Owners can delete website inquiries"
      on public.website_inquiries
      for delete
      to authenticated
      using ((select auth.uid()) = owner_user_id);
  end if;
end
$$;

create or replace function public.ingest_website_inquiry(
  p_submission_id uuid,
  p_owner_user_id uuid,
  p_name text,
  p_email text,
  p_phone text,
  p_company text,
  p_project_type text,
  p_cadence text,
  p_project_date date,
  p_location text,
  p_budget_range text,
  p_description text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inquiry_id uuid;
  v_lead_id uuid := gen_random_uuid();
  v_activity_id uuid := gen_random_uuid();
  v_received_at timestamptz := now();
  v_segment text;
  v_notes text;
begin
  insert into public.website_inquiries (
    submission_id,
    owner_user_id,
    name,
    email,
    phone,
    company,
    project_type,
    cadence,
    project_date,
    location,
    budget_range,
    description
  )
  values (
    p_submission_id,
    p_owner_user_id,
    p_name,
    lower(p_email),
    nullif(p_phone, ''),
    nullif(p_company, ''),
    p_project_type,
    p_cadence,
    p_project_date,
    nullif(p_location, ''),
    p_budget_range,
    p_description
  )
  on conflict (submission_id) do nothing
  returning id into v_inquiry_id;

  if v_inquiry_id is null then
    select id into v_inquiry_id
    from public.website_inquiries
    where submission_id = p_submission_id;
    return v_inquiry_id;
  end if;

  v_segment := case
    when p_project_type ilike 'Automotive%' then 'Automotive'
    when p_project_type ilike 'Events%' then 'Events'
    when p_project_type ilike 'Commercial%' then 'Commercial'
    when p_project_type ilike 'Ongoing%' then 'Partnership'
    else 'Other'
  end;

  v_notes := concat_ws(
    E'\n',
    'Website inquiry',
    'Email: ' || p_email,
    case when nullif(p_phone, '') is not null then 'Phone: ' || p_phone end,
    'Project: ' || p_project_type,
    'Cadence: ' || p_cadence,
    case when p_project_date is not null then 'Preferred date: ' || p_project_date::text end,
    case when nullif(p_budget_range, '') is not null then 'Budget: ' || p_budget_range end,
    '',
    p_description
  );

  update public.user_workspaces
  set
    data = jsonb_set(
      data,
      '{leads}',
      coalesce(data -> 'leads', '[]'::jsonb) || jsonb_build_array(
        jsonb_build_object(
          'id', v_lead_id::text,
          'person', p_name,
          'business', coalesce(nullif(p_company, ''), p_name),
          'channel', 'Website',
          'url', '',
          'segment', v_segment,
          'location', coalesce(nullif(p_location, ''), ''),
          'notes', v_notes,
          'source', 'Website inquiry',
          'value', 0,
          'lastContact', current_date::text,
          'nextFollowUp', current_date::text,
          'status', 'New',
          'activity', jsonb_build_array(
            jsonb_build_object(
              'id', v_activity_id::text,
              'at', to_char(v_received_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
              'text', 'Website inquiry received'
            )
          )
        )
      ),
      true
    ),
    updated_at = v_received_at
  where user_id = p_owner_user_id;

  if not found then
    raise exception 'Owner workspace not found';
  end if;

  return v_inquiry_id;
end;
$$;

revoke all on function public.ingest_website_inquiry(
  uuid, uuid, text, text, text, text, text, text, date, text, text, text
) from public, anon, authenticated;
grant execute on function public.ingest_website_inquiry(
  uuid, uuid, text, text, text, text, text, text, date, text, text, text
) to service_role;

commit;
