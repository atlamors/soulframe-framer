begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pg_catalog;

select plan(10);

create temporary table frame_schema_fixtures (
  version integer primary key,
  payload jsonb not null
) on commit drop;

insert into frame_schema_fixtures (version, payload)
values
  (
    5,
    '{
      "schemaVersion":5,
      "name":"Stored Frame",
      "virtues":{"courage":12,"spirit":11,"grace":11},
      "affinitySources":{
        "envoyRank":18,
        "pactArts":{"courage":0,"spirit":0,"grace":0},
        "fables":{"shewolf":null,"wasteBear":null}
      },
      "equipment":{},
      "pact":{"itemId":null,"artAllocation":{}},
      "combatArts":{},
      "weaponEnhancements":{
        "mainHand":{"rune":null,"totems":[null,null,null,null]},
        "offHand":{"rune":null,"totems":[null,null,null,null]}
      }
    }'::jsonb
  ),
  (
    6,
    '{
      "schemaVersion":6,
      "name":"Current Frame",
      "virtues":{"courage":12,"spirit":11,"grace":11},
      "affinitySources":{
        "envoyRank":18,
        "pactArts":{"courage":0,"spirit":0,"grace":0},
        "fables":{"shewolf":null,"wasteBear":null}
      },
      "equipment":{},
      "pact":{"itemId":null,"artAllocation":{}},
      "combatArts":{},
      "weaponEnhancements":{
        "mainHand":{
          "rune":null,
          "totems":[null,null,null,null],
          "craftwork":"Stock",
          "tempers":[],
          "joineryId":null
        },
        "offHand":{
          "rune":null,
          "totems":[null,null,null,null],
          "craftwork":"Stock",
          "tempers":[],
          "joineryId":null
        }
      }
    }'::jsonb
  );

select ok(
  nightfold_private.soulframe_planner_is_valid(
    (select payload from frame_schema_fixtures where version = 5)
  ),
  'schema-v5 Frames remain valid'
);

select ok(
  nightfold_private.soulframe_planner_is_valid(
    (select payload from frame_schema_fixtures where version = 6)
  ),
  'schema-v6 Frames are valid'
);

select ok(
  nightfold_private.soulframe_planner_is_valid(
    jsonb_set(
      (select payload from frame_schema_fixtures where version = 6),
      '{weaponEnhancements,mainHand,craftwork}',
      '"Military"'::jsonb
    )
  ),
  'a below-minimum Craftwork configuration remains editable and valid'
);

select ok(
  not nightfold_private.soulframe_planner_is_valid(
    jsonb_set(
      (select payload from frame_schema_fixtures where version = 6),
      '{weaponEnhancements,mainHand,tempers}',
      '["Temper A","Temper B"]'::jsonb
    )
  ),
  'a Temper selection over the Craftwork maximum is rejected'
);

select ok(
  not nightfold_private.soulframe_planner_is_valid(
    jsonb_set(
      jsonb_set(
        (select payload from frame_schema_fixtures where version = 6),
        '{weaponEnhancements,mainHand,craftwork}',
        '"Legendary"'::jsonb
      ),
      '{weaponEnhancements,mainHand,tempers}',
      '["Temper A","Temper A","Temper A"]'::jsonb
    )
  ),
  'a third occurrence of the same Temper is rejected'
);

select ok(
  not nightfold_private.soulframe_planner_is_valid(
    jsonb_set(
      (select payload from frame_schema_fixtures where version = 6),
      '{weaponEnhancements,mainHand,unknown}',
      'true'::jsonb
    )
  ),
  'unknown enhancement fields are rejected'
);

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
values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000006',
  'authenticated',
  'authenticated',
  'frame-v6@example.invalid',
  '',
  '2026-08-13 00:00:00+00',
  '{"provider":"email","providers":["email"]}',
  '{"name":"Frame v6"}',
  '2026-08-13 00:00:00+00',
  '2026-08-13 00:00:00+00',
  '',
  '',
  '',
  ''
);

select lives_ok(
  $$
    insert into public.build_planner_artifacts (
      owner_id, game_id, name, schema_version, payload
    ) values (
      '00000000-0000-0000-0000-000000000006',
      'soulframe',
      'Stored v5',
      5,
      (select payload from frame_schema_fixtures where version = 5)
    )
  $$,
  'the artifact boundary preserves stored schema-v5 Frames'
);

select lives_ok(
  $$
    insert into public.build_planner_artifacts (
      owner_id, game_id, name, schema_version, payload
    ) values (
      '00000000-0000-0000-0000-000000000006',
      'soulframe',
      'Stored v6',
      6,
      (select payload from frame_schema_fixtures where version = 6)
    )
  $$,
  'the artifact boundary accepts schema-v6 Frames'
);

select throws_like(
  $$
    insert into public.build_planner_artifacts (
      owner_id, game_id, name, schema_version, payload
    ) values (
      '00000000-0000-0000-0000-000000000006',
      'soulframe',
      'Mismatched Frame',
      5,
      (select payload from frame_schema_fixtures where version = 6)
    )
  $$,
  '%build_planner_artifacts_soulframe_payload%',
  'the artifact schema column must match the payload version'
);

select throws_like(
  $$
    insert into public.build_planner_artifacts (
      owner_id, game_id, name, schema_version, payload
    ) values (
      '00000000-0000-0000-0000-000000000006',
      'soulframe',
      'Over-capacity Frame',
      6,
      jsonb_set(
        (select payload from frame_schema_fixtures where version = 6),
        '{weaponEnhancements,mainHand,tempers}',
        '["Temper A","Temper B"]'::jsonb
      )
    )
  $$,
  '%build_planner_artifacts_soulframe_payload%',
  'the artifact boundary rejects invalid schema-v6 enhancements'
);

select * from finish();
rollback;
