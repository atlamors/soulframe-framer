-- Preserve the exact v5 validator before the public entry point becomes a
-- version dispatcher. pg_get_functiondef keeps the already-deployed v5 rules
-- byte-for-byte instead of restating them in a second migration.
do $migration$
declare
  v_definition text;
begin
  if to_regprocedure(
    'nightfold_private.soulframe_planner_v5_is_valid(jsonb)'
  ) is null then
    select pg_get_functiondef(
      'nightfold_private.soulframe_planner_is_valid(jsonb)'::regprocedure
    ) into v_definition;

    execute replace(
      v_definition,
      'nightfold_private.soulframe_planner_is_valid',
      'nightfold_private.soulframe_planner_v5_is_valid'
    );
  end if;
end;
$migration$;

create function nightfold_private.weapon_enhancements_v6_are_valid(
  p_value jsonb
)
returns boolean
language sql
immutable
strict
set search_path = pg_catalog, nightfold_private
as $$
  select
    jsonb_typeof(p_value) = 'object'
    and p_value ?& array[
      'rune', 'totems', 'craftwork', 'tempers', 'joineryId'
    ]
    and not exists (
      select 1
      from jsonb_object_keys(
        case when jsonb_typeof(p_value) = 'object' then p_value else '{}'::jsonb end
      ) as property(key)
      where property.key not in (
        'rune', 'totems', 'craftwork', 'tempers', 'joineryId'
      )
    )
    and nightfold_private.weapon_enhancements_are_valid(
      jsonb_build_object(
        'rune', p_value -> 'rune',
        'totems', p_value -> 'totems'
      )
    )
    and p_value ->> 'craftwork' in (
      'Stock', 'Military', 'Officer', 'Noble', 'Sovereign', 'Legendary'
    )
    and jsonb_typeof(p_value -> 'tempers') = 'array'
    and jsonb_array_length(
      case
        when jsonb_typeof(p_value -> 'tempers') = 'array'
          then p_value -> 'tempers'
        else '[]'::jsonb
      end
    ) <= case p_value ->> 'craftwork'
      when 'Stock' then 1
      when 'Military' then 3
      when 'Officer' then 4
      when 'Noble' then 5
      when 'Sovereign' then 6
      when 'Legendary' then 8
      else -1
    end
    and not exists (
      select 1
      from jsonb_array_elements(
        case
          when jsonb_typeof(p_value -> 'tempers') = 'array'
            then p_value -> 'tempers'
          else '[]'::jsonb
        end
      ) as temper(value)
      where jsonb_typeof(temper.value) <> 'string'
        or length(temper.value #>> '{}') not between 1 and 120
    )
    and not exists (
      select 1
      from jsonb_array_elements_text(
        case
          when jsonb_typeof(p_value -> 'tempers') = 'array'
            then p_value -> 'tempers'
          else '[]'::jsonb
        end
      ) as temper(id)
      group by temper.id
      having count(*) > 2
    )
    and (
      p_value -> 'joineryId' = 'null'::jsonb
      or (
        jsonb_typeof(p_value -> 'joineryId') = 'string'
        and length(p_value ->> 'joineryId') between 1 and 120
      )
    );
$$;

create function nightfold_private.soulframe_planner_v6_is_valid(
  p_planner jsonb
)
returns boolean
language sql
immutable
strict
set search_path = pg_catalog, nightfold_private
as $$
  select
    jsonb_typeof(p_planner) = 'object'
    and p_planner @> '{"schemaVersion": 6}'::jsonb
    and jsonb_typeof(p_planner -> 'weaponEnhancements') = 'object'
    and nightfold_private.jsonb_object_has_only_keys(
      p_planner -> 'weaponEnhancements', array['mainHand', 'offHand']
    )
    and nightfold_private.weapon_enhancements_v6_are_valid(
      p_planner #> '{weaponEnhancements,mainHand}'
    )
    and nightfold_private.weapon_enhancements_v6_are_valid(
      p_planner #> '{weaponEnhancements,offHand}'
    )
    and nightfold_private.soulframe_planner_v5_is_valid(
      jsonb_set(
        jsonb_set(
          jsonb_set(
            p_planner,
            '{schemaVersion}',
            '5'::jsonb,
            false
          ),
          '{weaponEnhancements,mainHand}',
          (p_planner #> '{weaponEnhancements,mainHand}')
            - 'craftwork' - 'tempers' - 'joineryId',
          false
        ),
        '{weaponEnhancements,offHand}',
        (p_planner #> '{weaponEnhancements,offHand}')
          - 'craftwork' - 'tempers' - 'joineryId',
        false
      )
    );
$$;

create or replace function nightfold_private.soulframe_planner_is_valid(
  p_planner jsonb
)
returns boolean
language sql
immutable
strict
security definer
set search_path = pg_catalog, nightfold_private
as $$
  select case
    when p_planner -> 'schemaVersion' = '5'::jsonb then
      nightfold_private.soulframe_planner_v5_is_valid(p_planner)
    when p_planner -> 'schemaVersion' = '6'::jsonb then
      nightfold_private.soulframe_planner_v6_is_valid(p_planner)
    else false
  end;
$$;

alter table public.build_planner_artifacts
  drop constraint build_planner_artifacts_soulframe_payload;

alter table public.build_planner_artifacts
  add constraint build_planner_artifacts_soulframe_payload check (
    game_id = 'soulframe'
    and schema_version in (5, 6)
    and payload @> jsonb_build_object('schemaVersion', schema_version)
    and nightfold_private.soulframe_planner_is_valid(payload)
  );

revoke all on function
  nightfold_private.weapon_enhancements_v6_are_valid(jsonb),
  nightfold_private.soulframe_planner_v5_is_valid(jsonb),
  nightfold_private.soulframe_planner_v6_is_valid(jsonb)
from public, anon, authenticated, service_role;

revoke all on function nightfold_private.soulframe_planner_is_valid(jsonb)
from public, anon, authenticated, service_role;

grant execute on function nightfold_private.soulframe_planner_is_valid(jsonb)
to authenticated, service_role;
