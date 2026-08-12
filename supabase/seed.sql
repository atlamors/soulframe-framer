-- Stable lookup keys only. Public Publications must be authored through the
-- product workflow; this seed intentionally contains no account or page fixture.

insert into public.games (id, display_name)
values ('soulframe', 'Soulframe')
on conflict (id) do nothing;

insert into public.publication_profile_keys (id, game_id)
values
  ('soulframe.build', 'soulframe'),
  ('soulframe.guide', 'soulframe')
on conflict (id) do nothing;
