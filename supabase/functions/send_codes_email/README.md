# send_codes_email

Supabase Edge Function used by the Calendar Created screen to email the three access codes.

## Required secrets

Set these in your Supabase project:

- `RESEND_API_KEY` (required when `EMAIL_ENABLED=true`)
- `RESEND_FROM_EMAIL` (optional, defaults to `Kaleenda <noreply@kaleenda.app>`)
- `EMAIL_ENABLED` (`true`/`false`, defaults to `false`)

When `EMAIL_ENABLED=false`, the function logs only redacted metadata and returns success (`{ ok: true, skipped: true }`) without calling Resend.

## Deploy

```bash
supabase functions deploy send_codes_email
```

## Local serve

```bash
supabase functions serve send_codes_email --env-file .env.local
```
