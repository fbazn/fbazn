# FBAZN Supabase Auth Email Templates

Copy the HTML from each file into Supabase Dashboard > Authentication > Emails.

Recommended Supabase URL configuration:

- Site URL: `https://app.fbazn.com`
- Redirect URLs:
  - `https://app.fbazn.com/auth/callback`
  - `https://app.fbazn.com/auth/confirm`
  - `https://app.fbazn.com/auth/reset`
  - `https://app.fbazn.com/**`

Recommended subjects:

- Confirm sign up: `Confirm your FBAZN account`
- Invite user: `You have been invited to FBAZN`
- Magic link: `Your FBAZN sign-in link`
- Change email address: `Confirm your new FBAZN email address`
- Reset password: `Reset your FBAZN password`
- Reauthentication: `Your FBAZN verification code`

The templates use Supabase variables documented by Supabase, including `{{ .TokenHash }}`, `{{ .RedirectTo }}`, `{{ .ConfirmationURL }}`, `{{ .Email }}`, `{{ .NewEmail }}`, and `{{ .Token }}`.

Do not enable click tracking or link rewriting on the auth email provider. Supabase warns that rewritten links can break auth email flows.
