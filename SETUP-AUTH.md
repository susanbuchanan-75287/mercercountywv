# Board Portal — sign-in providers setup

The admin console (`/admin.html`) is protected by Azure Static Web Apps authentication.
Four sign-in options are wired in `portal.html` + `staticwebapp.config.json`:

| Button | Provider | Works out of the box? | What you must configure |
|--------|----------|-----------------------|-------------------------|
| Microsoft | `aad` (Entra ID) | ✅ Yes (SWA built-in) | Nothing |
| GitHub | `github` | ✅ Yes (SWA built-in) | Nothing |
| Google | `google` (pre-configured) | ⚠️ After secrets | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` app settings |
| Email & password | `emailpassword` (custom OIDC) | ⚠️ After tenant + secrets | External identity tenant + 3 app settings |

> Adding these provider blocks is deploy-safe: Azure only contacts the provider at
> **login time**, not at deploy. Microsoft + GitHub keep working regardless.

## 1. Google sign-in
1. Google Cloud Console → **APIs & Services → Credentials → OAuth client ID** (Web application).
2. Authorized redirect URI: `https://<your-swa-host>/.auth/login/google/callback`
3. In the Azure Portal → your Static Web App → **Configuration → Application settings**, add:
   - `GOOGLE_CLIENT_ID` = the OAuth client ID
   - `GOOGLE_CLIENT_SECRET` = the OAuth client secret
4. Save. The **Sign in with Google** button now works.

## 2. Email & password (self-service, with password reset)
Static Web Apps has no built-in password store. Email/password + "Forgot password?"
is delivered by a custom OpenID Connect provider — use **Microsoft Entra External ID**
(CIAM) or **Auth0**, both of which bundle email/password sign-up, social logins and
self-service password reset in one hosted flow.

Requires the SWA **Standard** plan (custom OIDC providers are not on Free).

1. Create an Entra External ID tenant (or Auth0 tenant) with an email/password user flow
   that has **self-service password reset** enabled.
2. Register a web app; redirect URI: `https://<your-swa-host>/.auth/login/emailpassword/callback`
3. Copy the OpenID metadata URL, client id and secret.
4. In the SWA **Application settings**, add:
   - `EMAILPWD_CLIENT_ID` = the app (client) ID
   - `EMAILPWD_CLIENT_SECRET` = the client secret
5. Edit `staticwebapp.config.json` → `auth.identityProviders.customOpenIdConnectProviders.emailpassword.registration.openIdConnectConfiguration.wellKnownOpenIdConfiguration`
   and replace the `https://EMAILPWD_ISSUER/.well-known/openid-configuration` placeholder
   with your real metadata URL, e.g.
   `https://mercer.ciamlogin.com/<tenant-id>/v2.0/.well-known/openid-configuration`.
   (Only the client id/secret are read from app settings; the issuer URL is literal in config.)
6. Commit + redeploy. The **email & password** and **Forgot your password?** links now work.

## 3. Granting roles (who can use the console)
Access is gated to the `admin` and `commissioner` roles. After a user signs in once,
invite them in the Azure Portal → Static Web App → **Role management → Invite**, choose
their provider, and assign `commissioner` (or `admin`). The API (`api/shared/store.js`)
reads these roles from the `x-ms-client-principal` header on every write.
