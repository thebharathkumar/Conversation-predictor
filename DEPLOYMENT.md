# 🚀 Deploying Digital Therapist AI to Vercel

This guide will walk you through deploying the Digital Therapist AI web application to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier works great)
2. An [Anthropic API key](https://console.anthropic.com/)
3. Git repository with the code (GitHub, GitLab, or Bitbucket)

## Quick Deploy

### Option 1: Deploy via Vercel Dashboard

1. **Push your code to GitHub**
   ```bash
   git push origin claude/digital-therapist-ai-01V4PQSrNR2SevheKea1vEfE
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Postgres Database**
   - In your project, go to the **Storage** tab
   - Click **Create Database**
   - Select **Postgres**
   - Click **Create**
   - Vercel will automatically set all `POSTGRES_*` environment variables

4. **Add Environment Variables**
   - Go to **Settings** → **Environment Variables**
   - Add: `ANTHROPIC_API_KEY` with your Anthropic API key

5. **Initialize Database**
   - After deployment, visit: `https://your-app.vercel.app/api/init-db`
   - You should see: `{"success":true,"message":"Database initialized"}`

6. **Done!** 🎉
   - Your app is live at `https://your-app.vercel.app`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Add Postgres** (via dashboard)
   - Follow step 3 from Option 1 above

5. **Set Environment Variables**
   ```bash
   vercel env add ANTHROPIC_API_KEY
   # Paste your API key when prompted
   ```

6. **Initialize Database**
   - Visit: `https://your-app.vercel.app/api/init-db`

## Configuration Details

### Environment Variables

Your Vercel project needs these environment variables:

**Required:**
- `ANTHROPIC_API_KEY` - Your Anthropic API key

**Auto-set by Vercel Postgres:**
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### Build Settings

Vercel auto-detects these, but if needed:
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## Local Development with Vercel Postgres

To develop locally with the Vercel Postgres database:

1. **Pull environment variables**
   ```bash
   vercel env pull .env.local
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   ```
   http://localhost:3000
   ```

## Database Management

### View Database
- Go to your Vercel project
- Click **Storage** tab
- Click your Postgres database
- Use **Data** tab to view tables
- Use **Query** tab to run SQL

### Backup Database
```bash
# Install Vercel CLI if you haven't
npm install -g vercel

# Pull environment variables
vercel env pull .env.local

# Use the POSTGRES_URL to backup with pg_dump
pg_dump $POSTGRES_URL > backup.sql
```

### Reset Database
If you need to reset the database:
1. Go to Vercel Dashboard → Storage → Your Database
2. Go to **Query** tab
3. Run:
   ```sql
   DROP TABLE IF EXISTS sleep_data CASCADE;
   DROP TABLE IF EXISTS social_patterns CASCADE;
   DROP TABLE IF EXISTS worries CASCADE;
   DROP TABLE IF EXISTS thought_patterns CASCADE;
   DROP TABLE IF EXISTS emotions CASCADE;
   DROP TABLE IF EXISTS messages CASCADE;
   DROP TABLE IF EXISTS sessions CASCADE;
   ```
4. Re-initialize by visiting `/api/init-db`

## Troubleshooting

### "Database connection failed"
- Ensure Vercel Postgres is properly added to your project
- Check that environment variables are set in Vercel dashboard
- Try redeploying: `vercel --prod`

### "ANTHROPIC_API_KEY not found"
- Make sure you added the environment variable in Vercel dashboard
- Redeploy after adding: `vercel --prod`

### "Tables already exist" error
- This is normal if tables were created previously
- The init endpoint will succeed even if tables exist

### Build failures
- Check the build logs in Vercel dashboard
- Ensure all TypeScript errors are resolved
- Try building locally first: `npm run build`

### Local development not working
- Make sure you pulled env variables: `vercel env pull .env.local`
- Check that `.env.local` contains POSTGRES_* variables
- Verify Node version (14.x or higher)

## Custom Domain

To add a custom domain:
1. Go to your project in Vercel
2. Click **Settings** → **Domains**
3. Add your domain
4. Update DNS records as instructed

## Security Notes

- **User IDs**: Currently stored in browser localStorage (client-side)
- **No Authentication**: Anyone with the URL can access the app
- **Data Privacy**: All conversations are stored in your Vercel Postgres database
- For production use with real users, consider adding:
  - NextAuth.js or similar authentication
  - User accounts and login
  - Encrypted data storage
  - HIPAA compliance measures (if needed)

## Scaling

Vercel's free tier includes:
- 100GB bandwidth
- Unlimited requests
- Serverless functions (with limits)

For high traffic:
- Upgrade to Vercel Pro
- Consider connection pooling for database
- Add caching where appropriate

## Monitoring

Monitor your app's performance:
- **Analytics**: Vercel Dashboard → Analytics tab
- **Logs**: Vercel Dashboard → Functions tab
- **Database**: Storage tab for query metrics

## Support

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Postgres Guide](https://vercel.com/docs/storage/vercel-postgres)
- [Anthropic API Docs](https://docs.anthropic.com/)

---

**Need help?** Open an issue in the GitHub repository.
