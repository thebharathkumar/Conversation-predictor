# 🧠 Digital Therapist AI (Web Version)

An AI-powered mental health companion web application that provides compassionate conversations while intelligently tracking your emotional wellbeing, thought patterns, and life factors.

**✨ Now deployable to Vercel!**

## 🌟 What's New in Web Version

- **Modern Web Interface**: Beautiful, responsive UI built with Next.js and Tailwind CSS
- **Real-time Chat**: Smooth, interactive therapy sessions
- **Interactive Dashboard**: Visual insights and analytics
- **Cloud Storage**: Data persisted in Vercel Postgres
- **Deploy Anywhere**: One-click deployment to Vercel
- **Mobile Friendly**: Works great on phones and tablets

## ✨ Features

### 1. **Conversational AI Therapy**
- Natural, empathetic conversations powered by Claude AI
- Active listening and thoughtful follow-up questions
- Non-judgmental support and guidance

### 2. **Emotional Trend Tracking**
- Automatically detects and tracks emotions from conversations
- Measures emotion intensity (0-10 scale)
- Identifies dominant emotional patterns over time
- Provides context-aware emotional analysis

### 3. **Toxic Thought Loop Detection**
- Identifies cognitive distortions:
  - Catastrophizing
  - Black-and-white thinking
  - Overgeneralization
  - Mind reading
  - And more...
- Tracks frequency and patterns of unhealthy thinking

### 4. **Repeated Worries Tracker**
- Logs and categorizes recurring concerns
- Measures worry severity
- Identifies patterns in what causes stress

### 5. **Social Patterns Analysis**
- Monitors social interaction types
- Analyzes sentiment (positive, negative, neutral)
- Detects isolation patterns
- Calculates social health score

### 6. **Sleep Connection Tracking**
- Log sleep hours and quality
- Correlates sleep patterns with mental health
- Provides sleep recommendations

### 7. **Interactive Dashboard**
- Real-time mental health score (0-100)
- Visual breakdown of all tracked metrics
- Monthly insights and trends
- Personalized recommendations

## 🚀 Quick Start

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/Conversation-predictor)

1. Click the button above
2. Add your `ANTHROPIC_API_KEY` environment variable
3. Add Vercel Postgres from the Storage tab
4. Visit `/api/init-db` to initialize the database
5. Start using your app!

**Full deployment guide:** See [DEPLOYMENT.md](DEPLOYMENT.md)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Conversation-predictor.git
   cd Conversation-predictor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add:
   - Your `ANTHROPIC_API_KEY`
   - Vercel Postgres credentials (if using cloud DB)

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   ```
   http://localhost:3000
   ```

6. **Initialize database** (first time only)
   Visit: `http://localhost:3000/api/init-db`

## 📖 Usage Guide

### Starting a Therapy Session

1. Visit the home page
2. Click "Start Therapy Session"
3. Talk freely about your thoughts and feelings
4. The AI will listen and respond with empathy
5. Your conversation is automatically analyzed for patterns
6. Click "End Session" when you're done

### Viewing Your Dashboard

1. Click "Dashboard" in the navigation
2. Select the month and year you want to view
3. See your mental health score and detailed insights
4. Review recommendations and trends

### Understanding Your Mental Health Score

**Score Ranges:**
- **80-100**: Excellent mental health
- **60-79**: Good, with room for improvement
- **40-59**: Moderate concerns, consider additional support
- **20-39**: Significant concerns, professional help recommended
- **0-19**: Critical, seek immediate professional help

## 🗂️ Project Structure

```
Conversation-predictor/
├── app/
│   ├── api/
│   │   ├── chat/route.ts         # AI conversation endpoint
│   │   ├── session/route.ts      # Session management
│   │   ├── report/route.ts       # Report generation
│   │   └── init-db/route.ts      # Database initialization
│   ├── dashboard/page.tsx        # Dashboard page
│   ├── page.tsx                  # Home/chat page
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── lib/
│   ├── db.ts                     # Database layer (Postgres)
│   └── analyzer.ts               # Pattern analysis logic
├── digital_therapist/            # Original CLI version (Python)
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.js            # Tailwind CSS config
├── next.config.js                # Next.js config
├── vercel.json                   # Vercel configuration
└── DEPLOYMENT.md                 # Deployment guide
```

## 🔒 Privacy & Security

- **User IDs**: Generated locally and stored in browser localStorage
- **Data Storage**: All data stored in your Vercel Postgres database
- **API Security**: API routes are serverless functions
- **No Authentication**: Currently open to anyone with the URL
- **For Production**: Consider adding authentication (NextAuth.js)

### Privacy Notes

- Conversations are stored to enable pattern tracking
- Data is NOT shared with third parties (except Anthropic API for AI responses)
- You have full control over your Vercel database
- You can delete all data by dropping the database tables

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Vercel Postgres (PostgreSQL)
- **AI**: Anthropic Claude (via API)
- **Hosting**: Vercel (recommended)
- **State Management**: React hooks + localStorage

## ⚠️ Important Disclaimers

1. **Not a Medical Device**: This tool is for self-awareness and tracking only
2. **Not a Replacement**: Does not replace professional mental health care
3. **In Crisis?**: Contact emergency services or a crisis hotline immediately
4. **Professional Help**: Consult qualified mental health professionals for diagnosis and treatment

## 🆘 Mental Health Resources

If you're experiencing a mental health crisis:

**US:**
- National Suicide Prevention Lifeline: 988
- Crisis Text Line: Text HOME to 741741

**International:**
- Find help: https://findahelpline.com/

**Professional Help:**
- Psychology Today Therapist Finder: https://www.psychologytoday.com/
- BetterHelp: https://www.betterhelp.com/

## 🛠️ Development

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run start      # Start production server
npm run lint       # Run ESLint
```

### Environment Variables

Required:
- `ANTHROPIC_API_KEY` - Your Anthropic API key

Auto-set by Vercel (when using Vercel Postgres):
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- And other Postgres connection variables

### Database Schema

Tables:
- `sessions` - Therapy sessions
- `messages` - Conversation history
- `emotions` - Detected emotions
- `thought_patterns` - Toxic thought patterns
- `worries` - Tracked worries
- `social_patterns` - Social interactions
- `sleep_data` - Sleep logs

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Share improvements

## 📄 License

This project is open source and available for personal use.

## 🙏 Acknowledgments

- Built with [Anthropic's Claude](https://www.anthropic.com/)
- UI framework: [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Hosted on [Vercel](https://vercel.com/)
- Database: [Vercel Postgres](https://vercel.com/storage/postgres)

---

## 📚 Additional Documentation

- [Deployment Guide](DEPLOYMENT.md) - Complete Vercel deployment instructions
- [Quick Start](QUICKSTART.md) - Get started in 5 minutes
- [Original CLI README](README.md) - Documentation for the Python CLI version

---

**Remember**: Taking care of your mental health is a journey, not a destination. This tool is here to support you along the way. 💚

For questions, issues, or feature requests, please open an issue on GitHub.
