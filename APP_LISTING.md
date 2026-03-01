# Product Admin Sidekick — Shopify App Listing Content

Use this content when filling out the **App listing** section of the Shopify Partner Dashboard.

---

## App Name

Product Admin Sidekick

## App Handle

`product-admin-sidekick`

---

## Short Description (tagline)

> Product intelligence, team notes, and sales forecasting — right inside your Shopify admin.

---

## Full Description

Product Admin Sidekick is a productivity layer for Shopify merchants who are tired of juggling browser tabs, spreadsheets, and Slack threads to manage product data. It brings internal notes, inventory forecasting, competitor tracking, and AI-powered insights directly into your Shopify admin — so critical context lives where your data already is.

Built for high-volume stores, the app eliminates context-switching by consolidating everything you need to make smart product decisions into a single, compact interface alongside your product pages.

---

## Features

### Team Notes & Timeline
- Add, edit, and delete internal notes on any product
- Organize with tags and filter to find what matters
- Full history with timestamps and author attribution

### AI-Powered Insights
- Automatic alerts for low inventory, revenue trends, sales spikes, and competitor undercuts
- One-click approve to save insights as team notes
- Severity levels (critical, warning, info) with dismiss support

### Inventory Health & Forecasting
- 7-day sales velocity tracking
- Stock days remaining forecast with color-coded status (green/amber/red)
- Automatic low-stock alerts before you run out

### Sales Analytics & Revenue Forecasting
- Total revenue, units sold, and stock days at a glance
- 7-day revenue forecast using linear regression
- 30-day and 90-day historical analysis
- CSV export for offline analysis

### Competitor Price Tracking
- Track competitor names, URLs, and prices per product
- Automatic undercut alerts when a competitor drops below your price
- Price history with last-checked dates

### Google Trends Integration
- Track search interest for your product categories
- Interactive charts showing demand patterns over time
- Auto-suggests queries based on your product title

---

## Screenshots (recommended)

Provide at least 3 screenshots at 1600x900px:

1. **Product analytics dashboard** — StatsCard showing revenue, units, velocity, and forecast
2. **Notes & insights panel** — NoteEditor with team notes, tags, and AI-generated insights
3. **Competitor tracking** — CompetitorTracker with price entries and undercut alerts
4. **Trends view** — TrendsCard with Google Trends chart for a product category

---

## Category

Store management > Inventory management (or Analytics)

---

## URLs

| Field | URL |
|-------|-----|
| App URL | `https://productsidekick.store/dashboard` |
| Privacy policy | `https://productsidekick.store/privacy` |
| Terms of service | `https://productsidekick.store/terms` |
| Support email | `support@productsidekick.store` |

---

## Access Scopes Justification

| Scope | Reason |
|-------|--------|
| `read_products` | Display product data, generate analytics and insights |
| `write_products` | Sync product metadata used by the sidekick panel |
| `read_orders` | Sales statistics, revenue forecasting, and velocity tracking |
| `read_inventory` | Inventory health monitoring and low-stock alerts |
