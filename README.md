# README.md
# 14-T Home Citation System

A household citation system. Issue tickets, print receipts with QR codes, track points, manage appeals.

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/YOUR_USERNAME/14-T.git
cd 14-T
npm install -g wrangler
```

### 2. Create the D1 database

```bash
wrangler d1 create 14t-db
```

Copy the `database_id` from the output and paste it into `wrangler.toml`.

### 3. Run the schema

```bash
wrangler d1 execute 14t-db --file=schema.sql
```

### 4. Deploy to Cloudflare Pages

```bash
wrangler pages deploy public --project-name=14-t
```

Or connect your GitHub repo in the Cloudflare dashboard under **Pages** and set the build output to `public/`.

For the API functions, deploy via **Cloudflare Workers** or use **Pages Functions** (the `functions/` folder is auto-detected by Cloudflare Pages).

---

## Local development

```bash
wrangler pages dev public --d1=DB:14t-db
```

---

## Pages

| Page | URL | Who |
|---|---|---|
| Issue ticket | `/index.html` | You only |
| View ticket | `/ticket.html?id=14T-XXX` | Anyone with QR code |
| Dashboard | `/dashboard.html` | You only |
| Print receipt | `/print.html?id=14T-XXX` | Auto-opens after issuing |

---

## Violation Types & Points

| Type | Points |
|---|---|
| Warning | 0 |
| Minor | 1 |
| Major | 2 |
| Severe | 3 |

---

## Appeal Flow

1. Recipient scans QR code on their printed receipt
2. They see the photo, violation details, and their points
3. They can submit an appeal note explaining their situation
4. The ticket appears as **APPEAL** in your dashboard (flagged)
5. You can **Resolve** (keep points) or **Dismiss** (remove points)

---

## Receipt Printer

Optimized for **80mm thermal receipt paper**. After issuing a ticket, the print page auto-opens and triggers the print dialog. Set margins to none in your printer settings for best results.
