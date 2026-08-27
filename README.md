# DraperU India Founder Intelligence & Registration Platform 🚀

An end-to-end, enterprise-grade Founder CRM and Event Registration System built for **Draper University India**.

---

## 🌟 Key Capabilities

1. **Automated Event Entrance Registration**:
   - Dynamic QR entry (`/events/[slug]/register`).
   - Duplicate pre-check with personalized **"Welcome back, {Founder}!"** preview.
   - Streamlined multi-step form for new founders.
   - Intelligent duplicate resolution modal (*"Use Existing Profile"* vs *"Create New Profile"*).
   - Auto-generates permanent **`DRU-F-XXXXXX`** Founder ID and scannable digital badge.

2. **Permanent Founder Digital Pass & QR**:
   - Public verifiable profile pass at `/f/[id]` (e.g., `/f/DRU-F-000124`).
   - Printable lanyard badge & visiting card layout.

3. **Entrance Fast Check-In Desk**:
   - Live hardware/camera QR scanner kiosk (`/checkin`).
   - Rapid search by name, phone, company, or ID.
   - Real-time registered vs checked-in counts.

4. **360° Founder CRM Profile & Chronological Timeline**:
   - Complete Personal, Startup, Funding, and DraperU Relationship details.
   - Interactive timeline of registrations, attendances, calls, emails, and investor intros.
   - 1-click **Log Interaction** and **Add Follow-Up Task**.

5. **AI & Natural Language Query Search**:
   - Plain-English search (`/search`) e.g., *"Show funded AI founders in Hyderabad"* or *"Pre-seed SaaS builders looking for angel intros"*.

6. **Post-Event Follow-Up Automation**:
   - Automated post-event task generation (`/follow-ups`).
   - Priority buckets: 🔴 Overdue, 🟠 Today, 🟡 This Week, 🟢 Upcoming, ✅ Completed.

7. **Google Sheet / CSV Importer**:
   - Ingest existing spreadsheets with column mapping and duplicate pre-scan.

8. **Dynamic QR Hub & Printable Lanyard Badges**:
   - Bulk badge print center at `/qr-hub`.

9. **Executive Intelligence Dashboard**:
   - High-level KPIs, monthly growth trend, and sector breakdowns.

10. **Role-Based Access Control**:
    - Permissions for Admin, Founder/Community Team, Event Team, and Viewer.

11. **Production Database Schema**:
    - Ready-to-deploy PostgreSQL / Supabase schema in `supabase/schema.sql`.

---

## 🚀 Quickstart

### 1. Run Development Server
```bash
npm install
npm run dev
```

### 2. Build and Run Production Server
```bash
npm run build
npm run start -- -p 3005
```

The application is accessible at:
👉 **`http://localhost:3005`**

---

## 📂 Key Routes

| Route | Purpose |
|---|---|
| `/` or `/dashboard` | Executive Intelligence Dashboard |
| `/events/founder-mafia-night-blr/register` | Public Event Registration Portal |
| `/checkin` | Entrance Fast Check-in Desk & QR Scanner |
| `/f/DRU-F-000124` | Permanent Founder Public Digital Pass |
| `/founders/DRU-F-000124` | 360° Founder Profile & Unified Timeline |
| `/founders` | Founders CRM Directory & CSV Exporter |
| `/startups` | Startups & Portfolio Directory |
| `/events` | Event Management & Dynamic QR Posters |
| `/follow-ups` | Follow-Up Tasks & Post-Event Automation |
| `/search` | AI & Semantic Founder Query Engine |
| `/import` | Google Sheet & CSV Column Mapping Importer |
| `/qr-hub` | Dynamic QR & Lanyard Badge Print Center |
| `/interactions` | Activity & Touchpoints Feed |
| `/team` | Team Roles & Permission Simulator |
