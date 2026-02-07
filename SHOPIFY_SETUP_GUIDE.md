# Product Admin Sidekick — Shopify App Store Setup Guide

This guide walks you through deploying the app to Vercel, connecting it to Shopify, and submitting it to the Shopify App Store.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Create a Shopify Partner Account & App](#2-create-a-shopify-partner-account--app)
3. [Set Up Supabase](#3-set-up-supabase)
4. [Deploy to Vercel](#4-deploy-to-vercel)
5. [Configure Shopify App URLs](#5-configure-shopify-app-urls)
6. [Test on a Development Store](#6-test-on-a-development-store)
7. [Submit to the Shopify App Store](#7-submit-to-the-shopify-app-store)
8. [Common Review Feedback](#8-common-review-feedback)

---

## 1. Prerequisites

Before you begin, make sure you have:

- A [Shopify Partner account](https://partners.shopify.com)
- A [Supabase project](https://supabase.com) (free tier works)
- A [Vercel account](https://vercel.com) connected to your GitHub repo
- Node.js 18+ installed locally

---

## 2. Create a Shopify Partner Account & App

### 2a. Create the App

1. Go to [partners.shopify.com](https://partners.shopify.com) and log in.
2. Navigate to **Apps** → **Create app**.
3. Choose **Create app manually**.
4. Enter app name: `Product Admin Sidekick`.
5. Set the **App URL** to `https://your-app.vercel.app` (placeholder — you'll update this after deploying).
6. Set **Allowed redirection URL(s)** to:
   ```
   https://your-app.vercel.app/api/auth/callback
   ```
7. Click **Create app**.

### 2b. Copy Your Credentials

From the app's **API credentials** page, copy:

- **Client ID** → this is your `SHOPIFY_API_KEY`
- **Client secret** → this is your `SHOPIFY_API_SECRET`

### 2c. Configure Access Scopes

Under **Configuration** → **Access scopes**, ensure these are selected:

- `read_products`
- `write_products`
- `read_orders`
- `read_inventory`

### 2d. Configure GDPR Webhooks

Under **Configuration** → **Compliance webhooks**, set:

| Webhook | URL |
|---------|-----|
| Customer data request | `https://your-app.vercel.app/api/webhooks/customers/data-request` |
| Customer data erasure | `https://your-app.vercel.app/api/webhooks/customers/redact` |
| Shop data erasure | `https://your-app.vercel.app/api/webhooks/shop/redact` |

### 2e. Enable Embedded App

Under **Configuration** → **App setup**:

- Set **Embedded in Shopify admin** to `Yes`
- Set the **App home** URL to your Vercel deployment URL

---

## 3. Set Up Supabase

### 3a. Create a Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Choose a region close to your users.
3. Set a strong database password (save it — you'll need it for migrations).

### 3b. Run the Database Migration

Option A — **Supabase Dashboard SQL Editor:**

1. Go to your project's **SQL Editor**.
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`.
3. Paste and click **Run**.

Option B — **Command line with psql:**

```bash
# Get your connection string from Supabase Dashboard → Settings → Database
psql "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" \
  -f supabase/migrations/001_initial_schema.sql
```

### 3c. Copy Your Supabase Credentials

From **Settings → API** in the Supabase dashboard:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon / public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret)

---

## 4. Deploy to Vercel

### 4a. Connect Your Repository

1. Go to [vercel.com](https://vercel.com) and click **Add New → Project**.
2. Import your GitHub repository.
3. Set the **Framework Preset** to **Next.js**.

### 4b. Set Environment Variables

In Vercel's project settings → **Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `SHOPIFY_API_KEY` | Your Shopify Client ID |
| `SHOPIFY_API_SECRET` | Your Shopify Client secret |
| `SHOPIFY_SCOPES` | `read_products,write_products,read_orders,read_inventory` |
| `SHOPIFY_APP_URL` | `https://your-app.vercel.app` (update after first deploy) |
| `NEXT_PUBLIC_SHOPIFY_API_KEY` | Same as `SHOPIFY_API_KEY` |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |

### 4c. Deploy

1. Click **Deploy**. Vercel will build and deploy the app.
2. Once deployed, copy the production URL (e.g., `https://product-admin-sidekick.vercel.app`).
3. Go back to Vercel environment variables and update `SHOPIFY_APP_URL` to your actual URL.
4. Redeploy for the URL change to take effect.

---

## 5. Configure Shopify App URLs

Now that you have a production URL, go back to the Shopify Partner Dashboard and update:

### In the App Setup page:

- **App URL:** `https://your-app.vercel.app`
- **Allowed redirection URL(s):** `https://your-app.vercel.app/api/auth/callback`
- **Privacy policy URL:** `https://your-app.vercel.app/privacy`
- **App proxy URL:** (leave blank unless using app proxy)

### In the GDPR Webhooks section:

Update all three webhook URLs with your real domain (see section 2d).

### Update `shopify.app.toml`:

Replace all instances of `https://your-app.vercel.app` with your actual Vercel URL and set the `client_id` to your Shopify Client ID.

---

## 6. Test on a Development Store

### 6a. Create a Development Store

1. In the Partner Dashboard, go to **Stores** → **Add store**.
2. Choose **Development store**.
3. Fill in the store details and create it.

### 6b. Install the App

1. From the Partner Dashboard, go to your app.
2. Click **Select store** under "Test your app".
3. Choose your development store.
4. You'll be redirected to the OAuth consent screen — approve the permissions.
5. The app should install and redirect to your embedded app.

### 6c. Test the Features

Verify each feature works:

- [ ] App loads in the Shopify admin (embedded)
- [ ] OAuth flow completes successfully
- [ ] Product sync works (navigate to a product page)
- [ ] Product notes can be created and retrieved
- [ ] Competitor tracking works
- [ ] Sales statistics display (may need sample orders)
- [ ] Trend analysis loads
- [ ] Forecasting generates results
- [ ] Privacy policy page loads at `/privacy`
- [ ] Terms of service page loads at `/terms`

### 6d. Test GDPR Webhooks

Use the Shopify CLI or Partner Dashboard to send test webhook payloads:

```bash
# If using Shopify CLI
shopify app webhook trigger --topic customers/data_request --address https://your-app.vercel.app/api/webhooks/customers/data-request
```

---

## 7. Submit to the Shopify App Store

### 7a. Prepare Your App Listing

In the Partner Dashboard, go to your app → **App listing**:

**Required fields:**

- **App name:** Product Admin Sidekick
- **App icon:** 1200x1200px PNG or JPG
- **Short description** (max 100 chars):
  > Product analytics, notes, competitor tracking, and sales forecasting for Shopify merchants.
- **Detailed description:** Explain each feature — notes, competitor tracking, trend analysis, forecasting, and product analytics.
- **Screenshots:** At least 3 screenshots showing the app in action (1600x900px recommended):
  1. Product analytics dashboard
  2. Notes and competitor tracking panel
  3. Trend analysis / forecasting view
- **Category:** Store management → Inventory management (or Analytics)
- **Pricing:** Set your pricing model (free, paid, or freemium)

**URLs:**

- **Privacy policy URL:** `https://your-app.vercel.app/privacy`
- **Support URL or email:** Your support contact
- **FAQ URL:** (optional)

### 7b. Submit for Review

1. Ensure all required listing fields are complete.
2. Click **Submit app** to enter the review queue.
3. Shopify's review team will test the app on a development store.
4. Reviews typically take 5–10 business days.
5. You'll receive email notifications about the review status.

---

## 8. Common Review Feedback

Here are common reasons Shopify may request changes, and how to address them:

### "App doesn't load properly"
- Ensure `SHOPIFY_APP_URL` matches your actual deployment URL.
- Verify OAuth redirect URLs are correct in both the Partner Dashboard and your code.
- Check Vercel logs for server-side errors.

### "Missing privacy policy"
- The app includes a built-in privacy policy at `/privacy`. Ensure this URL is set in the app listing.

### "GDPR webhooks not responding"
- Verify the webhook endpoints return a `200` status. Check the webhook route handlers in `app/api/webhooks/`.

### "App requests unnecessary scopes"
- Each scope should be justified. Our scopes:
  - `read_products` / `write_products` — core product analytics and sync
  - `read_orders` — sales statistics and forecasting
  - `read_inventory` — inventory tracking and display

### "App doesn't work as described"
- Test every feature listed in your app description before submitting.
- Ensure sample data or onboarding guides help the reviewer see the app in action.

### "Content Security Policy errors"
- The CSP headers in `middleware.ts` and `next.config.mjs` must allow all domains the app communicates with (Shopify, Supabase).

---

## Quick Reference: Environment Variables

| Variable | Where to Find It |
|----------|-----------------|
| `SHOPIFY_API_KEY` | Partner Dashboard → App → API credentials → Client ID |
| `SHOPIFY_API_SECRET` | Partner Dashboard → App → API credentials → Client secret |
| `NEXT_PUBLIC_SHOPIFY_API_KEY` | Same as `SHOPIFY_API_KEY` |
| `SHOPIFY_APP_URL` | Your Vercel deployment URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API → anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role key |
