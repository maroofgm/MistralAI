# Personal Growth Story

> Only For Admin

A full-stack PWA built with Next.js 14, Supabase, and OpenAI.

## Features

- Supabase authentication (login / signup)
- Personal records CRUD with search & pagination
- CSV bulk upload
- PDF/CV extraction via OpenAI GPT-4o
- Salary prediction with Recharts distribution chart
- PWA support (installable, offline-ready)

## Stack

Next.js 14 · TypeScript · Tailwind CSS · Supabase · OpenAI · Recharts · Zod · React Hook Form

## Setup

1. Copy `.env.local.example` and fill in your credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`

2. Install dependencies and run:

```bash
npm install
npm run dev
```
