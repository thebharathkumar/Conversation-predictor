# ⚡ Quick Setup Guide

Follow these steps to get the app running:

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your **Anthropic API key**:

```
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

Get your API key from: https://console.anthropic.com/

## Step 3: Set Up Database

You have two options:

### Option A: Use Vercel Postgres (Recommended for Vercel deployment)

If you're deploying to Vercel:
1. Go to your Vercel project dashboard
2. Click **Storage** → **Create Database** → **Postgres**
3. Environment variables will be automatically added

For local development with Vercel Postgres:
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link your project
vercel link

# Pull environment variables
vercel env pull .env.local
```

### Option B: Use Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a database:
   ```bash
   createdb therapist_ai
   ```

3. Add to `.env.local`:
   ```
   POSTGRES_URL="postgresql://localhost/therapist_ai"
   ```

## Step 4: Start Development Server

```bash
npm run dev
```

The app will be available at: http://localhost:3000

## Step 5: Initialize Database

**Important:** Visit this URL to create the database tables:

```
http://localhost:3000/api/init-db
```

You should see:
```json
{
  "success": true,
  "message": "Database initialized"
}
```

## Step 6: Verify Setup

Visit the health check:
```
http://localhost:3000/api/health
```

You should see:
```json
{
  "status": "healthy",
  "checks": {
    "anthropicKey": true,
    "postgresUrl": true
  }
}
```

If any checks show `false`, go back and fix that step.

## Step 7: Use the App!

1. Go to http://localhost:3000
2. Click "Start Therapy Session"
3. Start chatting!

---

## Troubleshooting

**Problem: "Anthropic API key not found"**
- Make sure `.env.local` exists
- Make sure it contains `ANTHROPIC_API_KEY=sk-ant-...`
- Restart the dev server after adding env variables

**Problem: "Database connection failed"**
- Check Postgres is running: `pg_isready`
- Verify `POSTGRES_URL` in `.env.local`
- Try: `psql $POSTGRES_URL` to test connection

**Problem: "Table does not exist"**
- Visit `/api/init-db` to create tables

**Problem: Messages don't send**
- Check browser console (F12) for errors
- Check terminal where `npm run dev` is running
- See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for detailed help

---

## Quick Commands Cheat Sheet

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check health
curl http://localhost:3000/api/health

# Initialize database
curl http://localhost:3000/api/init-db
```

---

## Minimum Requirements

- Node.js 18+ or 20+
- PostgreSQL 12+ (or Vercel Postgres)
- Anthropic API key

---

**Ready to deploy?** See [DEPLOYMENT.md](DEPLOYMENT.md)

**Having issues?** See [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
