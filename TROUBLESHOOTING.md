# 🔧 Troubleshooting Guide

## Issue: Can't send messages / No response

If you're unable to send messages or get responses, follow these steps:

### Step 1: Check Environment Setup

**Run the health check:**
Visit: `http://localhost:3000/api/health` (or your deployed URL)

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

If you see `false` for any check, fix it:

#### Fix Missing Anthropic API Key
1. Create `.env.local` file in project root
2. Add:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
   ```
3. Get your key from: https://console.anthropic.com/
4. Restart your dev server: `npm run dev`

#### Fix Missing Postgres URL
**For local development:**
1. Either connect to Vercel Postgres:
   ```bash
   vercel env pull .env.local
   ```

2. Or use a local Postgres:
   - Install PostgreSQL locally
   - Create a database
   - Add to `.env.local`:
     ```
     POSTGRES_URL="postgresql://user:password@localhost:5432/therapist"
     ```

**For Vercel deployment:**
1. Go to your project in Vercel Dashboard
2. Click **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Click **Create**

### Step 2: Initialize Database

Visit: `http://localhost:3000/api/init-db`

You should see:
```json
{
  "success": true,
  "message": "Database initialized"
}
```

If you see an error, check your Postgres connection.

### Step 3: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try sending a message
4. Look for error messages

Common errors:

#### "Failed to fetch"
- Server isn't running
- Wrong URL
- CORS issue

**Fix:** Make sure dev server is running:
```bash
npm run dev
```

#### "500 Internal Server Error"
- Check terminal/console for server errors
- Environment variables might be missing
- Database not initialized

#### "API key not found"
- `ANTHROPIC_API_KEY` not set
- See Step 1 above

### Step 4: Check Network Tab

1. Open DevTools (F12)
2. Go to **Network** tab
3. Try sending a message
4. Look for the `/api/chat` request
5. Click on it to see the response

If you see:
- **Failed** - Server issue, check terminal
- **400** - Bad request, check console
- **401/403** - API key issue
- **500** - Server error, check terminal logs

### Step 5: Check Terminal/Server Logs

If running locally, check your terminal where `npm run dev` is running.

Look for errors like:
- `ANTHROPIC_API_KEY not found`
- `Database connection failed`
- `Error in /api/chat`

## Quick Test

### Test 1: Health Check
```bash
curl http://localhost:3000/api/health
```

Should return healthy status.

### Test 2: Create Session
```bash
curl -X POST http://localhost:3000/api/session \
  -H "Content-Type: application/json" \
  -d '{"userId":"test_user"}'
```

Should return: `{"sessionId":1}`

### Test 3: Send Message
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message":"Hello",
    "sessionId":1,
    "userId":"test_user",
    "conversationHistory":[]
  }'
```

Should return a response from the AI.

## Common Issues

### Issue: "Anthropic API key not found"
**Solution:** Add `ANTHROPIC_API_KEY` to `.env.local`

### Issue: "Cannot connect to database"
**Solution:**
- For local: Set up Postgres locally
- For Vercel: Add Postgres storage in dashboard
- Pull env variables: `vercel env pull .env.local`

### Issue: "Table does not exist"
**Solution:** Visit `/api/init-db` to create tables

### Issue: Messages send but no response
**Solution:**
1. Check Anthropic API key is valid
2. Check API quota/limits
3. Check terminal for errors
4. Try the curl test above

### Issue: "Failed to start session"
**Solution:**
1. Check database is initialized
2. Check Postgres connection
3. Look at terminal logs

## Still Not Working?

1. **Restart everything:**
   ```bash
   # Stop the server (Ctrl+C)
   # Then:
   rm -rf .next
   npm install
   npm run dev
   ```

2. **Check all environment variables:**
   ```bash
   cat .env.local
   ```

   Should have:
   - `ANTHROPIC_API_KEY`
   - `POSTGRES_URL` (or other Postgres variables)

3. **Verify Anthropic API key works:**
   ```bash
   curl https://api.anthropic.com/v1/messages \
     -H "x-api-key: $ANTHROPIC_API_KEY" \
     -H "anthropic-version: 2023-06-01" \
     -H "content-type: application/json" \
     -d '{
       "model": "claude-3-5-sonnet-20241022",
       "max_tokens": 1024,
       "messages": [{"role": "user", "content": "Hello"}]
     }'
   ```

4. **Check if Next.js is working:**
   Visit `http://localhost:3000` - you should see the home page

5. **Open an issue:**
   If nothing works, open an issue with:
   - Error messages from console
   - Error messages from terminal
   - Output from health check
   - Your environment (OS, Node version)

## Getting Help

- Check browser console (F12)
- Check terminal logs
- Visit `/api/health` for diagnostics
- Review [DEPLOYMENT.md](DEPLOYMENT.md) for setup steps
- Open an issue on GitHub with error details
