-- MadLease, file 4 of 6: only @wisc.edu addresses can sign up.
--
-- Supabase calls this function just before it creates a new user. Returning an
-- empty object lets the sign-up through; returning an "error" object stops it
-- and sends the message back to the browser.
--
-- This is the real check. The sign-in page also looks at the address, but only
-- to show a friendly message sooner: anyone can skip our page and call
-- Supabase directly with the public key, and this function still says no.
--
-- After running this file, turn the hook on in the dashboard:
--   Authentication -> Hooks -> Before User Created -> Postgres function
--   -> public.hook_wisc_only
-- Until that is done, the function exists but nothing calls it.

create or replace function public.hook_wisc_only(event jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  email text;
  domain text;
begin
  email := lower(coalesce(event -> 'user' ->> 'email', ''));
  -- Everything after the @. Exactly "wisc.edu" passes; "cs.wisc.edu" and
  -- "wisc.edu.example.com" do not.
  domain := split_part(email, '@', 2);

  if domain = 'wisc.edu' then
    return '{}'::jsonb;
  end if;

  return jsonb_build_object(
    'error', jsonb_build_object(
      'http_code', 403,
      'message', 'Use your @wisc.edu email to sign up.'
    )
  );
end;
$$;

-- Only Supabase's auth service may call it. Without the revoke, anyone could
-- run it through the API, which is harmless here but not something to expose.
grant usage on schema public to supabase_auth_admin;
grant execute on function public.hook_wisc_only(jsonb) to supabase_auth_admin;
revoke execute on function public.hook_wisc_only(jsonb) from authenticated, anon, public;
