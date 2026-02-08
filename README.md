# Kinda Salty Studio

Production website for **Kinda Salty Studio** — showcasing and selling 3D printed models and laser engraving products. Pulls product listings from Etsy so you never have to duplicate work.

**Live site:** https://kindasaltystudio.com

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **TailwindCSS** for styling
- **Vercel** for hosting (ISR, edge functions)
- **Vercel Postgres** for email signups
- **Resend** for transactional email
- **Google Analytics 4** for tracking
- **Etsy API v3** for product listings (with JSON file fallback)

## Requirements

- **Node.js** ≥ 20.0.0
- **npm** ≥ 10

## Quick Start

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd kinda-salty-studio

# 2. Install dependencies
npm install

# 3. Copy env file
cp .env.example .env.local
# Edit .env.local with your values (all optional for local dev)

# 4. Run dev server
npm run dev
```

The site works immediately with sample product data — no API keys required.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ETSY_API_KEY` | No | Etsy API key for live listings |
| `ETSY_SHOP_ID` | No | Your Etsy shop numeric ID |
| `NEXT_PUBLIC_GA_ID` | No | GA4 Measurement ID (G-XXXXXXXXXX) |
| `RESEND_API_KEY` | No | Resend API key for email delivery |
| `CONTACT_EMAIL` | No | Email for form submissions (default: hello@kindasaltystudio.com) |
| `POSTGRES_URL` | No | Vercel Postgres connection string |
| `ADMIN_TOKEN` | No | Token for admin endpoints (cache refresh, subscriber export) |
| `NEXT_PUBLIC_SITE_URL` | No | Canonical URL (default: https://kindasaltystudio.com) |

## Etsy Integration

### Option A: Live Etsy API

1. Create an Etsy app at https://www.etsy.com/developers/your-apps
2. Get your API key (v3 key string)
3. Find your shop ID (numeric) — visit your shop, it's in the URL or use the API
4. Set `ETSY_API_KEY` and `ETSY_SHOP_ID` in your env

Listings are cached in memory and revalidated every 6 hours via ISR.

### Option B: JSON Fallback (no API needed)

If you don't have API access, or want to pre-export:

```bash
ETSY_API_KEY=your_key ETSY_SHOP_ID=your_id npm run fetch-listings
```

This writes to `src/data/listings.json`. The site uses this file automatically when API keys aren't set.

### Manual Cache Refresh

```bash
curl -X POST "https://kindasaltystudio.com/api/refresh-cache?token=YOUR_ADMIN_TOKEN"
```

## Google Analytics 4

1. Create a GA4 property at https://analytics.google.com
2. Get your Measurement ID (starts with `G-`)
3. Set `NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX` in your env

### Tracked Events

| Event | Trigger |
|---|---|
| `view_on_etsy` | User clicks "Buy on Etsy" button |
| `email_signup` | User subscribes to newsletter |
| `contact_submit` | User submits contact form |
| `custom_order_submit` | User submits custom order form |

## Email Signup Storage

Uses **Vercel Postgres**. The table is auto-created on first signup.

### Setup

1. In your Vercel project, go to Storage → Create → Postgres
2. Connect it to your project — env vars are auto-populated
3. For local dev, copy the Postgres env vars to `.env.local`

### Export Subscribers

```
GET /api/admin/export-subscribers?token=YOUR_ADMIN_TOKEN
```

Returns a CSV download.

## Form Email Delivery (Resend)

1. Sign up at https://resend.com
2. Add and verify your domain
3. Create an API key
4. Set `RESEND_API_KEY` in your env

Without Resend configured, form submissions log to console (safe for local dev).

## Deploy to Vercel

1. Push repo to GitHub
2. Import project in Vercel dashboard
3. Set environment variables in Vercel project settings
4. Deploy

### Custom Domain

1. In Vercel → Project → Settings → Domains
2. Add `kindasaltystudio.com`
3. Follow DNS instructions (usually add A record or CNAME)
4. Vercel auto-provisions SSL

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout with fonts, GA, header/footer
│   ├── page.tsx            # Homepage
│   ├── shop/
│   │   ├── page.tsx        # Shop grid with filters
│   │   └── [slug]/page.tsx # Product detail
│   ├── 3d-prints/          # Category landing
│   ├── laser-engraving/    # Category landing
│   ├── custom-orders/      # Custom order form
│   ├── about/
│   ├── contact/
│   ├── privacy/
│   ├── terms/
│   ├── api/                # API routes
│   │   ├── subscribe/      # Email signup
│   │   ├── contact/        # Contact form
│   │   ├── custom-order/   # Custom order form
│   │   ├── admin/          # Subscriber export
│   │   └── refresh-cache/  # Manual cache refresh
│   ├── sitemap.ts          # Dynamic sitemap
│   └── robots.ts           # robots.txt
├── components/             # React components
├── lib/                    # Core logic
│   ├── site.config.ts      # Central configuration
│   ├── listings.ts         # Etsy integration + fallback
│   ├── analytics.ts        # GA4 tracking
│   ├── email.ts            # Resend email helper
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Helpers
├── data/
│   └── listings.json       # Fallback product data
└── scripts/
    └── fetch-listings.ts   # Etsy → JSON export script
```

## SEO Features

- Per-page metadata via Next.js Metadata API
- JSON-LD: Organization, WebSite, Product, BreadcrumbList
- Dynamic sitemap.xml with all products
- Canonical URLs pointing to kindasaltystudio.com
- Semantic HTML with proper heading hierarchy
- next/image for optimized images
- ISR for fresh content without rebuilds
