begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pg_catalog;

select plan(97);

-- Stable identities keep failures readable and allow every policy boundary to
-- be exercised without depending on generated fixture values.
insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
values
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000001',
    'authenticated',
    'authenticated',
    'owner@example.invalid',
    '',
    '2026-08-07 00:00:00+00',
    '{"provider":"email","providers":["email"]}',
    '{"name":"Owner"}',
    '2026-08-07 00:00:00+00',
    '2026-08-07 00:00:00+00',
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000002',
    'authenticated',
    'authenticated',
    'voter@example.invalid',
    '',
    '2026-08-07 00:00:00+00',
    '{"provider":"email","providers":["email"]}',
    '{"name":"Voter"}',
    '2026-08-07 00:00:00+00',
    '2026-08-07 00:00:00+00',
    '',
    '',
    '',
    ''
  ),
  (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000003',
    'authenticated',
    'authenticated',
    'outsider@example.invalid',
    '',
    '2026-08-07 00:00:00+00',
    '{"provider":"email","providers":["email"]}',
    '{"name":"Outsider"}',
    '2026-08-07 00:00:00+00',
    '2026-08-07 00:00:00+00',
    '',
    '',
    '',
    ''
  );

insert into public.games (id, display_name)
values
  ('soulframe', 'Soulframe'),
  ('othergame', 'Other Game')
on conflict (id) do nothing;

insert into public.publication_profile_keys (id, game_id)
values
  ('soulframe.build', 'soulframe'),
  ('soulframe.guide', 'soulframe')
on conflict (id) do nothing;

select throws_like(
  $$
    insert into public.publication_profile_keys (id, game_id)
    values ('soulframe.future', 'soulframe')
  $$,
  '%publication_profile_keys_p0_registry%',
  'the database registry mirrors only the two approved P0 profile keys'
);

-- Game context is a private, append-only temporal ledger. Expansion, season,
-- and patch are independent axes whose identities are scoped to one game.
insert into public.game_expansions (game_id, id)
values
  ('soulframe', 'prelude'),
  ('othergame', 'elsewhere');

insert into public.game_seasons (game_id, id)
values
  ('soulframe', 'season-one'),
  ('othergame', 'other-season');

insert into public.game_patches (game_id, id)
values
  ('soulframe', 'p1'),
  ('othergame', 'other-patch');

insert into public.game_context_records (
  id, game_id, expansion_id, season_id, patch_id, effective_from, recorded_at
)
values
  (
    '70000000-0000-0000-0000-000000000001', 'soulframe', null, null, null,
    '2025-01-01 00:00:00+00', '2025-01-01 01:00:00+00'
  ),
  (
    '70000000-0000-0000-0000-000000000002', 'soulframe', 'prelude', null, null,
    '2025-02-01 00:00:00+00', '2025-02-01 01:00:00+00'
  ),
  (
    '70000000-0000-0000-0000-000000000003', 'soulframe', null, 'season-one', null,
    '2025-03-01 00:00:00+00', '2025-03-01 01:00:00+00'
  ),
  (
    '70000000-0000-0000-0000-000000000004', 'soulframe', null, null, 'p1',
    '2025-04-01 00:00:00+00', '2025-04-01 01:00:00+00'
  ),
  (
    '70000000-0000-0000-0000-000000000109', 'soulframe', null, null, null,
    '2026-07-01 00:00:00+00', '2026-07-01 08:00:00+00'
  ),
  (
    '70000000-0000-0000-0000-000000000101', 'soulframe', null, null, null,
    '2026-07-01 00:00:00+00', '2026-07-01 09:00:00+00'
  ),
  (
    '70000000-0000-0000-0000-000000000102', 'soulframe', null, null, null,
    '2026-07-01 00:00:00+00', '2026-07-01 09:00:00+00'
  ),
  (
    '70000000-0000-0000-0000-000000000200', 'soulframe', null, null, null,
    '9999-12-30 00:00:00+00', '2026-07-01 10:00:00+00'
  ),
  (
    '80000000-0000-0000-0000-000000000001', 'othergame', null, null, null,
    '2000-01-01 00:00:00+00', '2000-01-01 01:00:00+00'
  ),
  (
    '80000000-0000-0000-0000-000000000002', 'othergame', null, null, null,
    '9999-12-30 00:00:00+00', '2026-07-01 01:00:00+00'
  );

select results_eq(
  $$
    select
      id is not null,
      game_id,
      expansion_id,
      season_id,
      patch_id,
      effective_from,
      recorded_at = statement_timestamp()
    from nightfold_private.append_game_context_record(
      'soulframe',
      '2026-05-01 00:00:00+00',
      'prelude',
      'season-one',
      'p1'
    )
  $$,
  $$
    values (
      true,
      'soulframe'::text,
      'prelude'::text,
      'season-one'::text,
      'p1'::text,
      '2026-05-01 00:00:00+00'::timestamptz,
      true
    )
  $$,
  'the privileged append path records the complete same-game context with database time'
);

select results_eq(
  $$
    select expansion_id is null, season_id is null, patch_id is null
    from public.game_context_records
    where id between
      '70000000-0000-0000-0000-000000000001'
      and '70000000-0000-0000-0000-000000000004'
    order by id
  $$,
  $$
    values
      (true, true, true),
      (false, true, true),
      (true, false, true),
      (true, true, false)
  $$,
  'all-null and independently populated game-context axes are valid'
);

select throws_like(
  $$
    select *
    from nightfold_private.append_game_context_record(
      'soulframe', '2026-06-01 00:00:00+00', 'elsewhere', null, null
    )
  $$,
  '%game_context_records_expansion_same_game_fk%',
  'an expansion identity from another game is rejected'
);

select throws_like(
  $$
    select *
    from nightfold_private.append_game_context_record(
      'soulframe', '2026-06-01 00:00:00+00', null, 'other-season', null
    )
  $$,
  '%game_context_records_season_same_game_fk%',
  'a season identity from another game is rejected'
);

select throws_like(
  $$
    select *
    from nightfold_private.append_game_context_record(
      'soulframe', '2026-06-01 00:00:00+00', null, null, 'other-patch'
    )
  $$,
  '%game_context_records_patch_same_game_fk%',
  'a patch identity from another game is rejected'
);

select results_eq(
  $$
    select queries.ordinal, records.id
    from (
      values
        (1, '2026-07-02 00:00:00+00'::timestamptz),
        (2, '9999-12-31 00:00:00+00'::timestamptz)
    ) as queries(ordinal, at_time)
    cross join lateral nightfold_private.game_context_record_as_of(
      'othergame', queries.at_time
    ) as records
    order by queries.ordinal
  $$,
  $$
    values
      (1, '80000000-0000-0000-0000-000000000001'::uuid),
      (2, '80000000-0000-0000-0000-000000000002'::uuid)
  $$,
  'as-of reads exclude future records until their effective time'
);

select results_eq(
  $$
    select id
    from nightfold_private.current_game_context_record('othergame')
  $$,
  $$ values ('80000000-0000-0000-0000-000000000001'::uuid) $$,
  'current reads apply the same effective-time boundary'
);

select results_eq(
  $$
    select id
    from nightfold_private.game_context_record_as_of(
      'soulframe', '2026-07-02 00:00:00+00'
    )
  $$,
  $$ values ('70000000-0000-0000-0000-000000000102'::uuid) $$,
  'equal effective times break ties by recorded time and then stable id'
);

select throws_ok(
  $$
    update public.game_context_records
    set effective_from = effective_from
    where id = '70000000-0000-0000-0000-000000000001'
  $$,
  'P0001',
  'game context records are append-only',
  'even a no-op update is structurally rejected'
);

select throws_ok(
  $$
    delete from public.game_context_records
    where id = '70000000-0000-0000-0000-000000000001'
  $$,
  'P0001',
  'game context records are append-only',
  'deleting a recorded game context is structurally rejected'
);

select is(
  (
    select count(*)::bigint
    from information_schema.role_table_grants
    where table_schema = 'public'
      and table_name in (
        'game_expansions',
        'game_seasons',
        'game_patches',
        'game_context_records'
      )
      and grantee in ('PUBLIC', 'anon', 'authenticated', 'service_role')
  ),
  0::bigint,
  'PUBLIC and API roles receive no game-context table privileges'
);

select is(
  (
    select count(*)::bigint
    from information_schema.routine_privileges
    where specific_schema = 'nightfold_private'
      and routine_name in (
        'append_game_context_record',
        'game_context_record_as_of',
        'current_game_context_record'
      )
      and grantee in ('PUBLIC', 'anon', 'authenticated', 'service_role')
  ),
  0::bigint,
  'PUBLIC and API roles receive no game-context function privileges'
);

select ok(
  not has_function_privilege(
    'anon',
    'nightfold_private.append_game_context_record(text,timestamp with time zone,text,text,text)',
    'execute'
  ),
  'anonymous callers cannot execute the privileged append path'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'nightfold_private.append_game_context_record(text,timestamp with time zone,text,text,text)',
    'execute'
  ),
  'authenticated callers cannot execute the privileged append path'
);

select ok(
  not has_function_privilege(
    'anon',
    'nightfold_private.game_context_record_as_of(text,timestamp with time zone)',
    'execute'
  ),
  'anonymous callers cannot execute the as-of reader'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'nightfold_private.game_context_record_as_of(text,timestamp with time zone)',
    'execute'
  ),
  'authenticated callers cannot execute the as-of reader'
);

select ok(
  not has_function_privilege(
    'anon',
    'nightfold_private.current_game_context_record(text)',
    'execute'
  ),
  'anonymous callers cannot execute the current-context reader'
);

select ok(
  not has_function_privilege(
    'authenticated',
    'nightfold_private.current_game_context_record(text)',
    'execute'
  ),
  'authenticated callers cannot execute the current-context reader'
);

set local role anon;

select throws_ok(
  $$
    insert into public.game_context_records (game_id, effective_from)
    values ('soulframe', statement_timestamp())
  $$,
  '42501',
  'permission denied for table game_context_records',
  'anonymous callers cannot write directly to the game-context table'
);

reset role;
set local role authenticated;

select throws_ok(
  $$
    insert into public.game_context_records (game_id, effective_from)
    values ('soulframe', statement_timestamp())
  $$,
  '42501',
  'permission denied for table game_context_records',
  'authenticated callers cannot write directly to the game-context table'
);

reset role;

insert into public.creator_profiles (account_id, handle, display_name)
values (
  '00000000-0000-0000-0000-000000000001',
  'nightfold-owner',
  'Nightfold Owner'
);

create temporary table p0_fixture_states (
  key text primary key,
  state jsonb not null
) on commit drop;

insert into p0_fixture_states (key, state)
values
  (
    'v1',
    '{
      "schemaVersion": 1,
      "metadata": {
        "title": "Atomic Build v1",
        "summary": "First draft",
        "classifications": []
      },
      "blocks": [{
        "id": "stage-home",
        "type": "soulframe.build.stage",
        "schemaVersion": 1,
        "data": {
          "role": "home",
          "name": "Home",
          "planner": {
            "schemaVersion": 5,
            "name": "First Envoy",
            "virtues": {"courage": 12, "spirit": 11, "grace": 11},
            "affinitySources": {
              "envoyRank": 18,
              "pactArts": {"courage": 0, "spirit": 0, "grace": 0},
              "fables": {"shewolf": null, "wasteBear": null}
            },
            "equipment": {},
            "pact": {"itemId": null, "artAllocation": {}},
            "combatArts": {},
            "weaponEnhancements": {
              "mainHand": {"rune": null, "totems": [null, null, null, null]},
              "offHand": {"rune": null, "totems": [null, null, null, null]}
            }
          },
          "sharedSections": []
        }
      }]
    }'
  ),
  (
    'v2',
    '{
      "schemaVersion": 1,
      "metadata": {
        "title": "Atomic Build v2",
        "summary": "Second draft",
        "classifications": []
      },
      "blocks": [{
        "id": "stage-home",
        "type": "soulframe.build.stage",
        "schemaVersion": 1,
        "data": {
          "role": "home",
          "name": "Home",
          "planner": {
            "schemaVersion": 5,
            "name": "First Envoy",
            "virtues": {"courage": 12, "spirit": 11, "grace": 11},
            "affinitySources": {
              "envoyRank": 18,
              "pactArts": {"courage": 0, "spirit": 0, "grace": 0},
              "fables": {"shewolf": null, "wasteBear": null}
            },
            "equipment": {},
            "pact": {"itemId": null, "artAllocation": {}},
            "combatArts": {},
            "weaponEnhancements": {
              "mainHand": {"rune": null, "totems": [null, null, null, null]},
              "offHand": {"rune": null, "totems": [null, null, null, null]}
            }
          },
          "sharedSections": []
        }
      }]
    }'
  );

grant select on table p0_fixture_states to authenticated;

select ok(
  nightfold_private.publication_state_is_publishable(
    'soulframe.guide',
    '{
      "schemaVersion":1,
      "metadata":{"title":"Guide hierarchy","classifications":[]},
      "blocks":[
        {"id":"heading-2","type":"nightfold.heading","schemaVersion":1,"data":{"text":"Section","level":2}},
        {"id":"heading-3","type":"nightfold.heading","schemaVersion":1,"data":{"text":"Detail","level":3}}
      ]
    }'::jsonb
  ),
  'Guide headings begin at H2 beneath the page H1 and descend one level at a time'
);

select ok(
  not nightfold_private.publication_state_is_publishable(
    'soulframe.guide',
    '{
      "schemaVersion":1,
      "metadata":{"title":"Invalid guide hierarchy","classifications":[]},
      "blocks":[
        {"id":"heading-3","type":"nightfold.heading","schemaVersion":1,"data":{"text":"Skipped section","level":3}}
      ]
    }'::jsonb
  ),
  'Guide publishing rejects a first heading that skips the semantic H2 level'
);

select ok(
  nightfold_private.rich_text_document_is_valid(
    '[{
      "id":"paragraph-1",
      "type":"paragraph",
      "props":{"textColor":"default","backgroundColor":"default","textAlignment":"left"},
      "content":[
        {"type":"text","text":"Read ","styles":{"bold":true}},
        {"type":"link","href":"https://example.invalid","content":[
          {"type":"text","text":"more","styles":{"italic":true}}
        ]}
      ],
      "children":[{
        "id":"quote-1",
        "type":"quote",
        "props":{},
        "content":"Nested note",
        "children":[]
      },{
        "id":"numbered-1",
        "type":"numberedListItem",
        "props":{"start":2},
        "children":[{
          "id":"numbered-2",
          "type":"numberedListItem",
          "props":{"start":"3"}
        }]
      }]
    }]'::jsonb
  ),
  'restricted rich text accepts the complete allowlisted P0 BlockNote shape'
);

select ok(
  not nightfold_private.rich_text_document_is_valid(
    '[{"type":"paragraph","content":"Text","unknownBlockKey":true}]'::jsonb
  ),
  'restricted rich text rejects unknown block keys'
);

select ok(
  not nightfold_private.rich_text_document_is_valid(
    '[{"type":"paragraph","props":{"columns":2},"content":"Text"}]'::jsonb
  ),
  'restricted rich text rejects unknown block props'
);

select ok(
  not nightfold_private.rich_text_document_is_valid(
    '[{"type":"paragraph","content":[{"type":"text","text":"Text","styles":{},"marks":[]}]}]'::jsonb
  ),
  'restricted rich text rejects unknown inline-content keys'
);

select ok(
  not nightfold_private.rich_text_document_is_valid(
    '[{"type":"paragraph","content":[{"type":"link","href":"/safe","target":"_blank","content":[]}]}]'::jsonb
  ),
  'restricted rich text rejects unknown link keys'
);

select ok(
  not nightfold_private.rich_text_document_is_valid(
    '[{"type":"paragraph","content":[{"type":"text","text":"Text","styles":{"fontSize":"99px"}}]}]'::jsonb
  ),
  'restricted rich text rejects unknown inline style keys'
);

select ok(
  not nightfold_private.rich_text_document_is_valid(
    '[{"type":"paragraph","content":"Text","children":{"type":"quote"}}]'::jsonb
  ),
  'restricted rich text rejects malformed nested block collections'
);

insert into public.publications (
  id,
  owner_id,
  game_id,
  profile_id,
  slug
)
values (
  '10000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'soulframe',
  'soulframe.build',
  'atomic-build'
);

insert into public.publication_drafts (publication_id, state)
select
  '10000000-0000-0000-0000-000000000001',
  state
from p0_fixture_states
where key = 'v1';

-- The database publish boundary rejects malformed direct-RPC drafts before a
-- release can become public, even when TypeScript validation is bypassed.
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);
set local role authenticated;

select throws_ok(
  $$
    select public.save_publication_draft(
      '10000000-0000-0000-0000-000000000001',
      (select state #- '{metadata,classifications}' from p0_fixture_states where key = 'v1')
    )
  $$,
  'P0001',
  'publication state is not draft-safe for profile',
  'direct RPC saving rejects missing classifications required by the stored-draft mapper'
);

select throws_ok(
  $$
    select public.save_publication_draft(
      '10000000-0000-0000-0000-000000000001',
      (
        select jsonb_set(state, '{blocks,0,data,planner}', '{"schemaVersion":5}'::jsonb)
        from p0_fixture_states
        where key = 'v1'
      )
    )
  $$,
  'P0001',
  'publication state is not draft-safe for profile',
  'direct RPC saving rejects a shallow schema-v5 planner'
);

do $$
begin
  perform public.save_publication_draft(
    '10000000-0000-0000-0000-000000000001',
    (select state from p0_fixture_states where key = 'v1')
  );
end;
$$;

select lives_ok(
  $$
    select public.save_publication_draft(
      '10000000-0000-0000-0000-000000000001',
      '{"schemaVersion":1,"metadata":{"title":"","classifications":[]},"blocks":[]}'::jsonb
    )
  $$,
  'an incomplete but structurally safe draft remains saveable'
);

select throws_ok(
  $$ select public.publish_publication('10000000-0000-0000-0000-000000000001') $$,
  'P0001',
  'persisted publication draft does not meet minimum profile requirements',
  'an incomplete draft cannot cross the publish boundary'
);

select throws_ok(
  $$
    select public.save_publication_draft(
      '10000000-0000-0000-0000-000000000001',
      (select state from p0_fixture_states where key = 'v1') || '{"unknownStateKey":true}'::jsonb
    )
  $$,
  'P0001',
  'publication state is not draft-safe for profile',
  'direct RPC saving rejects unknown top-level state keys'
);

select throws_ok(
  $$
    select public.save_publication_draft(
      '10000000-0000-0000-0000-000000000001',
      (
        select jsonb_set(state, '{metadata,publisherId}', '"forbidden"'::jsonb)
        from p0_fixture_states where key = 'v1'
      )
    )
  $$,
  'P0001',
  'publication state is not draft-safe for profile',
  'direct RPC saving rejects publisher metadata'
);

select throws_ok(
  $$
    select public.save_publication_draft(
      '10000000-0000-0000-0000-000000000001',
      (
        select jsonb_set(state, '{metadata,sourcePublicationId}', '"forbidden"'::jsonb)
        from p0_fixture_states where key = 'v1'
      )
    )
  $$,
  'P0001',
  'publication state is not draft-safe for profile',
  'direct RPC saving rejects publication lineage metadata'
);

select throws_ok(
  $$
    select public.save_publication_draft(
      '10000000-0000-0000-0000-000000000001',
      (
        select jsonb_set(state, '{blocks,0,unknownBlockKey}', 'true'::jsonb)
        from p0_fixture_states where key = 'v1'
      )
    )
  $$,
  'P0001',
  'publication state is not draft-safe for profile',
  'direct RPC saving rejects unknown block keys'
);

select throws_ok(
  $$
    select public.save_publication_draft(
      '10000000-0000-0000-0000-000000000001',
      (
        select jsonb_set(state, '{blocks,0,data,sourceStageId}', '"forbidden"'::jsonb)
        from p0_fixture_states where key = 'v1'
      )
    )
  $$,
  'P0001',
  'publication state is not draft-safe for profile',
  'direct RPC saving rejects unknown stage-data and source-stage keys'
);

select throws_ok(
  $$
    select public.save_publication_draft(
      '10000000-0000-0000-0000-000000000001',
      (
        select jsonb_set(
          state,
          '{blocks,0,data,sharedSections}',
          '[{"id":"overview","blocks":[{"id":"deep-heading","type":"nightfold.heading","schemaVersion":1,"data":{"text":"Skipped level","level":4}}]}]'::jsonb
        ) from p0_fixture_states where key = 'v1'
      )
    )
  $$,
  'P0001',
  'publication state is not draft-safe for profile',
  'direct RPC saving rejects a skipped heading level under a Build stage'
);

select throws_ok(
  $$
    select public.create_publication(
      'soulframe',
      'soulframe.guide',
      'editor-heading-guide',
      '{
        "schemaVersion":1,
        "metadata":{"title":"","classifications":[]},
        "blocks":[{
          "id":"rich-text",
          "type":"nightfold.rich-text",
          "schemaVersion":1,
          "data":{"document":[{"type":"heading","content":[]}]}
        }]
      }'::jsonb
    )
  $$,
  'P0001',
  'publication state is not draft-safe for profile',
  'publication creation rejects heading nodes embedded inside rich text'
);

do $$
begin
  perform public.save_publication_draft(
    '10000000-0000-0000-0000-000000000001',
    (select state from p0_fixture_states where key = 'v1')
  );
end;
$$;

-- Planner-artifact owner CRUD and cross-account denial.
select lives_ok(
  $$
    insert into public.build_planner_artifacts (
      id, owner_id, game_id, name, schema_version, payload
    )
    select
      '20000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000001',
      'soulframe',
      'Cloud Frame',
      5,
      state #> '{blocks,0,data,planner}'
    from p0_fixture_states
    where key = 'v1'
  $$,
  'an authenticated owner can save a planner artifact'
);

select is(
  (select count(*)::bigint from public.build_planner_artifacts),
  1::bigint,
  'the owner can load their planner artifact'
);

select lives_ok(
  $$
    update public.build_planner_artifacts
    set name = 'Renamed Cloud Frame'
    where id = '20000000-0000-0000-0000-000000000001'
  $$,
  'the owner can rename their planner artifact'
);

select lives_ok(
  $$
    with retained as (
      insert into public.build_planner_artifacts (
        id, owner_id, game_id, name, schema_version, payload
      )
      select
        '20000000-0000-0000-0000-000000000002',
        '00000000-0000-0000-0000-000000000001',
        'soulframe',
        'Retained Cloud Frame',
        5,
        state #> '{blocks,0,data,planner}'
      from p0_fixture_states
      where key = 'v1'
      returning id
    )
    delete from public.build_planner_artifacts
    where id = '20000000-0000-0000-0000-000000000001'
      and exists (select 1 from retained)
  $$,
  'the owner can delete their planner artifact'
);

select throws_like(
  $$
    insert into public.build_planner_artifacts (
      owner_id, game_id, name, schema_version, payload
    )
    select
      '00000000-0000-0000-0000-000000000001',
      'othergame',
      'Cross-game Frame',
      5,
      state #> '{blocks,0,data,planner}'
    from p0_fixture_states
    where key = 'v1'
  $$,
  '%build_planner_artifacts_soulframe_payload%',
  'a planner artifact cannot be stored in another game bucket'
);

select throws_like(
  $$
    insert into public.build_planner_artifacts (
      owner_id, game_id, name, schema_version, payload
    ) values (
      '00000000-0000-0000-0000-000000000001',
      'soulframe',
      'Malformed Frame',
      5,
      '{"schemaVersion":5}'
    )
  $$,
  '%build_planner_artifacts_soulframe_payload%',
  'a malformed planner artifact is rejected at the authoritative database boundary'
);

select throws_like(
  $$
    insert into public.build_planner_artifacts (
      owner_id, game_id, name, schema_version, payload
    )
    select
      '00000000-0000-0000-0000-000000000001',
      'soulframe',
      'Metadata-bearing Frame',
      5,
      (state #> '{blocks,0,data,planner}') || '{"publisherId":"forbidden"}'::jsonb
    from p0_fixture_states
    where key = 'v1'
  $$,
  '%build_planner_artifacts_soulframe_payload%',
  'planner artifacts reject publisher and publication metadata'
);

select lives_ok(
  $$ select public.create_publication_checkpoint('10000000-0000-0000-0000-000000000001') $$,
  'the owner can create a private draft checkpoint'
);

select is(
  (
    select count(*)::bigint
    from public.publication_draft_checkpoints
    where publication_id = '10000000-0000-0000-0000-000000000001'
  ),
  1::bigint,
  'the owner can read checkpoint history'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000003","role":"authenticated"}',
  true
);
set local role authenticated;

select is(
  (select count(*)::bigint from public.build_planner_artifacts),
  0::bigint,
  'another account cannot read the owner artifact collection'
);

select throws_ok(
  $$
    insert into public.build_planner_artifacts (
      owner_id, game_id, name, schema_version, payload
    )
    select
      '00000000-0000-0000-0000-000000000001',
      'soulframe',
      'Impersonated Frame',
      5,
      state #> '{blocks,0,data,planner}'
    from p0_fixture_states
    where key = 'v1'
  $$,
  '42501',
  'new row violates row-level security policy for table "build_planner_artifacts"',
  'another account cannot save an artifact for the owner'
);

select results_eq(
  $$
    with changed as (
      update public.build_planner_artifacts
      set payload = payload
      where id = '20000000-0000-0000-0000-000000000002'
      returning id
    )
    select count(*)::bigint from changed
  $$,
  $$ values (0::bigint) $$,
  'another account cannot update the owner artifact'
);

select results_eq(
  $$
    with changed as (
      update public.build_planner_artifacts
      set name = 'Outsider Rename'
      where id = '20000000-0000-0000-0000-000000000002'
      returning id
    )
    select count(*)::bigint from changed
  $$,
  $$ values (0::bigint) $$,
  'another account cannot rename the owner artifact'
);

select results_eq(
  $$
    with removed as (
      delete from public.build_planner_artifacts
      where id = '20000000-0000-0000-0000-000000000002'
      returning id
    )
    select count(*)::bigint from removed
  $$,
  $$ values (0::bigint) $$,
  'another account cannot delete the owner artifact'
);

select is(
  (
    select count(*)::bigint
    from public.publication_draft_checkpoints
    where publication_id = '10000000-0000-0000-0000-000000000001'
  ),
  0::bigint,
  'another account cannot read checkpoint history'
);

select throws_ok(
  $$ select public.save_publication_draft('10000000-0000-0000-0000-000000000001', '{}'::jsonb) $$,
  'P0001',
  'publication not found',
  'another account cannot save the owner draft'
);

select throws_ok(
  $$ select public.create_publication_checkpoint('10000000-0000-0000-0000-000000000001') $$,
  'P0001',
  'publication not found',
  'another account cannot checkpoint the owner draft'
);

select throws_ok(
  $$ select public.recover_publication_draft('10000000-0000-0000-0000-000000000001', 'draft-checkpoint', '40000000-0000-0000-0000-000000000001') $$,
  'P0001',
  'publication not found',
  'another account cannot recover the owner draft'
);

select throws_ok(
  $$ select public.publish_publication('10000000-0000-0000-0000-000000000001') $$,
  'P0001',
  'publication not found',
  'another account cannot publish the owner publication'
);

select throws_ok(
  $$ select public.unpublish_publication('10000000-0000-0000-0000-000000000001') $$,
  'P0001',
  'publication not found',
  'another account cannot unpublish the owner publication'
);

select throws_ok(
  $$ select public.soft_delete_publication('10000000-0000-0000-0000-000000000001') $$,
  'P0001',
  'publication not found',
  'another account cannot delete the owner publication'
);

select throws_ok(
  $$ select public.restore_deleted_publication('10000000-0000-0000-0000-000000000001') $$,
  'P0001',
  'publication not found',
  'another account cannot restore the owner publication'
);

-- Drafts are private to their publication owner.
reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);
set local role authenticated;

select is(
  (
    select count(*)::bigint
    from public.publication_drafts
    where publication_id = '10000000-0000-0000-0000-000000000001'
  ),
  1::bigint,
  'the publication owner can read the private draft'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000003","role":"authenticated"}',
  true
);
set local role authenticated;

select is(
  (
    select count(*)::bigint
    from public.publication_drafts
    where publication_id = '10000000-0000-0000-0000-000000000001'
  ),
  0::bigint,
  'another account cannot read the private draft'
);

-- Publishing snapshots the persisted draft atomically; later saves cannot
-- mutate the immutable release, and anonymous readers see only the current one.
reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);
set local role authenticated;

select lives_ok(
  $$ select public.publish_publication('10000000-0000-0000-0000-000000000001') $$,
  'the owner can atomically publish the persisted v1 draft'
);

select ok(
  (
    select releases.state = drafts.state
      and publications.current_release_id = releases.id
    from public.publications
    join public.publication_drafts as drafts
      on drafts.publication_id = publications.id
    join public.publication_releases as releases
      on releases.publication_id = publications.id
     and releases.id = publications.current_release_id
    where publications.id = '10000000-0000-0000-0000-000000000001'
  ),
  'publish stores exactly the locked draft and advances the current release'
);

select is(
  (
    select release_number
    from public.publication_releases
    where publication_id = '10000000-0000-0000-0000-000000000001'
  ),
  1::bigint,
  'the first immutable release receives internal lifecycle number one'
);

select lives_ok(
  format(
    'select public.save_publication_draft(%L, %L::jsonb)',
    '10000000-0000-0000-0000-000000000001',
    (select state::text from p0_fixture_states where key = 'v2')
  ),
  'the owner can save a v2 draft without mutating v1'
);

select lives_ok(
  $$ select public.publish_publication('10000000-0000-0000-0000-000000000001') $$,
  'the owner can publish v2 as a second immutable release'
);

select is(
  (
    select count(*)::bigint
    from public.publication_releases
    where publication_id = '10000000-0000-0000-0000-000000000001'
  ),
  2::bigint,
  'the owner can read both retained releases'
);

reset role;

select throws_ok(
  $$
    update public.publication_releases
    set state = jsonb_set(state, '{metadata,title}', '"Mutated"')
    where publication_id = '10000000-0000-0000-0000-000000000001'
  $$,
  'P0001',
  'publication releases are immutable',
  'a retained release cannot be mutated even by a privileged database actor'
);

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000003","role":"authenticated"}',
  true
);
set local role authenticated;

select is(
  (
    select count(*)::bigint
    from public.publication_releases
    where publication_id = '10000000-0000-0000-0000-000000000001'
  ),
  1::bigint,
  'another authenticated account sees only the current release, not release history'
);

reset role;

select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;

select ok(
  not has_column_privilege(
    'anon',
    'public.publication_releases',
    'release_number',
    'select'
  ),
  'anonymous readers cannot select the internal release number'
);

select is(
  (
    select state #>> '{metadata,title}'
    from public.publication_releases
    where publication_id = '10000000-0000-0000-0000-000000000001'
  ),
  'Atomic Build v2',
  'the anonymous release is the current v2 snapshot'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);
set local role authenticated;

select lives_ok(
  $$ select public.unpublish_publication('10000000-0000-0000-0000-000000000001') $$,
  'the owner can unpublish without deleting retained releases'
);

reset role;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;

select is(
  (
    select count(*)::bigint
    from public.publication_releases
    where publication_id = '10000000-0000-0000-0000-000000000001'
  ),
  0::bigint,
  'unpublishing removes every release from anonymous reads'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);
set local role authenticated;

select lives_ok(
  $$ select public.publish_publication('10000000-0000-0000-0000-000000000001') $$,
  'the owner can republish the persisted draft after unpublishing'
);

do $$
declare
  v_index integer;
  v_state jsonb;
begin
  for v_index in 1..21 loop
    select jsonb_set(
      state,
      '{metadata,title}',
      to_jsonb(format('Retention Build %s', v_index))
    )
    into strict v_state
    from p0_fixture_states
    where key = 'v2';

    perform public.save_publication_draft(
      '10000000-0000-0000-0000-000000000001',
      v_state
    );
    perform public.create_publication_checkpoint(
      '10000000-0000-0000-0000-000000000001'
    );
    perform public.publish_publication(
      '10000000-0000-0000-0000-000000000001'
    );
  end loop;
end;
$$;

select is(
  (
    select count(*)::bigint
    from public.publication_draft_checkpoints
    where publication_id = '10000000-0000-0000-0000-000000000001'
  ),
  20::bigint,
  'draft checkpoint retention is bounded to the latest 20 distinct saves'
);

select is(
  (
    select count(*)::bigint
    from public.publication_releases
    where publication_id = '10000000-0000-0000-0000-000000000001'
  ),
  20::bigint,
  'published release retention is bounded to the latest 20 releases'
);

-- Voting is account-scoped, rejects self-votes, and toggles one durable row.
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);
set local role authenticated;

select throws_ok(
  $$
    insert into public.publication_votes (publication_id, voter_id)
    values (
      '10000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000001'
    )
  $$,
  '42501',
  'permission denied for table publication_votes',
  'the direct table surface cannot bypass the self-vote RPC guard'
);

select throws_ok(
  $$ select * from public.toggle_publication_vote('10000000-0000-0000-0000-000000000001') $$,
  'P0001',
  'publication owners cannot vote for their own publications',
  'a publication owner cannot self-vote'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000002","role":"authenticated"}',
  true
);
set local role authenticated;

select results_eq(
  $$ select active, vote_count from public.toggle_publication_vote('10000000-0000-0000-0000-000000000001') $$,
  $$ values (true, 1::bigint) $$,
  'the first toggle creates one vote'
);

select results_eq(
  $$ select active, vote_count from public.toggle_publication_vote('10000000-0000-0000-0000-000000000001') $$,
  $$ values (false, 0::bigint) $$,
  'the second toggle removes the vote'
);

select results_eq(
  $$ select active, vote_count from public.toggle_publication_vote('10000000-0000-0000-0000-000000000001') $$,
  $$ values (true, 1::bigint) $$,
  'a third toggle restores exactly one vote'
);

select is(
  (
    select count(*)::bigint
    from public.publication_votes
    where publication_id = '10000000-0000-0000-0000-000000000001'
      and voter_id = '00000000-0000-0000-0000-000000000002'
  ),
  1::bigint,
  'the durable publication-voter key prevents duplicate active votes'
);

-- Deterministic published fixtures exercise all three orders without relying
-- on wall-clock time.
reset role;
set constraints publications_current_release_same_publication_fk deferred;

insert into public.publications (
  id, owner_id, game_id, profile_id, slug, status, current_release_id,
  first_published_at, latest_published_at, is_valid, vote_count
)
values
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000001',
    'soulframe', 'soulframe.build', 'top-build', 'published',
    '30000000-0000-0000-0000-000000000002',
    '2026-07-28 12:00:00+00', '2026-08-01 12:00:00+00', true, 9
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000001',
    'soulframe', 'soulframe.build', 'trending-build', 'published',
    '30000000-0000-0000-0000-000000000003',
    '2026-08-06 12:00:00+00', '2026-08-06 12:00:00+00', true, 1
  );

insert into public.publication_releases (
  id, publication_id, release_number, state, is_valid, published_at
)
select
  fixture.release_id,
  fixture.publication_id,
  1,
  jsonb_set(state, '{metadata,title}', to_jsonb(fixture.title)),
  true,
  fixture.published_at
from p0_fixture_states
cross join (
  values
    (
      '30000000-0000-0000-0000-000000000002'::uuid,
      '10000000-0000-0000-0000-000000000002'::uuid,
      'Top Build'::text,
      '2026-08-01 12:00:00+00'::timestamptz
    ),
    (
      '30000000-0000-0000-0000-000000000003'::uuid,
      '10000000-0000-0000-0000-000000000003'::uuid,
      'Trending Build'::text,
      '2026-08-06 12:00:00+00'::timestamptz
    )
) as fixture(release_id, publication_id, title, published_at)
where p0_fixture_states.key = 'v2';

set constraints publications_current_release_same_publication_fk immediate;

update public.publications
set first_published_at = '2026-07-18 12:00:00+00',
    latest_published_at = '2026-07-20 12:00:00+00'
where id = '10000000-0000-0000-0000-000000000001';

update public.publication_votes
set created_at = '2026-08-04 12:00:00+00'
where publication_id = '10000000-0000-0000-0000-000000000001';

insert into public.publication_votes (publication_id, voter_id, created_at)
values
  (
    '10000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000002',
    '2026-08-01 12:00:00+00'
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000002',
    '2026-08-07 11:00:00+00'
  );

select results_eq(
  $$
    select slug
    from nightfold_private.discover_publications_ranked(
      'soulframe', 'soulframe.build', 'trending', 1, 0,
      '2026-08-07 12:00:00+00', interval '7 days', 72
    )
  $$,
  $$ values ('trending-build'::text) $$,
  'Trending prioritizes the strongest recent vote signal'
);

select results_eq(
  $$
    select slug
    from nightfold_private.discover_publications_ranked(
      'soulframe', 'soulframe.build', 'top', 1, 0,
      '2026-08-07 12:00:00+00', interval '7 days', 72
    )
  $$,
  $$ values ('top-build'::text) $$,
  'Top prioritizes total vote count'
);

select results_eq(
  $$
    select slug
    from nightfold_private.discover_publications_ranked(
      'soulframe', 'soulframe.build', 'new', 1, 0,
      '2026-08-07 12:00:00+00', interval '7 days', 72
    )
  $$,
  $$ values ('trending-build'::text) $$,
  'New prioritizes first publication time'
);

select ok(
  not has_function_privilege(
    'anon',
    'nightfold_private.discover_publications_ranked(text,text,text,integer,integer,timestamp with time zone,interval,numeric)',
    'execute'
  ),
  'anonymous callers cannot execute the internal discovery policy function'
);

select results_eq(
  $$
    select trending_window, trending_decay_hours, max_discovery_offset
    from nightfold_private.publication_operational_policy
    where singleton
  $$,
  $$ values (interval '7 days', 72::numeric, 10000) $$,
  'the operational trending and pagination policy is configured in private data'
);

select ok(
  not has_table_privilege(
    'anon',
    'nightfold_private.publication_operational_policy',
    'select'
  ),
  'anonymous callers cannot read the private operational policy table'
);

update nightfold_private.publication_operational_policy
set max_discovery_offset = 3
where singleton;

set local role anon;

select throws_ok(
  $$
    select *
    from public.discover_publications(
      'soulframe', 'soulframe.build', 'top', 20, 4
    )
  $$,
  'P0001',
  'discovery pagination is out of range',
  'the anonymous discovery surface enforces the configured offset bound'
);

reset role;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);
set local role authenticated;

select lives_ok(
  $$ select public.soft_delete_publication('10000000-0000-0000-0000-000000000001') $$,
  'the owner can soft-delete a publication into the recovery window'
);

reset role;
select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;

select is(
  (
    select count(*)::bigint
    from public.publication_releases
    where publication_id = '10000000-0000-0000-0000-000000000001'
  ),
  0::bigint,
  'a deleted publication exposes no release to anonymous readers'
);

reset role;
update public.publications
set deleted_at = '2026-01-01 00:00:00+00',
    recoverable_until = '2026-01-02 00:00:00+00'
where id = '10000000-0000-0000-0000-000000000001';

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);
set local role authenticated;

select throws_ok(
  $$ select public.restore_deleted_publication('10000000-0000-0000-0000-000000000001') $$,
  'P0001',
  'publication recovery window has expired',
  'the owner cannot restore a publication after its recovery window expires'
);

reset role;
update public.publications
set deleted_at = statement_timestamp(),
    recoverable_until = statement_timestamp() + interval '1 day'
where id = '10000000-0000-0000-0000-000000000001';

select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}',
  true
);
set local role authenticated;

select results_eq(
  $$
    select status
    from public.restore_deleted_publication(
      '10000000-0000-0000-0000-000000000001'
    )
  $$,
  $$ values ('unpublished'::text) $$,
  'the owner can restore a deleted publication within its recovery window'
);

reset role;
select * from finish();
rollback;
