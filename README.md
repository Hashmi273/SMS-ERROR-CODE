# Immense Error Code Intelligence Hub

A production-ready, ultra-fast **Error Code Search Portal** built for **Immense Smart Solutions** internal technical and support teams.

Designed with an AI-inspired, modern SaaS visual aesthetic (Linear, Stripe, Vercel, Antigravity) with zero spreadsheet or Excel dashboard feel.

---

## Key Features

- **Blazing Fast Client-Side Search (<1ms)**:
  - Exact error code search (`20A`, `408`, `5101`, `9196`)
  - Partial error code search (`20`, `40`, `51`)
  - Description keyword search (`authentication`, `timeout`, `DLT`, `subscriber`, `memory`)
  - Case-insensitive search
- **Intelligent Results Presentation**:
  - Translucent glassmorphic cards with responsive layouts (NO boring Excel tables).
  - Safe keyword highlighting with full XSS sanitization.
  - Multi-part delimiter formatting for compound messages (`|`).
- **Domain Category Filtering**:
  - DLT & Regulatory (PE-TM chains, Template IDs, Header scrubs, Consent)
  - MAP & SS7 Telephony (Dialogues, Handover, HLR/VLR, Bearer services)
  - SMPP & Gateway Protocols (ESME, PDUs, Bindings, Command IDs, Throttling)
  - Network & Delivery (MSISDN, DND, Routing, Quota, Blacklists)
  - System & General
- **One-Click Support Productivity**:
  - **Copy Code**: Instant copy with `"Copied ✓"` visual feedback.
  - **Copy Details**: Copies error code + formatted description.
  - **Share Link**: Generates deep-link URL (`?error=CODE`) and copies to clipboard.
- **Deep Linking & URL State**:
  - Direct URL navigation (`?error=20A` or `?q=auth`) automatically pre-fills the search, highlights, and smoothly scrolls to the card.
- **Developer Keyboard Shortcuts**:
  - `/` or `Ctrl+K` / `Cmd+K` &rarr; Instant focus search box
  - `Escape` &rarr; Clear search input and blur
  - `Enter` &rarr; Execute query and save to history
- **Theme Experience**:
  - Premium Dark Mode (`#050B18`, `#071A3A`, `#0B1F3A`) with Electric Cyan (`#22D3EE`) accents.
  - Crisp Light Mode (`#F7FAFF`) with Immense Blue (`#1268FF`) accents.
  - Saves user preference in `localStorage`.
- **Search History**:
  - Tracks last 5 unique queries in `localStorage` with quick replay pills.
  - Quick access to popular queries (`20A`, `408`, `DLT`, `SMPP`, `5110`, `timeout`, `DND`).
- **Zero-CORS Offline Execution**:
  - Works both on web servers and directly by double-clicking `index.html` via `file:///` thanks to dual JSON + JS dataset architecture.

---

## Project Structure

```text
immense-error-code-hub/
│
├── index.html               # Semantic HTML5, SEO/OpenGraph meta, Hero, Stats, Search, Cards
├── data/
│   ├── master_raw.csv       # Original raw master CSV dataset
│   └── errors.json          # Master parsed JSON database
├── assets/
│   ├── logo.svg             # Immense Smart Solutions brand mark
│   └── favicon.svg          # Matching high-res SVG favicon
├── css/
│   └── style.css            # Design tokens, glassmorphism, dark/light modes, animations
├── js/
│   ├── errors-data.js       # Master dataset fallback for zero-CORS file:// local execution
│   └── app.js               # Search indexer, highlighter, clipboard, shortcuts, URL sync
├── README.md                # Documentation & deployment instructions
└── .gitignore
```

---

## Free Deployment Instructions

This project is 100% static, requires no backend server, and can be deployed for **free** within 60 seconds.

### Option 1: GitHub Pages (Recommended)
1. Initialize a git repository and push this directory to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of Immense Error Code Hub"
   git branch -M main
   git remote add origin https://github.com/<your-username>/immense-error-code-hub.git
   git push -u origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** &rarr; **Pages**.
   - Under **Build and deployment** &rarr; **Branch**, select `main` branch and `/ (root)` folder.
   - Click **Save**.
3. Your portal will be live at:
   `https://<your-username>.github.io/immense-error-code-hub/`

### Option 2: Cloudflare Pages
1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) &rarr; **Workers & Pages**.
2. Click **Create Application** &rarr; **Pages** &rarr; **Connect to Git** (or drag and drop the folder).
3. Set build settings:
   - Framework preset: `None`
   - Build output directory: `/` (root)
4. Click **Deploy**.

### Option 3: Vercel
1. Install Vercel CLI or import via GitHub:
   ```bash
   npx vercel
   ```
2. Accept the default static settings. It will immediately give you a production URL.

---

## Local Development & Testing

- **Direct file access**: Simply double-click `index.html` in Windows Explorer. It will open in Chrome/Edge/Firefox with full functionality and data loaded instantly!
- **Local HTTP server (optional)**:
  ```bash
  npx serve .
  ```
  or
  ```bash
  python -m http.server 3000
  ```

---

&copy; Immense Smart Solutions &mdash; Error Code Intelligence Hub. Built for internal technical and support teams.
