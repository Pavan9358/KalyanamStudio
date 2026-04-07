# 🪷 KalyanamStudio

> **South India's premier self-service wedding invitation builder SaaS**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/dharavathpavan/kalyanam-studio)

---

## ✨ Features

- 🎨 **4 curated South Indian templates** (Traditional, Royal, Floral, Modern)
- ✍️ **Real-time invitation builder** with split-pane live preview
- 🔗 **Instant shareable link** (`/invite/your-slug`)
- 💌 **RSVP collection** with guest management
- ⏱️ **Live countdown timer** to the Muhurtham
- 📱 **Mobile-first**, PWA-ready
- 🔐 **JWT authentication** with email + password
- 📊 **Dashboard** to manage all your invitations

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Open the **SQL Editor** and paste the contents of `supabase_schema.sql`
3. Run the query to create all tables

### 3. Configure environment variables

Copy `.env.local` and fill in your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
JWT_SECRET=your_very_secret_key
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🌐 Deploy to Vercel

1. Push to GitHub
2. Import to [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `JWT_SECRET`
4. Deploy!

---

## 🗄️ Database Schema

See `supabase_schema.sql` for the complete PostgreSQL schema.

| Table | Description |
|-------|-------------|
| `users` | Authenticated users |
| `invitations` | Wedding invitation records with JSON data |
| `rsvps` | Guest RSVP responses |

---

## 🧩 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/signup/     # POST — register
│   │   ├── auth/login/      # POST — login
│   │   ├── invitations/     # CRUD invitations
│   │   ├── invite/[slug]/   # Public — get by slug
│   │   └── rsvp/            # Submit & read RSVPs
│   ├── auth/                # Login / Signup page
│   ├── builder/[templateId] # Invitation builder
│   ├── dashboard/           # User dashboard
│   ├── invite/[slug]/       # Public invitation view
│   └── templates/           # Template gallery
├── components/
│   ├── Navbar.jsx
│   └── TemplateCard.jsx
└── lib/
    ├── supabase.js          # Supabase client
    ├── auth.js              # JWT utilities
    └── templates.js         # Template data
```

---

## 🎨 Design System

| Token | Value |
|-------|-------|
| Gold | `#D4AF37` |
| Maroon | `#800000` |
| Cream | `#FFF5E1` |
| Green | `#2E7D32` |
| Heading Font | Playfair Display |
| Body Font | Poppins |

---

## 📈 Monetisation

| Plan | Price | Features |
|------|-------|----------|
| Free | ₹0 | 1 invite, 2 templates, watermark |
| Premium | ₹499/invite | All templates, no watermark, photo gallery, RSVP analytics |
| Family | ₹999/year | 5 premium invites, multi-language |

---

Made with ❤️ for South Indian weddings.
