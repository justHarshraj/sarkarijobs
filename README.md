# 🇮🇳 Sarkari Jobs — Automated Government Recruitment Aggregator

A high-performance, full-stack government jobs aggregator for Indian aspirants built with **Next.js 16 (Turbopack)**, **React 19**, **Tailwind CSS v4**, and **MongoDB**. Automatically scrapes, cleans, deduplicates, and serves live recruitment notifications, official notification PDFs, admit cards, exam results, and application portals from verified government sources 24/7.

---

## ✨ Key Features

- 🔄 **Automated Live Web Scrapers**: Continuous background monitoring of live recruitment listings across multiple sources (`sarkariresult.com`, `sarkariresult.com.cm`) powered by Cheerio and Axios.
- 🛡️ **Intelligent Deduplication**: Multi-layer deduplication engine using Jaccard token similarity and content hashing (`MD5`) to prevent duplicate listings across multiple aggregators.
- 📄 **Direct Notification PDF & Portal Links**: Intelligently extracts direct links to official notification PDFs and official application portals (`joinindianarmy.nic.in`, `ssc.gov.in`, `rrbapply.gov.in`, etc.), filtering out generic homepage links.
- ⏱️ **Indian Date & Deadline Parsing**: Automatically normalizes diverse Indian date formats (`DD/MM/YYYY`, `DD Month YYYY`, `Month DD, YYYY`) and calculates approaching deadlines (ending within 7 days).
- 💰 **Application Fee & Age Normalizer**: Parses category-wise fee structures (General/OBC, SC/ST, Female) and age criteria with relaxation rules.
- 🔍 **Interactive Job Explorer & Filters**: Fast instant filtering by sector (Railway, SSC, UPSC, Bank, Police, Teaching, etc.), state/location, qualification, and post type.
- 📊 **Real-time Live Statistics**: Dashboard metrics displaying active jobs, approaching deadlines, declared results, and active admit cards.
- ⚡ **Next.js 16 + React 19 Architecture**: Server Components (RSC) for fast SEO-indexed SSR combined with client-side reactive filters and zero hydration mismatches.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) + `@tailwindcss/turbopack` |
| **Database** | [MongoDB](https://www.mongodb.com/) with [Mongoose 9](https://mongoosejs.com/) |
| **Web Scraping** | [Cheerio](https://cheerio.js.org/) + [Axios](https://axios-http.com/) |
| **Scheduling** | [node-cron](https://www.npmjs.com/package/node-cron) via Next.js `instrumentation.ts` |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |

---

## 📁 Project Structure

```text
sarkarijobs/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── categories/       # Category aggregation API
│   │   │   ├── jobs/             # Job filtering & pagination API
│   │   │   │   ├── [slug]/       # Single job detail API
│   │   │   │   ├── ending-soon/  # Deadline-approaching jobs
│   │   │   │   └── latest/       # Recent postings
│   │   │   ├── scraper/
│   │   │   │   └── trigger/      # Manual scraper invocation endpoint
│   │   │   └── stats/            # Dashboard stats API
│   │   ├── category/[category]/  # Category page
│   │   ├── jobs/[slug]/          # Full job detail page
│   │   ├── search/               # Search results page
│   │   ├── globals.css           # Global Tailwind v4 styles
│   │   ├── layout.tsx            # Root layout with navbar & footer
│   │   └── page.tsx              # Dynamic homepage
│   ├── components/
│   │   ├── jobs/                 # Job cards, badges, filters
│   │   ├── layout/               # Header, Footer, navigation
│   │   └── sections/             # StatsBar, CategoryGrid, JobExplorer
│   ├── instrumentation.ts        # Next.js startup hook (starts cron)
│   ├── lib/
│   │   ├── constants/            # Categories and Indian states data
│   │   ├── db/                   # MongoDB connection & Mongoose models
│   │   ├── scraper/              # Scraper orchestrator, parsers, scheduler
│   │   └── utils/                # Date parser, slug generator, deduplicator
│   └── types/                    # TypeScript interfaces & types
├── scripts/
│   ├── seed.ts                   # Database seeder
│   └── test-scraper.ts           # Scraper validation utility
├── .env.example                  # Environment configuration template
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.18.0 (Tested on Node.js v20+)
- **MongoDB** running locally (`mongodb://localhost:27017`) or a MongoDB Atlas URI

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/sarkarijobs.git
cd sarkarijobs
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file from the provided `.env.example`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/sarkarijobs

# Background Scraper Settings
SCRAPER_ENABLED=true
SCRAPER_CRON="0 */6 * * *"
SCRAPER_DELAY_MIN=1500
SCRAPER_DELAY_MAX=3000

# App Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME="Sarkari Jobs"
```

### 4. (Optional) Seed Categories & Initial Data

```bash
npm run seed
```

### 5. Run Scraper to Fetch Latest Live Jobs

```bash
npm run scrape
```

### 6. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server with Turbopack |
| `npm run build` | Builds the optimized production bundle |
| `npm start` | Starts the Next.js production server |
| `npm run lint` | Runs ESLint type & style verification |
| `npm run seed` | Seeds default categories and sample jobs into MongoDB |
| `npm run scrape`| Runs live scrapers immediately from the terminal |

---

## 🌐 API Reference

### `GET /api/jobs`
Query parameter filterable list of government jobs.
- **Parameters**: `page`, `limit`, `category`, `state`, `qualification`, `postType`, `search`, `sort`
- **Response**: `{ success: true, data: IJob[], pagination: { page, limit, total, totalPages } }`

### `GET /api/jobs/:slug`
Fetches detailed info for a single job posting by slug.

### `GET /api/stats`
Returns aggregated count metrics: `totalActiveJobs`, `endingSoonCount`, `resultsCount`, `admitCardCount`, `newJobsToday`.

### `GET /api/categories`
Returns department list with real-time active job counts.

### `POST /api/scraper/trigger`
Triggers an on-demand scraper run across all sources.
- **Body** (optional): `{ "source": "all", "limit": 20 }`

---

## ⚖️ Disclaimer

This platform aggregates publicly announced recruitment notices and exam updates for informational purposes only. Candidates are advised to always cross-check details and download the official notification PDF before submitting applications.

---

## 📄 License

MIT License. Feel free to use and contribute!
