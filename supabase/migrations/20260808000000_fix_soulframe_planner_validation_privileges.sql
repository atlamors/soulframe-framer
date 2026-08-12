-- The artifact check constraint invokes this validator during authenticated
-- inserts. Keep its helper chain private by running the wrapper as its owner,
-- while granting API roles only the execution privilege the constraint needs.
alter function nightfold_private.soulframe_planner_is_valid(jsonb)
  security definer;

revoke all on function nightfold_private.soulframe_planner_is_valid(jsonb)
  from public, anon, authenticated, service_role;

grant execute on function nightfold_private.soulframe_planner_is_valid(jsonb)
  to authenticated, service_role;
