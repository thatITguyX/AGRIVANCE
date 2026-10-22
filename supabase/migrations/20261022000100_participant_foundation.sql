create table public.user_access (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in (
    'system_admin',
    'country_manager',
    'field_officer',
    'merl_officer',
    'data_quality_officer',
    'auditor',
    'read_only'
  )),
  country_codes text[] not null default '{}',
  created_at timestamptz not null default now(),
  constraint user_access_country_codes_valid
    check (country_codes <@ array['NG', 'GH', 'KE']::text[])
);

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  participant_code text not null unique
    default ('AGR-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))),
  country_code text not null check (country_code in ('NG', 'GH', 'KE')),
  first_name text not null check (length(trim(first_name)) between 1 and 100),
  last_name text not null check (length(trim(last_name)) between 1 and 100),
  location text not null check (length(trim(location)) between 1 and 200),
  phone text check (
    phone is null
    or (country_code = 'NG' and phone ~ '^\+234[1-9][0-9]{7,10}$')
    or (country_code = 'GH' and phone ~ '^\+233[1-9][0-9]{7,10}$')
    or (country_code = 'KE' and phone ~ '^\+254[1-9][0-9]{7,10}$')
  ),
  enterprise text check (enterprise is null or length(trim(enterprise)) <= 200),
  status text not null default 'applicant'
    check (status in ('applicant', 'enrolled', 'active', 'follow_up', 'completed', 'withdrawn')),
  consent_recorded_at timestamptz not null,
  created_by uuid not null default auth.uid() references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.duplicate_review_requests (
  id uuid primary key default gen_random_uuid(),
  country_code text not null check (country_code in ('NG', 'GH', 'KE')),
  candidate_ids uuid[] not null check (cardinality(candidate_ids) > 0),
  created_by uuid not null default auth.uid() references auth.users (id),
  status text not null default 'pending' check (status in ('pending', 'resolved', 'dismissed')),
  created_at timestamptz not null default now()
);

create index participants_country_status_created_idx
  on public.participants (country_code, status, created_at desc)
  where archived_at is null;
create index participants_country_name_idx
  on public.participants (country_code, lower(last_name), lower(first_name))
  where archived_at is null;

create table public.audit_events (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users (id),
  action text not null check (action in ('participant.created', 'participant.updated', 'participant.status_changed')),
  entity_id uuid not null,
  country_code text not null check (country_code in ('NG', 'GH', 'KE')),
  changed_fields text[] not null default '{}',
  occurred_at timestamptz not null default now()
);

create table public.participant_stage_history (
  id bigint generated always as identity primary key,
  participant_id uuid not null references public.participants (id),
  previous_status text,
  next_status text not null,
  actor_id uuid references auth.users (id),
  changed_at timestamptz not null default now(),
  check (previous_status is null or previous_status in ('applicant', 'enrolled', 'active', 'follow_up', 'completed', 'withdrawn')),
  check (next_status in ('applicant', 'enrolled', 'active', 'follow_up', 'completed', 'withdrawn'))
);

create index audit_events_country_time_idx
  on public.audit_events (country_code, occurred_at desc);
create index participant_stage_history_participant_time_idx
  on public.participant_stage_history (participant_id, changed_at desc);
create index duplicate_review_requests_country_status_created_idx
  on public.duplicate_review_requests (country_code, status, created_at desc);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create function public.has_country_access(target_country text, write_access boolean default false)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_access as ua
    where ua.user_id = (select auth.uid())
      and (ua.role = 'system_admin' or target_country = any(ua.country_codes))
      and (
        not write_access
        or ua.role in ('system_admin', 'country_manager', 'field_officer')
      )
  );
$$;

revoke all on function public.has_country_access(text, boolean) from public, anon;
grant execute on function public.has_country_access(text, boolean) to authenticated;

alter table public.user_access enable row level security;
alter table public.participants enable row level security;
alter table public.audit_events enable row level security;
alter table public.participant_stage_history enable row level security;
alter table public.duplicate_review_requests enable row level security;

create policy "Users can read their own access scope"
  on public.user_access for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Authorized users can read scoped participants"
  on public.participants for select to authenticated
  using (public.has_country_access(country_code));

create policy "Authorized users can register scoped participants"
  on public.participants for insert to authenticated
  with check (
    public.has_country_access(country_code, true)
    and created_by = (select auth.uid())
  );

create policy "Authorized users can update scoped participants"
  on public.participants for update to authenticated
  using (public.has_country_access(country_code, true))
  with check (public.has_country_access(country_code, true));

create policy "Authorized users can read scoped audit events"
  on public.audit_events for select to authenticated
  using (
    public.has_country_access(country_code)
    and exists (
      select 1 from public.user_access as ua
      where ua.user_id = (select auth.uid())
        and ua.role in ('system_admin', 'country_manager', 'data_quality_officer', 'auditor')
    )
  );

create policy "Authorized users can read scoped stage history"
  on public.participant_stage_history for select to authenticated
  using (
    exists (
      select 1 from public.participants as participant
      where participant.id = participant_id
        and public.has_country_access(participant.country_code)
    )
  );

create policy "Users can read their own duplicate requests or review assigned scope"
  on public.duplicate_review_requests for select to authenticated
  using (
    created_by = (select auth.uid())
    or (
      public.has_country_access(country_code)
      and exists (
        select 1 from public.user_access as ua
        where ua.user_id = (select auth.uid())
          and ua.role in ('system_admin', 'country_manager', 'data_quality_officer')
      )
    )
  );

revoke all on public.user_access from anon, authenticated;
grant select on public.user_access to authenticated;
revoke all on public.participants from anon, authenticated;
grant select (
  id, participant_code, country_code, first_name, last_name, location,
  enterprise, status, consent_recorded_at, created_by, created_at, updated_at, archived_at
) on public.participants to authenticated;
grant insert (
  country_code, first_name, last_name, location, phone, enterprise, consent_recorded_at
) on public.participants to authenticated;
grant update (
  country_code, first_name, last_name, location, phone, enterprise, status, archived_at
) on public.participants to authenticated;
revoke all on public.audit_events from anon, authenticated;
grant select on public.audit_events to authenticated;
revoke all on public.participant_stage_history from anon, authenticated;
grant select on public.participant_stage_history to authenticated;
revoke all on public.duplicate_review_requests from anon, authenticated;
grant select on public.duplicate_review_requests to authenticated;

create function public.record_participant_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  fields text[];
begin
  if tg_op = 'INSERT' then
    fields := array['participant_code', 'country_code', 'first_name', 'last_name', 'location', 'status'];
    insert into public.audit_events (actor_id, action, entity_id, country_code, changed_fields)
    values ((select auth.uid()), 'participant.created', new.id, new.country_code, fields);
    return new;
  end if;

  select coalesce(array_agg(key order by key), '{}')
    into fields
  from jsonb_each(to_jsonb(new)) as new_field(key, value)
  where key not in ('phone', 'consent_recorded_at', 'created_by', 'created_at', 'updated_at')
    and (to_jsonb(old) -> key) is distinct from value;

  if cardinality(fields) > 0 then
    insert into public.audit_events (actor_id, action, entity_id, country_code, changed_fields)
    values (
      (select auth.uid()),
      case when new.status is distinct from old.status then 'participant.status_changed' else 'participant.updated' end,
      new.id,
      new.country_code,
      fields
    );
  end if;

  return new;
end;
$$;

create trigger participants_updated_at
  before update on public.participants
  for each row execute function public.set_updated_at();

create trigger participants_audit
  after insert or update on public.participants
  for each row execute function public.record_participant_audit();

create function public.record_participant_stage()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and new.status is distinct from old.status then
    if not (
      (old.status = 'applicant' and new.status in ('enrolled', 'withdrawn'))
      or (old.status = 'enrolled' and new.status in ('active', 'withdrawn'))
      or (old.status = 'active' and new.status in ('follow_up', 'completed', 'withdrawn'))
      or (old.status = 'follow_up' and new.status in ('active', 'completed', 'withdrawn'))
    ) then
      raise exception 'Invalid participant status transition';
    end if;
  end if;

  insert into public.participant_stage_history (
    participant_id, previous_status, next_status, actor_id
  )
  values (
    new.id,
    case when tg_op = 'INSERT' then null else old.status end,
    new.status,
    (select auth.uid())
  );
  return new;
end;
$$;

create trigger participants_stage_history
  after insert or update of status on public.participants
  for each row execute function public.record_participant_stage();

create function public.register_participant(
  target_country text,
  target_first_name text,
  target_last_name text,
  target_location text,
  target_phone text,
  target_enterprise text,
  consent_confirmed boolean
)
returns table (
  result text,
  participant_id uuid,
  participant_code text,
  country_code text,
  first_name text,
  last_name text,
  location text,
  enterprise text,
  status text,
  updated_at timestamptz,
  duplicate_review_id uuid,
  potential_matches text[]
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  candidate_ids uuid[];
  candidate_codes text[];
  review_id uuid;
  created_participant public.participants%rowtype;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if not public.has_country_access(target_country, true) then
    raise exception 'Participant registration is not permitted for this country' using errcode = '42501';
  end if;
  if consent_confirmed is distinct from true then
    raise exception 'Participant consent must be confirmed' using errcode = '23514';
  end if;
  if target_country not in ('NG', 'GH', 'KE')
    or length(trim(target_first_name)) not between 1 and 100
    or length(trim(target_last_name)) not between 1 and 100
    or length(trim(target_location)) not between 1 and 200
    or (target_enterprise is not null and length(trim(target_enterprise)) > 200)
  then
    raise exception 'Participant details are invalid' using errcode = '23514';
  end if;
  if target_phone is not null and not (
    (target_country = 'NG' and target_phone ~ '^\+234[1-9][0-9]{7,10}$')
    or (target_country = 'GH' and target_phone ~ '^\+233[1-9][0-9]{7,10}$')
    or (target_country = 'KE' and target_phone ~ '^\+254[1-9][0-9]{7,10}$')
  ) then
    raise exception 'Phone number does not match the selected country' using errcode = '23514';
  end if;

  perform pg_advisory_xact_lock(
    hashtext(target_country),
    hashtext(lower(trim(target_first_name)) || '|' || lower(trim(target_last_name)) || '|' || lower(trim(target_location)))
  );

  select coalesce(array_agg(candidate.id), '{}'), coalesce(array_agg(candidate.participant_code), '{}')
    into candidate_ids, candidate_codes
  from (
    select p.id, p.participant_code
    from public.participants as p
    where p.country_code = target_country
      and p.archived_at is null
      and lower(trim(p.first_name)) = lower(trim(target_first_name))
      and lower(trim(p.last_name)) = lower(trim(target_last_name))
      and lower(trim(p.location)) = lower(trim(target_location))
    order by p.created_at desc
    limit 5
  ) as candidate;

  if cardinality(candidate_ids) > 0 then
    insert into public.duplicate_review_requests (country_code, candidate_ids, created_by)
    values (target_country, candidate_ids, (select auth.uid()))
    returning id into review_id;
    return query select
      'review_required'::text, null::uuid, null::text, target_country,
      null::text, null::text, null::text, null::text, null::text, null::timestamptz,
      review_id, candidate_codes;
    return;
  end if;

  insert into public.participants (
    country_code, first_name, last_name, location, phone, enterprise,
    consent_recorded_at, created_by
  )
  values (
    target_country, trim(target_first_name), trim(target_last_name), trim(target_location),
    target_phone, nullif(trim(target_enterprise), ''), now(), (select auth.uid())
  )
  returning * into created_participant;

  return query select
    'created'::text, created_participant.id, created_participant.participant_code,
    created_participant.country_code, created_participant.first_name, created_participant.last_name,
    created_participant.location, created_participant.enterprise, created_participant.status,
    created_participant.updated_at, null::uuid, array[]::text[];
end;
$$;

revoke all on function public.register_participant(text, text, text, text, text, text, boolean) from public, anon;
grant execute on function public.register_participant(text, text, text, text, text, text, boolean) to authenticated;
