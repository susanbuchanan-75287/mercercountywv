# Board Portal — sign-in providers setup

The admin console (`/admin.html`) is protected by Azure Static Web Apps authentication.

## What works right now (Free plan)
| Button | Provider | Status |
|--------|----------|--------|
| Microsoft | `aad` (Entra ID) | ✅ Working — SWA built-in, no config |
| GitHub | `github` | ✅ Working — SWA built-in, no config |

Microsoft and GitHub are the two built-in providers and need nothing configured.

## ⚠️ Google + email & password require the Standard plan
Custom identity providers (Google, and email/password via OpenID Connect) use the
`auth` block in `staticwebapp.config.json`, which **is only supported on the SWA
Standard SKU**. Adding it while on the Free SKU **fails the deploy** with:

> "The 'auth' configuration in staticwebapp.config.json is only supported on the
> Standard SKU."

So the `auth` block and the Google/email buttons are intentionally **not** in the live
config. To enable them:

### Step 1 — upgrade the Static Web App to Standard
Azure Portal → your Static Web App → **Hosting plan** → select **Standard** (approx.
$9/month). No redeploy needed for the upgrade itself.

### Step 2 — add this `auth` block to `staticwebapp.config.json`
Insert immediately after the `"routes": [ ... ]` array, and add the two login routes
inside `routes` (shown first):

```jsonc
// add inside "routes":
{ "route": "/.auth/login/google", "allowedRoles": ["anonymous"] },
{ "route": "/.auth/login/emailpassword", "allowedRoles": ["anonymous"] }

// add as a top-level sibling of "routes":
"auth": {
  "identityProviders": {
    "google": {
      "registration": {
        "clientIdSettingName": "GOOGLE_CLIENT_ID",
        "clientSecretSettingName": "GOOGLE_CLIENT_SECRET"
      }
    },
    "customOpenIdConnectProviders": {
      "emailpassword": {
        "registration": {
          "clientIdSettingName": "EMAILPWD_CLIENT_ID",
          "clientCredential": { "clientSecretSettingName": "EMAILPWD_CLIENT_SECRET" },
          "openIdConnectConfiguration": {
            "wellKnownOpenIdConfiguration": "https://<your-issuer>/.well-known/openid-configuration"
          }
        },
        "login": {
          "nameClaimType": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
          "scopes": ["openid", "profile", "email"]
        }
      }
    }
  }
}
```

### Step 3 — add the sign-in buttons back to the portal
In `build/build.mjs` (the `portal.html` template, ~line 644) add:

```html
<a class="btn btn-ghost" href="/.auth/login/google?post_login_redirect_uri=/admin.html">Sign in with Google</a>
<a class="btn btn-ghost" href="/.auth/login/emailpassword?post_login_redirect_uri=/admin.html">Sign in with email &amp; password</a>
```
Then rebuild (`node build/build.mjs`) and push.

## Google credentials (needed for step 2's app settings)
1. Google Cloud Console → **APIs & Services → Credentials → OAuth client ID** (Web application).
2. Authorized redirect URI: `https://<your-swa-host>/.auth/login/google/callback`
3. Azure Portal → Static Web App → **Configuration → Application settings**, add:
   - `GOOGLE_CLIENT_ID` = the OAuth client ID
   - `GOOGLE_CLIENT_SECRET` = the OAuth client secret

## Email & password (self-service, with password reset)
Static Web Apps has no built-in password store. Email/password + "Forgot password?"
is delivered by a custom OpenID Connect provider — use **Microsoft Entra External ID**
(CIAM) or **Auth0**, both of which bundle email/password sign-up, social logins and
self-service password reset in one hosted flow.

1. Create an Entra External ID (or Auth0) tenant with an email/password user flow that
   has **self-service password reset** enabled.
2. Register a web app; redirect URI: `https://<your-swa-host>/.auth/login/emailpassword/callback`
3. Azure Portal → Static Web App → **Application settings**, add:
   - `EMAILPWD_CLIENT_ID` = the app (client) ID
   - `EMAILPWD_CLIENT_SECRET` = the client secret
4. Replace `https://<your-issuer>/.well-known/openid-configuration` in the `auth` block
   above with your real metadata URL, e.g.
   `https://mercer.ciamlogin.com/<tenant-id>/v2.0/.well-known/openid-configuration`.
   (Only the client id/secret come from app settings; the issuer URL is literal.)
5. Commit + redeploy. Email & password and the reset flow now work.

## Granting roles (who can use the console)
Access is gated to the `admin` and `commissioner` roles. After a user signs in once,
invite them in the Azure Portal → Static Web App → **Role management → Invite**, choose
their provider, and assign `commissioner` (or `admin`). The API (`api/shared/store.js`)
reads these roles from the `x-ms-client-principal` header on every write.

