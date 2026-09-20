# RoadPilot V6 — Cloud Setup

## 1. Supabase
Create a free Supabase project and open SQL Editor.
Run `supabase_schema.sql`.

Then copy your Project URL and Publishable key into `config.js`.

The browser must NEVER contain a secret/service-role key. RLS protects user rows.

## 2. GitHub Pages
Upload all files to the repository root.
Settings → Pages → Deploy from branch → main → /(root).

## 3. Email login
In Supabase Authentication, configure Email provider and your site URL.
Use your GitHub Pages URL as the Site URL / redirect URL where required.

## 4. Admin
Create your own RoadPilot account.
Set `app_metadata.role = admin` from a trusted server/admin environment. Do not attempt to put the service-role key in the website.

The V6 dashboard includes an Admin area in the source structure for future expansion; customer-facing pages do not receive admin secrets.

## 5. US$50/week
V6 displays RoadPilot Pro at US$50/week.
Real payments are NOT activated by simply changing the price in JavaScript.
For real recurring billing, create a Stripe or Mercado Pago integration with a server-side webhook/Edge Function that changes `subscriptions.status` after confirmed payment.
Never mark a subscription as paid solely from the browser.

## 6. Platform accounts
Do not store DoorDash/Uber/Uber Eats/Veho passwords. Platform connections should use official OAuth/API mechanisms if the provider makes them available.

## 7. Free tier
Supabase's free tier can be used for development/small early deployments, subject to Supabase's current quotas and terms.
