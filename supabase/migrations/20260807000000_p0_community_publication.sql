-- P0 Community Publication foundation. This migration is additive: it creates
-- the initial Nightfold-owned schema without modifying existing application data.

create table public.games (
  id text primary key,
  display_name text not null,
  created_at timestamptz not null default statement_timestamp(),
  constraint games_id_route_safe check (
    id = lower(id)
    and id ~ '^[a-z0-9]+(?:[.-][a-z0-9]+)*$'
  ),
  constraint games_display_name_present check (length(btrim(display_name)) between 1 and 80)
);

create table public.game_expansions (
  game_id text not null references public.games(id) on update restrict on delete restrict,
  id text not null,
  constraint game_expansions_pk primary key (game_id, id)
);

create table public.game_seasons (
  game_id text not null references public.games(id) on update restrict on delete restrict,
  id text not null,
  constraint game_seasons_pk primary key (game_id, id)
);

create table public.game_patches (
  game_id text not null references public.games(id) on update restrict on delete restrict,
  id text not null,
  constraint game_patches_pk primary key (game_id, id)
);

create table public.game_context_records (
  id uuid primary key default gen_random_uuid(),
  game_id text not null references public.games(id) on update restrict on delete restrict,
  expansion_id text,
  season_id text,
  patch_id text,
  effective_from timestamptz not null,
  recorded_at timestamptz not null default statement_timestamp(),
  constraint game_context_records_expansion_same_game_fk
    foreign key (game_id, expansion_id)
    references public.game_expansions(game_id, id)
    match simple on update restrict on delete restrict,
  constraint game_context_records_season_same_game_fk
    foreign key (game_id, season_id)
    references public.game_seasons(game_id, id)
    match simple on update restrict on delete restrict,
  constraint game_context_records_patch_same_game_fk
    foreign key (game_id, patch_id)
    references public.game_patches(game_id, id)
    match simple on update restrict on delete restrict
);

create index game_context_records_as_of_idx
  on public.game_context_records (
    game_id,
    effective_from desc,
    recorded_at desc,
    id desc
  );

-- Only stable identity and ownership keys live here. Executable Publication
-- Profile configuration remains in the TypeScript profile registry.
create table public.publication_profile_keys (
  id text primary key,
  game_id text not null references public.games(id) on update restrict on delete restrict,
  created_at timestamptz not null default statement_timestamp(),
  constraint publication_profile_keys_id_route_safe check (
    id = lower(id)
    and id ~ '^[a-z0-9]+(?:[.-][a-z0-9]+)*$'
  ),
  constraint publication_profile_keys_p0_registry check (
    (game_id, id) in (
      ('soulframe', 'soulframe.build'),
      ('soulframe', 'soulframe.guide')
    )
  ),
  constraint publication_profile_keys_game_id_id_unique unique (game_id, id)
);

insert into public.games (id, display_name)
values ('soulframe', 'Soulframe');

insert into public.publication_profile_keys (id, game_id)
values
  ('soulframe.build', 'soulframe'),
  ('soulframe.guide', 'soulframe');

create table public.accounts (
  id uuid primary key references auth.users(id) on update restrict on delete restrict,
  email text,
  display_name text,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint accounts_display_name_length check (
    display_name is null or length(btrim(display_name)) between 1 and 120
  )
);

create table public.creator_profiles (
  account_id uuid primary key references public.accounts(id) on update restrict on delete restrict,
  handle text not null,
  display_name text not null,
  bio text,
  publisher_eligible boolean not null default true,
  publisher_disabled_reason text,
  activated_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint creator_profiles_handle_route_safe check (
    handle = lower(handle)
    and length(handle) between 3 and 30
    and handle ~ '^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$'
  ),
  constraint creator_profiles_display_name_present check (
    length(btrim(display_name)) between 1 and 120
  ),
  constraint creator_profiles_bio_length check (bio is null or length(bio) <= 1000),
  constraint creator_profiles_eligibility_coherent check (
    (publisher_eligible and publisher_disabled_reason is null)
    or (
      not publisher_eligible
      and publisher_disabled_reason is not null
      and length(btrim(publisher_disabled_reason)) between 1 and 240
    )
  )
);

create unique index creator_profiles_handle_unique_idx
  on public.creator_profiles (lower(handle));

create table public.build_planner_artifacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.accounts(id) on update restrict on delete cascade,
  game_id text not null references public.games(id) on update restrict on delete restrict,
  name text not null,
  schema_version integer not null,
  payload jsonb not null,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint build_planner_artifacts_name_present check (
    length(btrim(name)) between 1 and 120
  ),
  constraint build_planner_artifacts_schema_version_positive check (schema_version > 0),
  constraint build_planner_artifacts_payload_object check (jsonb_typeof(payload) = 'object')
);

create index build_planner_artifacts_owner_game_updated_idx
  on public.build_planner_artifacts (owner_id, game_id, updated_at desc, id);

create table public.publications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.creator_profiles(account_id) on update restrict on delete restrict,
  game_id text not null,
  profile_id text not null,
  slug text not null,
  status text not null default 'draft',
  current_release_id uuid,
  first_published_at timestamptz,
  latest_published_at timestamptz,
  deleted_at timestamptz,
  recoverable_until timestamptz,
  is_valid boolean not null default false,
  vote_count bigint not null default 0,
  created_at timestamptz not null default statement_timestamp(),
  updated_at timestamptz not null default statement_timestamp(),
  constraint publications_game_profile_fk
    foreign key (game_id, profile_id)
    references public.publication_profile_keys(game_id, id)
    on update restrict on delete restrict,
  constraint publications_slug_route_safe check (
    slug = lower(slug)
    and length(slug) between 3 and 100
    and slug ~ '^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$'
  ),
  constraint publications_route_unique unique (game_id, profile_id, slug),
  constraint publications_status_known check (
    status in ('draft', 'published', 'unpublished', 'deleted')
  ),
  constraint publications_vote_count_nonnegative check (vote_count >= 0),
  constraint publications_publication_dates_ordered check (
    first_published_at is null
    or (latest_published_at is not null and first_published_at <= latest_published_at)
  ),
  constraint publications_lifecycle_coherent check (
    (
      status = 'draft'
      and current_release_id is null
      and first_published_at is null
      and latest_published_at is null
      and deleted_at is null
      and recoverable_until is null
      and not is_valid
    )
    or (
      status = 'published'
      and current_release_id is not null
      and first_published_at is not null
      and latest_published_at is not null
      and deleted_at is null
      and recoverable_until is null
      and is_valid
    )
    or (
      status = 'unpublished'
      and current_release_id is null
      and first_published_at is not null
      and latest_published_at is not null
      and deleted_at is null
      and recoverable_until is null
    )
    or (
      status = 'deleted'
      and current_release_id is null
      and deleted_at is not null
      and recoverable_until is not null
      and recoverable_until > deleted_at
      and (
        (first_published_at is null and latest_published_at is null)
        or (first_published_at is not null and latest_published_at is not null)
      )
    )
  )
);

create index publications_owner_updated_idx
  on public.publications (owner_id, updated_at desc, id);

create index publications_public_route_current_idx
  on public.publications (game_id, profile_id, slug, current_release_id)
  where status = 'published' and is_valid and deleted_at is null;

create index publications_trending_eligibility_idx
  on public.publications (game_id, profile_id, latest_published_at desc, id)
  where status = 'published' and is_valid and deleted_at is null;

create index publications_top_idx
  on public.publications (game_id, profile_id, vote_count desc, latest_published_at desc, id)
  where status = 'published' and is_valid and deleted_at is null;

create index publications_new_idx
  on public.publications (game_id, profile_id, first_published_at desc, id)
  where status = 'published' and is_valid and deleted_at is null;

create table public.publication_drafts (
  publication_id uuid primary key references public.publications(id) on update restrict on delete cascade,
  state jsonb not null,
  updated_at timestamptz not null default statement_timestamp(),
  constraint publication_drafts_state_shape check (
    jsonb_typeof(state) = 'object'
    and jsonb_typeof(state -> 'schemaVersion') = 'number'
    and jsonb_typeof(state -> 'metadata') = 'object'
    and jsonb_typeof(state -> 'blocks') = 'array'
  )
);

create table public.publication_draft_checkpoints (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid not null references public.publications(id) on update restrict on delete cascade,
  checkpoint_number bigint not null,
  state jsonb not null,
  created_at timestamptz not null default statement_timestamp(),
  constraint publication_draft_checkpoints_number_positive check (checkpoint_number > 0),
  constraint publication_draft_checkpoints_order_unique unique (publication_id, checkpoint_number),
  constraint publication_draft_checkpoints_state_shape check (
    jsonb_typeof(state) = 'object'
    and jsonb_typeof(state -> 'schemaVersion') = 'number'
    and jsonb_typeof(state -> 'metadata') = 'object'
    and jsonb_typeof(state -> 'blocks') = 'array'
  )
);

create index publication_draft_checkpoints_recent_idx
  on public.publication_draft_checkpoints (publication_id, checkpoint_number desc);

create table public.publication_releases (
  id uuid not null default gen_random_uuid(),
  publication_id uuid not null references public.publications(id) on update restrict on delete cascade,
  release_number bigint not null,
  state jsonb not null,
  is_valid boolean not null,
  published_at timestamptz not null default statement_timestamp(),
  constraint publication_releases_pk primary key (id),
  constraint publication_releases_publication_id_id_unique unique (publication_id, id),
  constraint publication_releases_number_positive check (release_number > 0),
  constraint publication_releases_order_unique unique (publication_id, release_number),
  constraint publication_releases_state_shape check (
    jsonb_typeof(state) = 'object'
    and jsonb_typeof(state -> 'schemaVersion') = 'number'
    and jsonb_typeof(state -> 'metadata') = 'object'
    and jsonb_typeof(state -> 'blocks') = 'array'
  )
);

create index publication_releases_recent_idx
  on public.publication_releases (publication_id, release_number desc);

alter table public.publications
  add constraint publications_current_release_same_publication_fk
  foreign key (id, current_release_id)
  references public.publication_releases(publication_id, id)
  on update restrict on delete restrict
  deferrable initially immediate;

create table public.publication_votes (
  publication_id uuid not null references public.publications(id) on update restrict on delete cascade,
  voter_id uuid not null references public.accounts(id) on update restrict on delete cascade,
  created_at timestamptz not null default statement_timestamp(),
  constraint publication_votes_pk primary key (publication_id, voter_id)
);

create index publication_votes_recent_idx
  on public.publication_votes (publication_id, created_at desc, voter_id);

create index publication_votes_voter_idx
  on public.publication_votes (voter_id, created_at desc, publication_id);

alter table public.games enable row level security;
alter table public.game_expansions enable row level security;
alter table public.game_seasons enable row level security;
alter table public.game_patches enable row level security;
alter table public.game_context_records enable row level security;
alter table public.publication_profile_keys enable row level security;
alter table public.accounts enable row level security;
alter table public.creator_profiles enable row level security;
alter table public.build_planner_artifacts enable row level security;
alter table public.publications enable row level security;
alter table public.publication_drafts enable row level security;
alter table public.publication_draft_checkpoints enable row level security;
alter table public.publication_releases enable row level security;
alter table public.publication_votes enable row level security;

create schema nightfold_private;
revoke all on schema nightfold_private from public, anon, authenticated, service_role;

create function nightfold_private.reject_game_context_record_mutation()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  raise exception 'game context records are append-only';
end;
$$;

create trigger game_context_records_reject_mutation
before update or delete on public.game_context_records
for each row execute function nightfold_private.reject_game_context_record_mutation();

create function nightfold_private.append_game_context_record(
  p_game_id text,
  p_effective_from timestamptz,
  p_expansion_id text default null,
  p_season_id text default null,
  p_patch_id text default null
)
returns public.game_context_records
language sql
volatile
security definer
set search_path = pg_catalog
as $$
  insert into public.game_context_records (
    game_id,
    expansion_id,
    season_id,
    patch_id,
    effective_from
  )
  values (
    p_game_id,
    p_expansion_id,
    p_season_id,
    p_patch_id,
    p_effective_from
  )
  returning *;
$$;

create function nightfold_private.game_context_record_as_of(
  p_game_id text,
  p_at timestamptz
)
returns setof public.game_context_records
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select records.*
  from public.game_context_records as records
  where records.game_id = p_game_id
    and records.effective_from <= p_at
  order by
    records.effective_from desc,
    records.recorded_at desc,
    records.id desc
  limit 1;
$$;

create function nightfold_private.current_game_context_record(p_game_id text)
returns setof public.game_context_records
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select *
  from nightfold_private.game_context_record_as_of(
    p_game_id,
    statement_timestamp()
  );
$$;

create table nightfold_private.publication_operational_policy (
  singleton boolean primary key default true,
  max_draft_checkpoints integer not null default 20,
  max_retained_releases integer not null default 20,
  deleted_recovery_days integer not null default 30,
  trending_window interval not null default interval '7 days',
  trending_decay_hours numeric not null default 72,
  max_discovery_offset integer not null default 10000,
  constraint publication_operational_policy_singleton check (singleton),
  constraint publication_operational_policy_checkpoints_positive check (max_draft_checkpoints > 0),
  constraint publication_operational_policy_releases_positive check (max_retained_releases > 0),
  constraint publication_operational_policy_recovery_positive check (deleted_recovery_days > 0),
  constraint publication_operational_policy_trending_window_positive check (trending_window > interval '0 seconds'),
  constraint publication_operational_policy_trending_decay_positive check (trending_decay_hours > 0),
  constraint publication_operational_policy_discovery_offset_nonnegative check (max_discovery_offset >= 0)
);

insert into nightfold_private.publication_operational_policy (
  singleton,
  max_draft_checkpoints,
  max_retained_releases,
  deleted_recovery_days,
  trending_window,
  trending_decay_hours,
  max_discovery_offset
)
values (true, 20, 20, 30, interval '7 days', 72, 10000);

revoke all on table nightfold_private.publication_operational_policy
  from public, anon, authenticated;

create function nightfold_private.publication_state_has_shape(p_state jsonb)
returns boolean
language sql
immutable
strict
set search_path = pg_catalog
as $$
  select
    jsonb_typeof(p_state) = 'object'
    and p_state @> '{"schemaVersion": 1}'::jsonb
    and jsonb_typeof(p_state -> 'metadata') = 'object'
    and jsonb_typeof(p_state -> 'blocks') = 'array';
$$;

create function nightfold_private.jsonb_object_has_only_keys(
  p_value jsonb,
  p_allowed_keys text[]
)
returns boolean
language sql
immutable
set search_path = pg_catalog
as $$
  select
    coalesce(jsonb_typeof(p_value) = 'object', false)
    and not exists (
      select 1
      from jsonb_object_keys(
        case when jsonb_typeof(p_value) = 'object' then p_value else '{}'::jsonb end
      ) as property(key)
      where not (property.key = any (p_allowed_keys))
    );
$$;

create function nightfold_private.jsonb_contains_forbidden_editor_key(p_value jsonb)
returns boolean
language plpgsql
immutable
strict
set search_path = pg_catalog, nightfold_private
as $$
declare
  v_key text;
  v_nested jsonb;
begin
  if jsonb_typeof(p_value) = 'object' then
    for v_key, v_nested in select key, value from jsonb_each(p_value)
    loop
      if lower(v_key) = any (array[
        'class',
        'classname',
        'css',
        'dangerouslysetinnerhtml',
        'html',
        'javascript',
        'onclick',
        'script',
        'style'
      ]) or lower(v_key) like 'on%' then
        return true;
      end if;
      if nightfold_private.jsonb_contains_forbidden_editor_key(v_nested) then
        return true;
      end if;
    end loop;
  elsif jsonb_typeof(p_value) = 'array' then
    for v_nested in select value from jsonb_array_elements(p_value)
    loop
      if nightfold_private.jsonb_contains_forbidden_editor_key(v_nested) then
        return true;
      end if;
    end loop;
  end if;

  return false;
end;
$$;

create function nightfold_private.rich_text_styles_are_valid(p_styles jsonb)
returns boolean
language sql
immutable
strict
set search_path = pg_catalog, nightfold_private
as $$
  select
    jsonb_typeof(p_styles) = 'object'
    and nightfold_private.jsonb_object_has_only_keys(
      p_styles,
      array[
        'bold',
        'italic',
        'underline',
        'strike',
        'code',
        'textColor',
        'backgroundColor'
      ]
    )
    and not exists (
      select 1
      from jsonb_each(
        case when jsonb_typeof(p_styles) = 'object' then p_styles else '{}'::jsonb end
      ) as style(key, value)
      where (
          style.key in ('bold', 'italic', 'underline', 'strike', 'code')
          and jsonb_typeof(style.value) <> 'boolean'
        )
        or (
          style.key in ('textColor', 'backgroundColor')
          and jsonb_typeof(style.value) <> 'string'
        )
    );
$$;

create function nightfold_private.rich_text_inline_content_is_valid(p_content jsonb)
returns boolean
language plpgsql
immutable
strict
set search_path = pg_catalog, nightfold_private
as $$
declare
  v_inline jsonb;
begin
  if jsonb_typeof(p_content) <> 'array' then
    return false;
  end if;

  for v_inline in select value from jsonb_array_elements(p_content)
  loop
    if jsonb_typeof(v_inline) <> 'object' then
      return false;
    end if;

    if v_inline ->> 'type' = 'text' then
      if not nightfold_private.jsonb_object_has_only_keys(
          v_inline, array['type', 'text', 'styles']
        )
        or jsonb_typeof(v_inline -> 'text') <> 'string'
        or jsonb_typeof(v_inline -> 'styles') <> 'object'
        or not coalesce(
          nightfold_private.rich_text_styles_are_valid(v_inline -> 'styles'),
          false
        ) then
        return false;
      end if;
    elsif v_inline ->> 'type' = 'link' then
      if not nightfold_private.jsonb_object_has_only_keys(
          v_inline, array['type', 'href', 'content']
        )
        or jsonb_typeof(v_inline -> 'href') <> 'string'
        or jsonb_typeof(v_inline -> 'content') <> 'array' then
        return false;
      end if;
      if exists (
          select 1
          from jsonb_array_elements(v_inline -> 'content') as linked(value)
          where linked.value ->> 'type' is distinct from 'text'
        )
        or not nightfold_private.rich_text_inline_content_is_valid(
          v_inline -> 'content'
        ) then
        return false;
      end if;
    else
      return false;
    end if;
  end loop;

  return true;
end;
$$;

create function nightfold_private.rich_text_block_props_are_valid(
  p_type text,
  p_props jsonb
)
returns boolean
language plpgsql
immutable
strict
set search_path = pg_catalog, nightfold_private
as $$
declare
  v_allowed_keys text[] := array['textColor', 'backgroundColor', 'textAlignment'];
begin
  if p_type = 'checkListItem' then
    v_allowed_keys := v_allowed_keys || array['checked'];
  elsif p_type = 'numberedListItem' then
    v_allowed_keys := v_allowed_keys || array['start'];
  elsif p_type = 'codeBlock' then
    v_allowed_keys := v_allowed_keys || array['language'];
  end if;

  return coalesce(
    jsonb_typeof(p_props) = 'object'
    and nightfold_private.jsonb_object_has_only_keys(p_props, v_allowed_keys)
    and (
      not (p_props ? 'textColor')
      or jsonb_typeof(p_props -> 'textColor') = 'string'
    )
    and (
      not (p_props ? 'backgroundColor')
      or jsonb_typeof(p_props -> 'backgroundColor') = 'string'
    )
    and (
      not (p_props ? 'textAlignment')
      or p_props ->> 'textAlignment' in ('left', 'center', 'right', 'justify')
    )
    and (
      not (p_props ? 'checked')
      or jsonb_typeof(p_props -> 'checked') = 'boolean'
    )
    and (
      not (p_props ? 'language')
      or jsonb_typeof(p_props -> 'language') = 'string'
    )
    and (
      not (p_props ? 'start')
      or case
        when jsonb_typeof(p_props -> 'start') in ('number', 'string')
          and p_props ->> 'start' ~ '^[0-9]+$'
        then (p_props ->> 'start')::numeric >= 1
        else false
      end
    ),
    false
  );
end;
$$;

create function nightfold_private.rich_text_block_is_valid(p_block jsonb)
returns boolean
language plpgsql
immutable
strict
set search_path = pg_catalog, nightfold_private
as $$
declare
  v_type text;
  v_child jsonb;
begin
  if jsonb_typeof(p_block) <> 'object'
    or not nightfold_private.jsonb_object_has_only_keys(
      p_block, array['id', 'type', 'props', 'content', 'children']
    )
    or jsonb_typeof(p_block -> 'type') <> 'string' then
    return false;
  end if;

  v_type := p_block ->> 'type';
  if v_type not in (
    'paragraph',
    'bulletListItem',
    'numberedListItem',
    'checkListItem',
    'codeBlock',
    'quote'
  ) then
    return false;
  end if;

  if (p_block ? 'id') and (
      jsonb_typeof(p_block -> 'id') <> 'string'
      or length(btrim(p_block ->> 'id')) = 0
    ) then
    return false;
  end if;

  if (p_block ? 'props') and not coalesce(
      nightfold_private.rich_text_block_props_are_valid(v_type, p_block -> 'props'),
      false
    ) then
    return false;
  end if;

  if (p_block ? 'content')
    and jsonb_typeof(p_block -> 'content') not in ('string', 'array') then
    return false;
  end if;
  if (p_block ? 'content')
    and jsonb_typeof(p_block -> 'content') = 'array'
    and not nightfold_private.rich_text_inline_content_is_valid(
      p_block -> 'content'
    ) then
    return false;
  end if;

  if p_block ? 'children' then
    if jsonb_typeof(p_block -> 'children') <> 'array' then
      return false;
    end if;
    for v_child in select value from jsonb_array_elements(p_block -> 'children')
    loop
      if not coalesce(
        nightfold_private.rich_text_block_is_valid(v_child),
        false
      ) then
        return false;
      end if;
    end loop;
  end if;

  return true;
end;
$$;

create function nightfold_private.rich_text_document_is_valid(p_document jsonb)
returns boolean
language sql
immutable
strict
set search_path = pg_catalog, nightfold_private
as $$
  select
    jsonb_typeof(p_document) = 'array'
    and not nightfold_private.jsonb_contains_forbidden_editor_key(p_document)
    and not exists (
      select 1
      from jsonb_array_elements(
        case
          when jsonb_typeof(p_document) = 'array' then p_document
          else '[]'::jsonb
        end
      ) as editor_block(value)
      where not coalesce(
        nightfold_private.rich_text_block_is_valid(editor_block.value),
        false
      )
    );
$$;

create function nightfold_private.supporting_block_is_valid(p_block jsonb)
returns boolean
language plpgsql
immutable
strict
set search_path = pg_catalog, nightfold_private
as $$
declare
  v_type text;
begin
  if jsonb_typeof(p_block) <> 'object'
    or not p_block @> '{"schemaVersion": 1}'::jsonb
    or jsonb_typeof(p_block -> 'id') <> 'string'
    or coalesce(length(btrim(p_block ->> 'id')), 0) = 0
    or nightfold_private.jsonb_contains_forbidden_editor_key(p_block) then
    return false;
  end if;

  if not nightfold_private.jsonb_object_has_only_keys(
    p_block,
    array['id', 'type', 'schemaVersion', 'data']
  ) then
    return false;
  end if;

  v_type := p_block ->> 'type';
  if v_type = 'nightfold.heading' then
    return coalesce(
      jsonb_typeof(p_block -> 'data') = 'object'
      and nightfold_private.jsonb_object_has_only_keys(
        p_block -> 'data', array['text', 'level']
      )
      and jsonb_typeof(p_block #> '{data,text}') = 'string'
      and length(btrim(p_block #>> '{data,text}')) > 0
      and jsonb_typeof(p_block #> '{data,level}') = 'number'
      and p_block #>> '{data,level}' in ('2', '3', '4'),
      false
    );
  end if;

  if v_type = 'nightfold.rich-text' then
    return coalesce(
      jsonb_typeof(p_block -> 'data') = 'object'
      and nightfold_private.jsonb_object_has_only_keys(
        p_block -> 'data', array['document']
      )
      and nightfold_private.rich_text_document_is_valid(p_block #> '{data,document}'),
      false
    );
  end if;

  return false;
end;
$$;

create function nightfold_private.jsonb_integer_between(
  p_value jsonb,
  p_minimum integer,
  p_maximum integer
)
returns boolean
language sql
immutable
strict
set search_path = pg_catalog
as $$
  select case
    when jsonb_typeof(p_value) = 'number'
      and p_value #>> '{}' ~ '^-?[0-9]+$'
    then (p_value #>> '{}')::numeric between p_minimum and p_maximum
    else false
  end;
$$;

create function nightfold_private.art_allocation_is_valid(p_value jsonb)
returns boolean
language sql
immutable
strict
set search_path = pg_catalog, nightfold_private
as $$
  select
    jsonb_typeof(p_value) = 'object'
    and not exists (
      select 1
      from jsonb_each(
        case when jsonb_typeof(p_value) = 'object' then p_value else '{}'::jsonb end
      ) as allocation(node_id, rank)
      where length(btrim(allocation.node_id)) not between 1 and 160
        or not nightfold_private.jsonb_integer_between(allocation.rank, 1, 3)
    );
$$;

create function nightfold_private.ranked_enhancement_is_valid(p_value jsonb)
returns boolean
language sql
immutable
strict
set search_path = pg_catalog, nightfold_private
as $$
  select
    jsonb_typeof(p_value) = 'object'
    and not exists (
      select 1
      from jsonb_object_keys(
        case when jsonb_typeof(p_value) = 'object' then p_value else '{}'::jsonb end
      ) as property(key)
      where property.key not in ('itemId', 'rank')
    )
    and jsonb_typeof(p_value -> 'itemId') = 'string'
    and length(p_value ->> 'itemId') between 1 and 120
    and nightfold_private.jsonb_integer_between(p_value -> 'rank', 0, 3);
$$;

create function nightfold_private.totem_selection_is_valid(p_value jsonb)
returns boolean
language sql
immutable
strict
set search_path = pg_catalog, nightfold_private
as $$
  select
    jsonb_typeof(p_value) = 'object'
    and not exists (
      select 1
      from jsonb_object_keys(
        case when jsonb_typeof(p_value) = 'object' then p_value else '{}'::jsonb end
      ) as property(key)
      where property.key not in ('itemId', 'rank', 'virtue', 'variant')
    )
    and jsonb_typeof(p_value -> 'itemId') = 'string'
    and length(p_value ->> 'itemId') between 1 and 120
    and nightfold_private.jsonb_integer_between(p_value -> 'rank', 0, 3)
    and p_value ->> 'virtue' in ('courage', 'spirit', 'grace')
    and p_value ->> 'variant' in ('universal', 'combatArt');
$$;

create function nightfold_private.weapon_enhancements_are_valid(p_value jsonb)
returns boolean
language sql
immutable
strict
set search_path = pg_catalog, nightfold_private
as $$
  select
    jsonb_typeof(p_value) = 'object'
    and not exists (
      select 1
      from jsonb_object_keys(
        case when jsonb_typeof(p_value) = 'object' then p_value else '{}'::jsonb end
      ) as property(key)
      where property.key not in ('rune', 'totems')
    )
    and (
      p_value -> 'rune' = 'null'::jsonb
      or nightfold_private.ranked_enhancement_is_valid(p_value -> 'rune')
    )
    and jsonb_typeof(p_value -> 'totems') = 'array'
    and jsonb_array_length(
      case
        when jsonb_typeof(p_value -> 'totems') = 'array'
          then p_value -> 'totems'
        else '[]'::jsonb
      end
    ) = 4
    and not exists (
      select 1
      from jsonb_array_elements(
        case
          when jsonb_typeof(p_value -> 'totems') = 'array'
            then p_value -> 'totems'
          else '[]'::jsonb
        end
      ) as totem(value)
      where totem.value <> 'null'::jsonb
        and not coalesce(
          nightfold_private.totem_selection_is_valid(totem.value),
          false
        )
    );
$$;

create function nightfold_private.soulframe_planner_is_valid(p_planner jsonb)
returns boolean
language sql
immutable
strict
set search_path = pg_catalog, nightfold_private
as $$
  select
    jsonb_typeof(p_planner) = 'object'
    and not exists (
      select 1
      from jsonb_object_keys(
        case
          when jsonb_typeof(p_planner) = 'object' then p_planner
          else '{}'::jsonb
        end
      ) as property(key)
      where property.key not in (
        'schemaVersion',
        'name',
        'virtues',
        'affinitySources',
        'equipment',
        'pact',
        'combatArts',
        'weaponEnhancements'
      )
    )
    and p_planner @> '{"schemaVersion": 5}'::jsonb
    and jsonb_typeof(p_planner -> 'name') = 'string'
    and length(p_planner ->> 'name') <= 80
    and jsonb_typeof(p_planner -> 'virtues') = 'object'
    and nightfold_private.jsonb_object_has_only_keys(
      p_planner -> 'virtues', array['courage', 'spirit', 'grace']
    )
    and nightfold_private.jsonb_integer_between(
      p_planner #> '{virtues,courage}', 0, 34
    )
    and nightfold_private.jsonb_integer_between(
      p_planner #> '{virtues,spirit}', 0, 34
    )
    and nightfold_private.jsonb_integer_between(
      p_planner #> '{virtues,grace}', 0, 34
    )
    and jsonb_typeof(p_planner -> 'affinitySources') = 'object'
    and nightfold_private.jsonb_object_has_only_keys(
      p_planner -> 'affinitySources', array['envoyRank', 'pactArts', 'fables']
    )
    and nightfold_private.jsonb_integer_between(
      p_planner #> '{affinitySources,envoyRank}', 0, 18
    )
    and case
      when jsonb_typeof(p_planner #> '{virtues,courage}') = 'number'
        and jsonb_typeof(p_planner #> '{virtues,spirit}') = 'number'
        and jsonb_typeof(p_planner #> '{virtues,grace}') = 'number'
        and jsonb_typeof(
          p_planner #> '{affinitySources,envoyRank}'
        ) = 'number'
      then
        (p_planner #>> '{virtues,courage}')::numeric
        + (p_planner #>> '{virtues,spirit}')::numeric
        + (p_planner #>> '{virtues,grace}')::numeric
        = 16 + (p_planner #>> '{affinitySources,envoyRank}')::numeric
      else false
    end
    and jsonb_typeof(p_planner #> '{affinitySources,pactArts}') = 'object'
    and nightfold_private.jsonb_object_has_only_keys(
      p_planner #> '{affinitySources,pactArts}', array['courage', 'spirit', 'grace']
    )
    and nightfold_private.jsonb_integer_between(
      p_planner #> '{affinitySources,pactArts,courage}', 0, 3
    )
    and nightfold_private.jsonb_integer_between(
      p_planner #> '{affinitySources,pactArts,spirit}', 0, 3
    )
    and nightfold_private.jsonb_integer_between(
      p_planner #> '{affinitySources,pactArts,grace}', 0, 3
    )
    and jsonb_typeof(p_planner #> '{affinitySources,fables}') = 'object'
    and nightfold_private.jsonb_object_has_only_keys(
      p_planner #> '{affinitySources,fables}', array['shewolf', 'wasteBear']
    )
    and (
      p_planner #> '{affinitySources,fables,shewolf}' = 'null'::jsonb
      or p_planner #>> '{affinitySources,fables,shewolf}' in (
        'courage', 'spirit', 'grace'
      )
    )
    and (
      p_planner #> '{affinitySources,fables,wasteBear}' = 'null'::jsonb
      or p_planner #>> '{affinitySources,fables,wasteBear}' in (
        'courage', 'spirit', 'grace'
      )
    )
    and jsonb_typeof(p_planner -> 'equipment') = 'object'
    and not exists (
      select 1
      from jsonb_each(
        case
          when jsonb_typeof(p_planner -> 'equipment') = 'object'
            then p_planner -> 'equipment'
          else '{}'::jsonb
        end
      ) as equipment(slot, item_id)
      where equipment.slot not in (
          'helm', 'cuirass', 'leggings', 'talisman', 'mainHand', 'offHand'
        )
        or jsonb_typeof(equipment.item_id) <> 'string'
        or length(equipment.item_id #>> '{}') > 120
    )
    and jsonb_typeof(p_planner -> 'pact') = 'object'
    and nightfold_private.jsonb_object_has_only_keys(
      p_planner -> 'pact', array['itemId', 'artAllocation']
    )
    and (
      p_planner #> '{pact,itemId}' = 'null'::jsonb
      or (
        jsonb_typeof(p_planner #> '{pact,itemId}') = 'string'
        and length(p_planner #>> '{pact,itemId}') <= 120
      )
    )
    and nightfold_private.art_allocation_is_valid(
      p_planner #> '{pact,artAllocation}'
    )
    and jsonb_typeof(p_planner -> 'combatArts') = 'object'
    and not exists (
      select 1
      from jsonb_each(
        case
          when jsonb_typeof(p_planner -> 'combatArts') = 'object'
            then p_planner -> 'combatArts'
          else '{}'::jsonb
        end
      ) as combat_art(name, allocation)
      where length(btrim(combat_art.name)) not between 1 and 160
        or not nightfold_private.art_allocation_is_valid(combat_art.allocation)
    )
    and jsonb_typeof(p_planner -> 'weaponEnhancements') = 'object'
    and nightfold_private.jsonb_object_has_only_keys(
      p_planner -> 'weaponEnhancements', array['mainHand', 'offHand']
    )
    and nightfold_private.weapon_enhancements_are_valid(
      p_planner #> '{weaponEnhancements,mainHand}'
    )
    and nightfold_private.weapon_enhancements_are_valid(
      p_planner #> '{weaponEnhancements,offHand}'
    );
$$;

alter table public.build_planner_artifacts
  add constraint build_planner_artifacts_soulframe_payload check (
    game_id = 'soulframe'
    and schema_version = 5
    and nightfold_private.soulframe_planner_is_valid(payload)
  );

create function nightfold_private.heading_hierarchy_is_valid(
  p_blocks jsonb,
  p_parent_level integer,
  p_first_minimum integer,
  p_first_maximum integer
)
returns boolean
language plpgsql
immutable
strict
set search_path = pg_catalog
as $$
declare
  v_block jsonb;
  v_level integer;
  v_previous_level integer := p_parent_level;
  v_seen_heading boolean := false;
begin
  if jsonb_typeof(p_blocks) <> 'array' then
    return false;
  end if;

  for v_block in select value from jsonb_array_elements(p_blocks)
  loop
    if v_block ->> 'type' = 'nightfold.heading' then
      v_level := (v_block #>> '{data,level}')::integer;
      if (not v_seen_heading and v_level not between p_first_minimum and p_first_maximum)
        or v_level > v_previous_level + 1 then
        return false;
      end if;
      v_previous_level := v_level;
      v_seen_heading := true;
    end if;
  end loop;

  return true;
end;
$$;

create function nightfold_private.build_stage_is_valid(p_block jsonb)
returns boolean
language plpgsql
immutable
strict
set search_path = pg_catalog, nightfold_private
as $$
declare
  v_data jsonb;
  v_role text;
begin
  if jsonb_typeof(p_block) <> 'object'
    or p_block ->> 'type' is distinct from 'soulframe.build.stage'
    or not p_block @> '{"schemaVersion": 1}'::jsonb
    or jsonb_typeof(p_block -> 'id') <> 'string'
    or coalesce(length(btrim(p_block ->> 'id')), 0) = 0
    or jsonb_typeof(p_block -> 'data') <> 'object' then
    return false;
  end if;

  if not nightfold_private.jsonb_object_has_only_keys(
    p_block,
    array['id', 'type', 'schemaVersion', 'data']
  ) then
    return false;
  end if;

  v_data := p_block -> 'data';
  v_role := v_data ->> 'role';

  if jsonb_typeof(v_data -> 'name') <> 'string'
    or length(btrim(v_data ->> 'name')) = 0
    or not coalesce(
      nightfold_private.soulframe_planner_is_valid(v_data -> 'planner'),
      false
    ) then
    return false;
  end if;

  if v_role = 'home' then
    if not nightfold_private.jsonb_object_has_only_keys(
        v_data, array['role', 'name', 'planner', 'sharedSections']
      )
      or v_data ? 'sections'
      or jsonb_typeof(v_data -> 'sharedSections') <> 'array' then
      return false;
    end if;

    if exists (
      select 1
      from jsonb_array_elements(v_data -> 'sharedSections') as section(value)
      where jsonb_typeof(section.value) <> 'object'
        or not nightfold_private.jsonb_object_has_only_keys(
          section.value, array['id', 'blocks']
        )
        or jsonb_typeof(section.value -> 'id') <> 'string'
        or length(btrim(section.value ->> 'id')) = 0
        or jsonb_typeof(section.value -> 'blocks') <> 'array'
    ) then
      return false;
    end if;

    if (
      select count(*) <> count(distinct section.value ->> 'id')
      from jsonb_array_elements(v_data -> 'sharedSections') as section(value)
    ) then
      return false;
    end if;

    if exists (
      select 1
      from jsonb_array_elements(v_data -> 'sharedSections') as section(value)
      cross join lateral jsonb_array_elements(section.value -> 'blocks') as child(value)
      where not nightfold_private.supporting_block_is_valid(child.value)
    ) then
      return false;
    end if;

    if exists (
      select 1
      from jsonb_array_elements(v_data -> 'sharedSections') as section(value)
      where not nightfold_private.heading_hierarchy_is_valid(
        section.value -> 'blocks', 2, 2, 3
      )
    ) then
      return false;
    end if;

    return true;
  end if;

  if v_role = 'variant' then
    if not nightfold_private.jsonb_object_has_only_keys(
        v_data, array['role', 'name', 'planner', 'sections']
      )
      or v_data ? 'sharedSections'
      or jsonb_typeof(v_data -> 'sections') <> 'array' then
      return false;
    end if;

    if exists (
      select 1
      from jsonb_array_elements(v_data -> 'sections') as section(value)
      where jsonb_typeof(section.value) <> 'object'
        or not nightfold_private.jsonb_object_has_only_keys(
          section.value,
          case
            when section.value ->> 'mode' = 'inherit'
              then array['sectionId', 'mode']
            else array['sectionId', 'mode', 'blocks']
          end
        )
        or jsonb_typeof(section.value -> 'sectionId') <> 'string'
        or length(btrim(section.value ->> 'sectionId')) = 0
        or section.value ->> 'mode' is null
        or section.value ->> 'mode' not in ('inherit', 'override')
        or (
          section.value ->> 'mode' = 'inherit'
          and section.value ? 'blocks'
        )
        or (
          section.value ->> 'mode' = 'override'
          and jsonb_typeof(section.value -> 'blocks') <> 'array'
        )
    ) then
      return false;
    end if;

    if (
      select count(*) <> count(distinct section.value ->> 'sectionId')
      from jsonb_array_elements(v_data -> 'sections') as section(value)
    ) then
      return false;
    end if;

    if exists (
      select 1
      from jsonb_array_elements(v_data -> 'sections') as section(value)
      cross join lateral jsonb_array_elements(
        coalesce(section.value -> 'blocks', '[]'::jsonb)
      ) as child(value)
      where section.value ->> 'mode' = 'override'
        and not nightfold_private.supporting_block_is_valid(child.value)
    ) then
      return false;
    end if;

    if exists (
      select 1
      from jsonb_array_elements(v_data -> 'sections') as section(value)
      where section.value ->> 'mode' = 'override'
        and not nightfold_private.heading_hierarchy_is_valid(
          section.value -> 'blocks', 2, 2, 3
        )
    ) then
      return false;
    end if;

    return true;
  end if;

  return false;
end;
$$;

create function nightfold_private.variant_references_home_sections(
  p_variant jsonb,
  p_home_section_ids text[]
)
returns boolean
language sql
immutable
strict
set search_path = pg_catalog
as $$
  select not exists (
    select 1
    from jsonb_array_elements(p_variant #> '{data,sections}') as section(value)
    where not (section.value ->> 'sectionId' = any (p_home_section_ids))
  );
$$;

create function nightfold_private.publication_state_is_draft_safe(
  p_profile_id text,
  p_state jsonb
)
returns boolean
language plpgsql
immutable
set search_path = pg_catalog, nightfold_private
as $$
declare
  v_blocks jsonb;
begin
  if not coalesce(nightfold_private.publication_state_has_shape(p_state), false)
    or not nightfold_private.jsonb_object_has_only_keys(
      p_state, array['schemaVersion', 'metadata', 'blocks']
    )
    or not nightfold_private.jsonb_object_has_only_keys(
      p_state -> 'metadata',
      array['title', 'summary', 'coverAssetId', 'classifications']
    ) then
    return false;
  end if;

  if jsonb_typeof(p_state #> '{metadata,title}') is distinct from 'string'
    or length(p_state #>> '{metadata,title}') > 160
    or (
      p_state -> 'metadata' ? 'summary'
      and (
        jsonb_typeof(p_state #> '{metadata,summary}') is distinct from 'string'
        or length(p_state #>> '{metadata,summary}') > 320
      )
    )
    or (
      p_state -> 'metadata' ? 'coverAssetId'
      and jsonb_typeof(p_state #> '{metadata,coverAssetId}') is distinct from 'string'
    )
    or jsonb_typeof(p_state #> '{metadata,classifications}') is distinct from 'array'
    or exists (
      select 1
      from jsonb_array_elements(
        case
          when jsonb_typeof(p_state #> '{metadata,classifications}') = 'array'
            then p_state #> '{metadata,classifications}'
          else '[]'::jsonb
        end
      ) as classification(value)
      where jsonb_typeof(classification.value) <> 'string'
    ) then
    return false;
  end if;

  v_blocks := p_state -> 'blocks';

  if p_profile_id = 'soulframe.build' then
    return not exists (
      select 1
      from jsonb_array_elements(v_blocks) as block(value)
      where not coalesce(
        nightfold_private.build_stage_is_valid(block.value),
        false
      )
    );
  end if;

  if p_profile_id = 'soulframe.guide' then
    return not exists (
      select 1
      from jsonb_array_elements(v_blocks) as block(value)
      where not coalesce(
        nightfold_private.supporting_block_is_valid(block.value),
        false
      )
    )
    and nightfold_private.heading_hierarchy_is_valid(v_blocks, 1, 2, 2);
  end if;

  return false;
end;
$$;

create function nightfold_private.publication_state_is_publishable(
  p_profile_id text,
  p_state jsonb
)
returns boolean
language plpgsql
immutable
set search_path = pg_catalog, nightfold_private
as $$
declare
  v_blocks jsonb;
  v_home jsonb;
  v_home_section_ids text[];
  v_home_count integer;
begin
  if not nightfold_private.publication_state_has_shape(p_state) then
    return false;
  end if;

  if not nightfold_private.jsonb_object_has_only_keys(
      p_state, array['schemaVersion', 'metadata', 'blocks']
    )
    or not nightfold_private.jsonb_object_has_only_keys(
      p_state -> 'metadata',
      array['title', 'summary', 'coverAssetId', 'classifications']
    ) then
    return false;
  end if;

  if jsonb_typeof(p_state #> '{metadata,title}') is distinct from 'string'
    or length(btrim(p_state #>> '{metadata,title}')) not between 1 and 160
    or (
      p_state -> 'metadata' ? 'summary'
      and (
        jsonb_typeof(p_state #> '{metadata,summary}') is distinct from 'string'
        or length(p_state #>> '{metadata,summary}') > 320
      )
    )
    or (
      p_state -> 'metadata' ? 'coverAssetId'
      and jsonb_typeof(p_state #> '{metadata,coverAssetId}') is distinct from 'string'
    )
    or jsonb_typeof(p_state #> '{metadata,classifications}') is distinct from 'array'
    or exists (
      select 1
      from jsonb_array_elements(
        case
          when jsonb_typeof(p_state #> '{metadata,classifications}') = 'array'
            then p_state #> '{metadata,classifications}'
          else '[]'::jsonb
        end
      ) as classification(value)
      where jsonb_typeof(classification.value) <> 'string'
    ) then
    return false;
  end if;

  v_blocks := p_state -> 'blocks';

  if exists (
    select 1
    from jsonb_array_elements(v_blocks) as block(value)
    where jsonb_typeof(block.value) <> 'object'
      or not block.value @> '{"schemaVersion": 1}'::jsonb
  ) then
    return false;
  end if;

  if p_profile_id = 'soulframe.build' then
    if exists (
      select 1
      from jsonb_array_elements(v_blocks) as block(value)
      where block.value ->> 'type' is null
        or block.value ->> 'type' <> 'soulframe.build.stage'
        or not nightfold_private.build_stage_is_valid(block.value)
    ) then
      return false;
    end if;

    select count(*)
    into v_home_count
    from jsonb_array_elements(v_blocks) as block(value)
    where block.value #>> '{data,role}' = 'home';

    if v_home_count <> 1 then
      return false;
    end if;

    select block.value
    into v_home
    from jsonb_array_elements(v_blocks) as block(value)
    where block.value #>> '{data,role}' = 'home';

    select coalesce(array_agg(section.value ->> 'id'), array[]::text[])
    into v_home_section_ids
    from jsonb_array_elements(v_home #> '{data,sharedSections}') as section(value);

    if exists (
      select 1
      from jsonb_array_elements(v_blocks) as block(value)
      where block.value #>> '{data,role}' = 'variant'
        and not nightfold_private.variant_references_home_sections(
          block.value,
          v_home_section_ids
        )
    ) then
      return false;
    end if;

    return true;
  end if;

  if p_profile_id = 'soulframe.guide' then
    if exists (
      select 1
      from jsonb_array_elements(v_blocks) as block(value)
      where block.value ->> 'type' is null
        or block.value ->> 'type' not in ('nightfold.heading', 'nightfold.rich-text')
        or not nightfold_private.supporting_block_is_valid(block.value)
    ) then
      return false;
    end if;

    if not nightfold_private.heading_hierarchy_is_valid(v_blocks, 1, 2, 2) then
      return false;
    end if;

    return exists (
      select 1
      from jsonb_array_elements(v_blocks) as block(value)
      where block.value ->> 'type' = 'nightfold.heading'
    );
  end if;

  return false;
end;
$$;

create function nightfold_private.set_updated_at()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  new.updated_at := statement_timestamp();
  return new;
end;
$$;

create trigger accounts_set_updated_at
before update on public.accounts
for each row execute function nightfold_private.set_updated_at();

create trigger creator_profiles_set_updated_at
before update on public.creator_profiles
for each row execute function nightfold_private.set_updated_at();

create trigger build_planner_artifacts_set_updated_at
before update on public.build_planner_artifacts
for each row execute function nightfold_private.set_updated_at();

create function nightfold_private.project_auth_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  insert into public.accounts (id, email, display_name, created_at, updated_at)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(btrim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(btrim(new.raw_user_meta_data ->> 'name'), ''),
      nullif(btrim(new.raw_user_meta_data ->> 'user_name'), '')
    ),
    coalesce(new.created_at, statement_timestamp()),
    statement_timestamp()
  )
  on conflict (id) do update
  set email = excluded.email,
      display_name = coalesce(excluded.display_name, public.accounts.display_name),
      updated_at = statement_timestamp();

  return new;
end;
$$;

create trigger auth_users_project_account
after insert or update of email, raw_user_meta_data on auth.users
for each row execute function nightfold_private.project_auth_user();

insert into public.accounts (id, email, display_name, created_at, updated_at)
select
  users.id,
  users.email,
  coalesce(
    nullif(btrim(users.raw_user_meta_data ->> 'full_name'), ''),
    nullif(btrim(users.raw_user_meta_data ->> 'name'), ''),
    nullif(btrim(users.raw_user_meta_data ->> 'user_name'), '')
  ),
  coalesce(users.created_at, statement_timestamp()),
  statement_timestamp()
from auth.users as users
on conflict (id) do nothing;

create function nightfold_private.reject_release_update()
returns trigger
language plpgsql
set search_path = pg_catalog
as $$
begin
  raise exception 'publication releases are immutable';
end;
$$;

create trigger publication_releases_reject_update
before update on public.publication_releases
for each row execute function nightfold_private.reject_release_update();

create function nightfold_private.enforce_vote_eligibility()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  v_publication public.publications%rowtype;
begin
  select *
  into v_publication
  from public.publications
  where id = new.publication_id;

  if not found then
    raise exception 'publication not found';
  end if;

  if new.voter_id = v_publication.owner_id then
    raise exception 'publication owners cannot vote for their own publications';
  end if;

  if v_publication.status <> 'published'
    or not v_publication.is_valid
    or v_publication.deleted_at is not null
    or v_publication.current_release_id is null then
    raise exception 'publication is not eligible for voting';
  end if;

  return new;
end;
$$;

create trigger publication_votes_enforce_eligibility
before insert or update on public.publication_votes
for each row execute function nightfold_private.enforce_vote_eligibility();

create function nightfold_private.maintain_vote_count()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if tg_op = 'INSERT' then
    update public.publications
    set vote_count = vote_count + 1
    where id = new.publication_id;
    return new;
  end if;

  update public.publications
  set vote_count = greatest(vote_count - 1, 0)
  where id = old.publication_id;
  return old;
end;
$$;

create trigger publication_votes_maintain_count
after insert or delete on public.publication_votes
for each row execute function nightfold_private.maintain_vote_count();

create policy games_public_read
on public.games for select
to anon, authenticated
using (true);

create policy publication_profile_keys_public_read
on public.publication_profile_keys for select
to anon, authenticated
using (true);

create policy accounts_owner_read
on public.accounts for select
to authenticated
using (id = auth.uid());

create policy creator_profiles_public_read
on public.creator_profiles for select
to anon, authenticated
using (true);

create view public.public_creator_profiles
with (security_invoker = true)
as
select
  account_id,
  handle,
  display_name,
  bio,
  activated_at
from public.creator_profiles;

create policy build_planner_artifacts_owner_read
on public.build_planner_artifacts for select
to authenticated
using (owner_id = auth.uid());

create policy build_planner_artifacts_owner_insert
on public.build_planner_artifacts for insert
to authenticated
with check (owner_id = auth.uid());

create policy build_planner_artifacts_owner_update
on public.build_planner_artifacts for update
to authenticated
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy build_planner_artifacts_owner_delete
on public.build_planner_artifacts for delete
to authenticated
using (owner_id = auth.uid());

create policy publications_owner_or_public_read
on public.publications for select
to anon, authenticated
using (
  owner_id = auth.uid()
  or (
    status = 'published'
    and is_valid
    and deleted_at is null
    and current_release_id is not null
  )
);

create policy publication_drafts_owner_read
on public.publication_drafts for select
to authenticated
using (
  exists (
    select 1
    from public.publications
    where publications.id = publication_drafts.publication_id
      and publications.owner_id = auth.uid()
  )
);

create policy publication_draft_checkpoints_owner_read
on public.publication_draft_checkpoints for select
to authenticated
using (
  exists (
    select 1
    from public.publications
    where publications.id = publication_draft_checkpoints.publication_id
      and publications.owner_id = auth.uid()
  )
);

create policy publication_releases_owner_or_current_public_read
on public.publication_releases for select
to anon, authenticated
using (
  exists (
    select 1
    from public.publications
    where publications.id = publication_releases.publication_id
      and (
        publications.owner_id = auth.uid()
        or (
          publications.status = 'published'
          and publications.is_valid
          and publications.deleted_at is null
          and publications.current_release_id = publication_releases.id
        )
      )
  )
);

create policy publication_votes_voter_read
on public.publication_votes for select
to authenticated
using (voter_id = auth.uid());

revoke all on table public.games from public, anon, authenticated;
revoke all on table public.game_expansions from public, anon, authenticated, service_role;
revoke all on table public.game_seasons from public, anon, authenticated, service_role;
revoke all on table public.game_patches from public, anon, authenticated, service_role;
revoke all on table public.game_context_records from public, anon, authenticated, service_role;
revoke all on table public.publication_profile_keys from public, anon, authenticated;
revoke all on table public.accounts from public, anon, authenticated;
revoke all on table public.creator_profiles from public, anon, authenticated;
revoke all on table public.build_planner_artifacts from public, anon, authenticated;
revoke all on table public.publications from public, anon, authenticated;
revoke all on table public.publication_drafts from public, anon, authenticated;
revoke all on table public.publication_draft_checkpoints from public, anon, authenticated;
revoke all on table public.publication_releases from public, anon, authenticated;
revoke all on table public.publication_votes from public, anon, authenticated;
revoke all on table public.public_creator_profiles from public, anon, authenticated;

grant select on table public.games to anon, authenticated;
grant select on table public.publication_profile_keys to anon, authenticated;
grant select on table public.accounts to authenticated;
grant select (account_id, handle, display_name, bio, activated_at)
  on table public.creator_profiles to anon, authenticated;
grant select on table public.public_creator_profiles to anon, authenticated;
grant select, delete on table public.build_planner_artifacts to authenticated;
grant insert (id, owner_id, game_id, name, schema_version, payload)
  on table public.build_planner_artifacts to authenticated;
grant update (game_id, name, schema_version, payload)
  on table public.build_planner_artifacts to authenticated;
grant select on table public.publications to anon, authenticated;
grant select on table public.publication_drafts to authenticated;
grant select on table public.publication_draft_checkpoints to authenticated;
grant select (id, publication_id, state, is_valid, published_at)
  on table public.publication_releases to anon;
grant select on table public.publication_releases to authenticated;
grant select on table public.publication_votes to authenticated;

create function public.activate_creator_profile(p_handle text, p_display_name text)
returns public.creator_profiles
language plpgsql
security definer
set search_path = pg_catalog, auth
as $$
declare
  v_account_id uuid := auth.uid();
  v_profile public.creator_profiles%rowtype;
begin
  if v_account_id is null then
    raise exception 'authentication required';
  end if;

  insert into public.creator_profiles (account_id, handle, display_name)
  values (v_account_id, lower(btrim(p_handle)), btrim(p_display_name))
  returning * into v_profile;

  return v_profile;
end;
$$;

create function public.get_current_creator_profile()
returns public.creator_profiles
language plpgsql
stable
security definer
set search_path = pg_catalog, auth
as $$
declare
  v_account_id uuid := auth.uid();
  v_profile public.creator_profiles%rowtype;
begin
  if v_account_id is null then
    raise exception 'authentication required';
  end if;

  select *
  into v_profile
  from public.creator_profiles
  where account_id = v_account_id;

  return v_profile;
end;
$$;

create function public.update_creator_profile(
  p_display_name text default null,
  p_bio text default null,
  p_set_bio boolean default false
)
returns public.creator_profiles
language plpgsql
security definer
set search_path = pg_catalog, auth
as $$
declare
  v_account_id uuid := auth.uid();
  v_profile public.creator_profiles%rowtype;
begin
  if v_account_id is null then
    raise exception 'authentication required';
  end if;

  update public.creator_profiles
  set display_name = coalesce(nullif(btrim(p_display_name), ''), display_name),
      bio = case when p_set_bio then p_bio else bio end
  where account_id = v_account_id
  returning * into v_profile;

  if not found then
    raise exception 'creator profile not found';
  end if;

  return v_profile;
end;
$$;

create function public.create_publication(
  p_game_id text,
  p_profile_id text,
  p_slug text,
  p_initial_state jsonb
)
returns public.publications
language plpgsql
security definer
set search_path = pg_catalog, auth, nightfold_private
as $$
declare
  v_account_id uuid := auth.uid();
  v_publication public.publications%rowtype;
begin
  if v_account_id is null then
    raise exception 'authentication required';
  end if;

  if not exists (
    select 1
    from public.creator_profiles
    where account_id = v_account_id
      and publisher_eligible
  ) then
    raise exception 'an eligible creator profile is required';
  end if;

  if not exists (
    select 1
    from public.publication_profile_keys
    where game_id = p_game_id and id = p_profile_id
  ) then
    raise exception 'publication profile does not belong to the requested game';
  end if;

  if not nightfold_private.publication_state_is_draft_safe(
    p_profile_id,
    p_initial_state
  ) then
    raise exception 'publication state is not draft-safe for profile';
  end if;

  insert into public.publications (
    owner_id,
    game_id,
    profile_id,
    slug
  )
  values (
    v_account_id,
    p_game_id,
    p_profile_id,
    lower(btrim(p_slug))
  )
  returning * into v_publication;

  insert into public.publication_drafts (publication_id, state)
  values (
    v_publication.id,
    p_initial_state
  );

  return v_publication;
end;
$$;

create function public.save_publication_draft(
  p_publication_id uuid,
  p_state jsonb
)
returns public.publication_drafts
language plpgsql
security definer
set search_path = pg_catalog, auth, nightfold_private
as $$
declare
  v_account_id uuid := auth.uid();
  v_publication public.publications%rowtype;
  v_draft public.publication_drafts%rowtype;
begin
  if v_account_id is null then
    raise exception 'authentication required';
  end if;

  select *
  into v_publication
  from public.publications
  where id = p_publication_id
  for update;

  if not found or v_publication.owner_id <> v_account_id then
    raise exception 'publication not found';
  end if;

  if v_publication.status = 'deleted' then
    raise exception 'deleted publications cannot be edited';
  end if;

  if not nightfold_private.publication_state_is_draft_safe(
    v_publication.profile_id,
    p_state
  ) then
    raise exception 'publication state is not draft-safe for profile';
  end if;

  update public.publication_drafts
  set state = p_state,
      updated_at = statement_timestamp()
  where publication_id = p_publication_id
  returning * into v_draft;

  if not found then
    raise exception 'publication draft not found';
  end if;

  update public.publications
  set updated_at = statement_timestamp()
  where id = p_publication_id;

  return v_draft;
end;
$$;

create function public.create_publication_checkpoint(p_publication_id uuid)
returns public.publication_draft_checkpoints
language plpgsql
security definer
set search_path = pg_catalog, auth
as $$
declare
  v_account_id uuid := auth.uid();
  v_publication public.publications%rowtype;
  v_draft public.publication_drafts%rowtype;
  v_existing public.publication_draft_checkpoints%rowtype;
  v_checkpoint public.publication_draft_checkpoints%rowtype;
  v_next_number bigint;
  v_max_checkpoints integer;
begin
  if v_account_id is null then
    raise exception 'authentication required';
  end if;

  select *
  into v_publication
  from public.publications
  where id = p_publication_id
  for update;

  if not found or v_publication.owner_id <> v_account_id then
    raise exception 'publication not found';
  end if;

  if v_publication.status = 'deleted' then
    raise exception 'deleted publications cannot create checkpoints';
  end if;

  select max_draft_checkpoints
  into strict v_max_checkpoints
  from nightfold_private.publication_operational_policy
  where singleton;

  select *
  into strict v_draft
  from public.publication_drafts
  where publication_id = p_publication_id
  for update;

  select *
  into v_existing
  from public.publication_draft_checkpoints
  where publication_id = p_publication_id
  order by checkpoint_number desc
  limit 1;

  if found
    and v_existing.state = v_draft.state then
    return v_existing;
  end if;

  select coalesce(max(checkpoint_number), 0) + 1
  into v_next_number
  from public.publication_draft_checkpoints
  where publication_id = p_publication_id;

  insert into public.publication_draft_checkpoints (
    publication_id,
    checkpoint_number,
    state
  )
  values (
    p_publication_id,
    v_next_number,
    v_draft.state
  )
  returning * into v_checkpoint;

  delete from public.publication_draft_checkpoints
  where id in (
    select id
    from public.publication_draft_checkpoints
    where publication_id = p_publication_id
    order by checkpoint_number desc
    offset v_max_checkpoints
  );

  return v_checkpoint;
end;
$$;

create function public.recover_publication_draft(
  p_publication_id uuid,
  p_source_kind text,
  p_source_id uuid
)
returns public.publication_drafts
language plpgsql
security definer
set search_path = pg_catalog, auth
as $$
declare
  v_account_id uuid := auth.uid();
  v_publication public.publications%rowtype;
  v_state jsonb;
  v_draft public.publication_drafts%rowtype;
begin
  if v_account_id is null then
    raise exception 'authentication required';
  end if;

  select *
  into v_publication
  from public.publications
  where id = p_publication_id
  for update;

  if not found or v_publication.owner_id <> v_account_id then
    raise exception 'publication not found';
  end if;

  if v_publication.status = 'deleted' then
    raise exception 'restore the deleted publication before recovering its draft';
  end if;

  if p_source_kind = 'draft-checkpoint' then
    select state
    into v_state
    from public.publication_draft_checkpoints
    where id = p_source_id
      and publication_id = p_publication_id;
  elsif p_source_kind = 'release' then
    select state
    into v_state
    from public.publication_releases
    where id = p_source_id
      and publication_id = p_publication_id;
  else
    raise exception 'unknown recovery source kind';
  end if;

  if not found then
    raise exception 'recovery source not found';
  end if;

  -- Preserve the pre-recovery draft as a bounded checkpoint, then copy the
  -- retained source forward. Neither the source nor the public release changes.
  perform public.create_publication_checkpoint(p_publication_id);

  update public.publication_drafts
  set state = v_state,
      updated_at = statement_timestamp()
  where publication_id = p_publication_id
  returning * into v_draft;

  update public.publications
  set updated_at = statement_timestamp()
  where id = p_publication_id;

  return v_draft;
end;
$$;

create function public.publish_publication(p_publication_id uuid)
returns public.publication_releases
language plpgsql
security definer
set search_path = pg_catalog, auth, nightfold_private
as $$
declare
  v_account_id uuid := auth.uid();
  v_publication public.publications%rowtype;
  v_draft public.publication_drafts%rowtype;
  v_release public.publication_releases%rowtype;
  v_next_number bigint;
  v_published_at timestamptz := statement_timestamp();
  v_max_releases integer;
begin
  if v_account_id is null then
    raise exception 'authentication required';
  end if;

  select *
  into v_publication
  from public.publications
  where id = p_publication_id
  for update;

  if not found or v_publication.owner_id <> v_account_id then
    raise exception 'publication not found';
  end if;

  if v_publication.status = 'deleted' then
    raise exception 'deleted publications cannot be published';
  end if;

  if not exists (
    select 1
    from public.creator_profiles
    where account_id = v_account_id
      and publisher_eligible
  ) then
    raise exception 'publisher eligibility is required';
  end if;

  select max_retained_releases
  into strict v_max_releases
  from nightfold_private.publication_operational_policy
  where singleton;

  select *
  into strict v_draft
  from public.publication_drafts
  where publication_id = p_publication_id
  for update;

  if not nightfold_private.publication_state_is_publishable(
    v_publication.profile_id,
    v_draft.state
  ) then
    raise exception 'persisted publication draft does not meet minimum profile requirements';
  end if;

  select coalesce(max(release_number), 0) + 1
  into v_next_number
  from public.publication_releases
  where publication_id = p_publication_id;

  insert into public.publication_releases (
    publication_id,
    release_number,
    state,
    is_valid,
    published_at
  )
  values (
    p_publication_id,
    v_next_number,
    v_draft.state,
    true,
    v_published_at
  )
  returning * into v_release;

  update public.publications
  set status = 'published',
      current_release_id = v_release.id,
      first_published_at = coalesce(first_published_at, v_published_at),
      latest_published_at = v_published_at,
      deleted_at = null,
      recoverable_until = null,
      is_valid = true,
      updated_at = v_published_at
  where id = p_publication_id;

  -- The configured P0 retention policy is enforced on every publish. The
  -- new/current release is excluded even if ordering data is later repaired.
  delete from public.publication_releases
  where id in (
    select id
    from public.publication_releases
    where publication_id = p_publication_id
      and id <> v_release.id
    order by release_number desc
    offset greatest(v_max_releases - 1, 0)
  );

  return v_release;
end;
$$;

create function public.unpublish_publication(p_publication_id uuid)
returns public.publications
language plpgsql
security definer
set search_path = pg_catalog, auth
as $$
declare
  v_account_id uuid := auth.uid();
  v_publication public.publications%rowtype;
begin
  if v_account_id is null then
    raise exception 'authentication required';
  end if;

  select *
  into v_publication
  from public.publications
  where id = p_publication_id
  for update;

  if not found or v_publication.owner_id <> v_account_id then
    raise exception 'publication not found';
  end if;

  if v_publication.status <> 'published' then
    raise exception 'only a published publication can be unpublished';
  end if;

  update public.publications
  set status = 'unpublished',
      current_release_id = null,
      updated_at = statement_timestamp()
  where id = p_publication_id
  returning * into v_publication;

  return v_publication;
end;
$$;

create function public.soft_delete_publication(p_publication_id uuid)
returns public.publications
language plpgsql
security definer
set search_path = pg_catalog, auth
as $$
declare
  v_account_id uuid := auth.uid();
  v_publication public.publications%rowtype;
  v_deleted_at timestamptz := statement_timestamp();
  v_recovery_days integer;
begin
  if v_account_id is null then
    raise exception 'authentication required';
  end if;

  select *
  into v_publication
  from public.publications
  where id = p_publication_id
  for update;

  if not found or v_publication.owner_id <> v_account_id then
    raise exception 'publication not found';
  end if;

  if v_publication.status = 'deleted' then
    raise exception 'publication is already deleted';
  end if;

  select deleted_recovery_days
  into strict v_recovery_days
  from nightfold_private.publication_operational_policy
  where singleton;

  update public.publications
  set status = 'deleted',
      current_release_id = null,
      deleted_at = v_deleted_at,
      recoverable_until = v_deleted_at + (v_recovery_days * interval '1 day'),
      updated_at = v_deleted_at
  where id = p_publication_id
  returning * into v_publication;

  return v_publication;
end;
$$;

create function public.restore_deleted_publication(p_publication_id uuid)
returns public.publications
language plpgsql
security definer
set search_path = pg_catalog, auth
as $$
declare
  v_account_id uuid := auth.uid();
  v_publication public.publications%rowtype;
begin
  if v_account_id is null then
    raise exception 'authentication required';
  end if;

  select *
  into v_publication
  from public.publications
  where id = p_publication_id
  for update;

  if not found or v_publication.owner_id <> v_account_id then
    raise exception 'publication not found';
  end if;

  if v_publication.status <> 'deleted' then
    raise exception 'publication is not deleted';
  end if;

  if statement_timestamp() > v_publication.recoverable_until then
    raise exception 'publication recovery window has expired';
  end if;

  update public.publications
  set status = case
        when first_published_at is null then 'draft'
        else 'unpublished'
      end,
      current_release_id = null,
      deleted_at = null,
      recoverable_until = null,
      is_valid = case when first_published_at is null then false else is_valid end,
      updated_at = statement_timestamp()
  where id = p_publication_id
  returning * into v_publication;

  return v_publication;
end;
$$;

create function public.toggle_publication_vote(p_publication_id uuid)
returns table (active boolean, vote_count bigint)
language plpgsql
security definer
set search_path = pg_catalog, auth
as $$
declare
  v_account_id uuid := auth.uid();
  v_publication public.publications%rowtype;
  v_removed boolean;
begin
  if v_account_id is null then
    raise exception 'authentication required';
  end if;

  select *
  into v_publication
  from public.publications
  where id = p_publication_id
  for update;

  if not found then
    raise exception 'publication not found';
  end if;

  if v_publication.owner_id = v_account_id then
    raise exception 'publication owners cannot vote for their own publications';
  end if;

  if v_publication.status <> 'published'
    or not v_publication.is_valid
    or v_publication.deleted_at is not null
    or v_publication.current_release_id is null then
    raise exception 'publication is not eligible for voting';
  end if;

  delete from public.publication_votes
  where publication_id = p_publication_id
    and voter_id = v_account_id
  returning true into v_removed;

  if found then
    active := false;
  else
    insert into public.publication_votes (publication_id, voter_id)
    values (p_publication_id, v_account_id);
    active := true;
  end if;

  select publications.vote_count
  into vote_count
  from public.publications as publications
  where publications.id = p_publication_id;

  return next;
end;
$$;

create function nightfold_private.discover_publications_ranked(
  p_game_id text,
  p_profile_id text,
  p_order text,
  p_limit integer,
  p_offset integer,
  p_as_of timestamptz,
  p_trending_window interval,
  p_decay_hours numeric
)
returns table (
  publication_id uuid,
  profile_id text,
  game_id text,
  slug text,
  creator_handle text,
  title text,
  summary text,
  cover_asset_id text,
  classifications jsonb,
  first_published_at timestamptz,
  latest_published_at timestamptz,
  vote_count bigint,
  ranking_score double precision
)
language plpgsql
stable
security definer
set search_path = pg_catalog
as $$
begin
  if p_order not in ('trending', 'top', 'new') then
    raise exception 'unknown discovery order';
  end if;

  if p_limit < 1 or p_limit > 100 or p_offset < 0 then
    raise exception 'discovery pagination is out of range';
  end if;

  if p_as_of is null
    or p_trending_window <= interval '0 seconds'
    or p_decay_hours <= 0 then
    raise exception 'trending policy parameters must be positive';
  end if;

  if not exists (
    select 1
    from public.publication_profile_keys as profile_keys
    where profile_keys.game_id = p_game_id
      and profile_keys.id = p_profile_id
  ) then
    raise exception 'publication profile does not belong to the requested game';
  end if;

  return query
  with eligible as (
    select
      publications.id,
      publications.profile_id,
      publications.game_id,
      publications.slug,
      publications.owner_id,
      publications.current_release_id,
      publications.first_published_at,
      publications.latest_published_at,
      publications.vote_count
    from public.publications as publications
    where publications.game_id = p_game_id
      and publications.profile_id = p_profile_id
      and publications.status = 'published'
      and publications.is_valid
      and publications.deleted_at is null
      and publications.current_release_id is not null
  ),
  ranked as (
    select
      eligible.*,
      coalesce(recent.score, 0::double precision) as trending_score
    from eligible
    left join lateral (
      select sum(
        exp(
          -greatest(
            extract(epoch from (p_as_of - votes.created_at)) / 3600.0,
            0::numeric
          )::double precision
          / p_decay_hours::double precision
        )
      ) as score
      from public.publication_votes as votes
      where votes.publication_id = eligible.id
        and votes.created_at >= p_as_of - p_trending_window
        and votes.created_at <= p_as_of
    ) as recent on true
  )
  select
    ranked.id,
    ranked.profile_id,
    ranked.game_id,
    ranked.slug,
    creator_profiles.handle,
    releases.state #>> '{metadata,title}',
    nullif(releases.state #>> '{metadata,summary}', ''),
    nullif(releases.state #>> '{metadata,coverAssetId}', ''),
    case
      when jsonb_typeof(releases.state #> '{metadata,classifications}') = 'array'
        then releases.state #> '{metadata,classifications}'
      else '[]'::jsonb
    end,
    ranked.first_published_at,
    ranked.latest_published_at,
    ranked.vote_count,
    case p_order
      when 'trending' then ranked.trending_score
      when 'top' then ranked.vote_count::double precision
      when 'new' then extract(epoch from ranked.first_published_at)::double precision
    end
  from ranked
  join public.publication_releases as releases
    on releases.publication_id = ranked.id
   and releases.id = ranked.current_release_id
   and releases.is_valid
  join public.creator_profiles
    on creator_profiles.account_id = ranked.owner_id
  order by
    case when p_order = 'trending' then ranked.trending_score end desc,
    case when p_order = 'top' then ranked.vote_count end desc,
    case when p_order = 'new' then ranked.first_published_at end desc,
    case when p_order in ('trending', 'top') then ranked.latest_published_at end desc,
    ranked.id
  limit p_limit
  offset p_offset;
end;
$$;

create function public.discover_publications(
  p_game_id text,
  p_profile_id text,
  p_order text default 'trending',
  p_limit integer default 20,
  p_offset integer default 0
)
returns table (
  publication_id uuid,
  profile_id text,
  game_id text,
  slug text,
  creator_handle text,
  title text,
  summary text,
  cover_asset_id text,
  classifications jsonb,
  first_published_at timestamptz,
  latest_published_at timestamptz,
  vote_count bigint,
  ranking_score double precision
)
language plpgsql
stable
security definer
set search_path = pg_catalog
as $$
declare
  v_trending_window interval;
  v_decay_hours numeric;
  v_max_offset integer;
begin
  select trending_window, trending_decay_hours, max_discovery_offset
  into strict v_trending_window, v_decay_hours, v_max_offset
  from nightfold_private.publication_operational_policy
  where singleton;

  if p_offset < 0 or p_offset > v_max_offset then
    raise exception 'discovery pagination is out of range';
  end if;

  return query
  select ranked.*
  from nightfold_private.discover_publications_ranked(
    p_game_id,
    p_profile_id,
    p_order,
    p_limit,
    p_offset,
    statement_timestamp(),
    v_trending_window,
    v_decay_hours
  ) as ranked;
end;
$$;

revoke all on all functions in schema nightfold_private
  from public, anon, authenticated, service_role;

revoke all on function public.activate_creator_profile(text, text)
  from public, anon, authenticated;
revoke all on function public.get_current_creator_profile()
  from public, anon, authenticated;
revoke all on function public.update_creator_profile(text, text, boolean)
  from public, anon, authenticated;
revoke all on function public.create_publication(text, text, text, jsonb)
  from public, anon, authenticated;
revoke all on function public.save_publication_draft(uuid, jsonb)
  from public, anon, authenticated;
revoke all on function public.create_publication_checkpoint(uuid)
  from public, anon, authenticated;
revoke all on function public.recover_publication_draft(uuid, text, uuid)
  from public, anon, authenticated;
revoke all on function public.publish_publication(uuid)
  from public, anon, authenticated;
revoke all on function public.unpublish_publication(uuid)
  from public, anon, authenticated;
revoke all on function public.soft_delete_publication(uuid)
  from public, anon, authenticated;
revoke all on function public.restore_deleted_publication(uuid)
  from public, anon, authenticated;
revoke all on function public.toggle_publication_vote(uuid)
  from public, anon, authenticated;
revoke all on function public.discover_publications(
  text, text, text, integer, integer
) from public, anon, authenticated;

grant execute on function public.activate_creator_profile(text, text) to authenticated;
grant execute on function public.get_current_creator_profile() to authenticated;
grant execute on function public.update_creator_profile(text, text, boolean) to authenticated;
grant execute on function public.create_publication(text, text, text, jsonb) to authenticated;
grant execute on function public.save_publication_draft(uuid, jsonb) to authenticated;
grant execute on function public.create_publication_checkpoint(uuid) to authenticated;
grant execute on function public.recover_publication_draft(uuid, text, uuid) to authenticated;
grant execute on function public.publish_publication(uuid) to authenticated;
grant execute on function public.unpublish_publication(uuid) to authenticated;
grant execute on function public.soft_delete_publication(uuid) to authenticated;
grant execute on function public.restore_deleted_publication(uuid) to authenticated;
grant execute on function public.toggle_publication_vote(uuid) to authenticated;
grant execute on function public.discover_publications(
  text, text, text, integer, integer
) to anon, authenticated;
