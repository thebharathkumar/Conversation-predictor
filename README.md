# 🧠 Digital Therapist AI

An AI-powered mental health companion that provides compassionate conversations while intelligently tracking your emotional wellbeing, thought patterns, and life factors.

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
  - Fortune telling
  - And more...
- Tracks frequency and patterns of unhealthy thinking
- Helps build awareness for cognitive restructuring

### 4. **Repeated Worries Tracker**
- Logs and categorizes recurring concerns
- Measures worry severity
- Identifies patterns in what causes stress
- Tracks worry categories (work, relationships, health, etc.)

### 5. **Social Patterns Analysis**
- Monitors social interaction types
- Analyzes sentiment (positive, negative, neutral)
- Detects isolation patterns
- Calculates social health score

### 6. **Sleep Connection Tracking**
- Log sleep hours and quality
- Correlates sleep patterns with mental health
- Provides sleep recommendations
- Tracks sleep health score

### 7. **Monthly Mental Health Reports**
- Comprehensive analysis of all tracked data
- Overall mental health score (0-100)
- Visual charts and graphs
- Key concerns and positive trends
- Personalized recommendations
- Multiple export formats (text, JSON, visual)

## 🚀 Installation

### Prerequisites
- Python 3.8 or higher
- An Anthropic API key ([Get one here](https://console.anthropic.com/))

### Setup Steps

1. **Clone or download this repository**
   ```bash
   cd Conversation-predictor
   ```

2. **Create a virtual environment (recommended)**
   ```bash
   python -m venv venv

   # On Linux/Mac:
   source venv/bin/activate

   # On Windows:
   venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up your API key**
   ```bash
   # Copy the example env file
   cp .env.example .env

   # Edit .env and add your Anthropic API key
   # ANTHROPIC_API_KEY=your_api_key_here
   ```

5. **Run the application**
   ```bash
   python main.py
   ```

## 📖 Usage Guide

### Starting a Therapy Session

1. Select option `1` from the main menu
2. Talk freely about your thoughts, feelings, and experiences
3. The AI will listen and respond with empathy and support
4. Your conversation is automatically analyzed for patterns

**During a session, you can:**
- Type `sleep` to log sleep data
- Type `end` to finish the session
- Press `Ctrl+C` to interrupt

### Logging Sleep Data

During any session, type `sleep` and you'll be prompted for:
- Date (defaults to today)
- Hours slept
- Sleep quality (excellent/good/fair/poor/bad)
- Optional notes

### Generating Monthly Reports

1. Select option `2` from the main menu
2. Enter the year and month
3. Choose export format:
   - **text**: Formatted text report with all insights
   - **json**: Machine-readable JSON data
   - **visual**: Text report + charts/graphs as PNG

Reports are saved to the `reports/` directory.

### Understanding Your Reports

#### Mental Health Score (0-100)
A holistic score based on:
- Emotional intensity levels
- Presence of toxic thought patterns
- Severity and frequency of worries
- Social interaction quality
- Sleep patterns

**Score Ranges:**
- 80-100: Excellent mental health
- 60-79: Good, with room for improvement
- 40-59: Moderate concerns, consider additional support
- 20-39: Significant concerns, professional help recommended
- 0-19: Critical, seek immediate professional help

#### Key Sections in Reports

1. **Overall Insights**
   - Mental health score
   - Key concerns identified
   - Positive trends
   - Personalized recommendations

2. **Emotional Trends**
   - Dominant emotions
   - Average intensities
   - Emotion frequency distribution

3. **Thought Patterns**
   - Toxic patterns detected
   - Pattern types and frequencies
   - Cognitive distortion analysis

4. **Repeated Worries**
   - Total worries tracked
   - Categories and their frequency
   - High-severity worry count

5. **Social Patterns**
   - Interaction types
   - Sentiment breakdown
   - Social health score
   - Isolation warnings

6. **Sleep Connection**
   - Average sleep hours
   - Sleep quality distribution
   - Sleep health score
   - Recommendations

## 🎯 Tips for Best Results

### During Sessions
- **Be honest and open**: The AI is non-judgmental
- **Provide context**: Details help with better analysis
- **Regular sessions**: Weekly or bi-weekly sessions work best
- **Log sleep consistently**: Helps identify correlations

### General Tips
- Use the tool as a supplement, not a replacement for therapy
- Review your monthly reports to identify patterns
- Act on the recommendations provided
- Share insights with your actual therapist if you have one

## 🗂️ Project Structure

```
Conversation-predictor/
├── main.py                          # Main application entry point
├── requirements.txt                 # Python dependencies
├── .env.example                     # Example environment file
├── digital_therapist/
│   ├── core/
│   │   ├── database.py             # SQLite database layer
│   │   └── ai_therapist.py         # AI conversation handler
│   ├── trackers/
│   │   └── pattern_analyzer.py     # Pattern analysis logic
│   ├── utils/
│   │   └── report_generator.py     # Report generation
│   └── data/
│       └── therapy.db              # Your data (auto-created)
└── reports/                         # Generated reports (auto-created)
```

## 🔒 Privacy & Data

- **All data is stored locally** in an SQLite database on your computer
- **No data is sent anywhere** except to Anthropic's API for AI responses
- Conversation content is stored to enable pattern tracking
- You can delete the database file anytime to erase all data
- API communications are encrypted via HTTPS

## ⚠️ Important Disclaimers

1. **Not a Medical Device**: This tool is for self-awareness and tracking only
2. **Not a Replacement**: Does not replace professional mental health care
3. **In Crisis?**: Contact emergency services or a crisis hotline immediately
4. **Professional Help**: Consult qualified mental health professionals for diagnosis and treatment
5. **No Guarantees**: Results and insights are AI-generated and may not always be accurate

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
- Talkspace: https://www.talkspace.com/

## 🛠️ Troubleshooting

### "ANTHROPIC_API_KEY not found" error
- Make sure you created a `.env` file (not `.env.example`)
- Verify your API key is correct
- Check that the `.env` file is in the project root directory

### Database errors
- Ensure the `digital_therapist/data/` directory exists
- Check file permissions
- Try deleting the `.db` file to start fresh (loses all data)

### Import errors
- Make sure you're in the virtual environment
- Run `pip install -r requirements.txt` again
- Check Python version (3.8+ required)

### Report generation fails
- Ensure the `reports/` directory can be created
- Check disk space
- For visual reports, matplotlib needs to be properly installed

## 🤝 Contributing

This is a personal mental health tool, but suggestions are welcome! Feel free to:
- Report bugs
- Suggest features
- Share improvements

## 📄 License

This project is open source and available for personal use. Not intended for commercial purposes.

## 🙏 Acknowledgments

- Built with [Anthropic's Claude](https://www.anthropic.com/)
- UI powered by [Rich](https://github.com/Textualize/rich)
- Data visualization with [Matplotlib](https://matplotlib.org/)

---

**Remember**: Taking care of your mental health is a journey, not a destination. This tool is here to support you along the way. 💚

For questions or issues, please refer to the documentation or seek professional guidance.
