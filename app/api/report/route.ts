import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { analyzer } from '@/lib/analyzer';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get monthly data
    const data = await db.getMonthlyData(userId, year, month);

    // Analyze all patterns
    const emotionAnalysis = analyzer.analyzeEmotionTrends(data.emotions);
    const toxicAnalysis = analyzer.analyzeToxicPatterns(data.thought_patterns);
    const worryAnalysis = analyzer.analyzeRepeatedWorries(data.worries);
    const socialAnalysis = analyzer.analyzeSocialPatterns(data.social_patterns);
    const sleepAnalysis = analyzer.analyzeSleepConnection(data.sleep_data);

    // Calculate overall mental health score
    let score = 50; // Base score

    if (emotionAnalysis.overall_avg_intensity < 7) {
      score += 10;
    } else {
      score -= 10;
    }

    if (toxicAnalysis.total_toxic_patterns > 10) {
      score -= 15;
    } else if (toxicAnalysis.healthy_thinking) {
      score += 15;
    }

    if (worryAnalysis.needs_professional_help) {
      score -= 10;
    }

    if (socialAnalysis.isolation_warning) {
      score -= 10;
    }

    if (socialAnalysis.social_health_score > 7) {
      score += 10;
    }

    if (sleepAnalysis.sleep_health_score < 5) {
      score -= 10;
    } else if (sleepAnalysis.sleep_health_score > 7) {
      score += 10;
    }

    score = Math.max(0, Math.min(100, score));

    // Generate key concerns and positive trends
    const keyConcerns = [];
    const positiveTrends = [];
    const recommendations = [];

    if (emotionAnalysis.overall_avg_intensity >= 7) {
      keyConcerns.push('High emotional intensity detected');
    } else {
      positiveTrends.push('Emotional intensity within healthy range');
    }

    if (toxicAnalysis.total_toxic_patterns > 10) {
      keyConcerns.push('Frequent toxic thought patterns');
      recommendations.push('Consider cognitive behavioral therapy (CBT) techniques');
    } else if (toxicAnalysis.healthy_thinking) {
      positiveTrends.push('Healthy thought patterns maintained');
    }

    if (worryAnalysis.needs_professional_help) {
      keyConcerns.push('High number of severe worries');
      recommendations.push('Strongly recommend consulting a mental health professional');
    }

    if (socialAnalysis.isolation_warning) {
      keyConcerns.push('Social isolation patterns detected');
      recommendations.push('Try to increase social interactions gradually');
    }

    if (socialAnalysis.social_health_score > 7) {
      positiveTrends.push('Positive social interactions');
    }

    if (sleepAnalysis.sleep_health_score < 5) {
      keyConcerns.push('Poor sleep quality');
      recommendations.push(sleepAnalysis.recommendation);
    } else if (sleepAnalysis.sleep_health_score > 7) {
      positiveTrends.push('Good sleep patterns maintained');
    }

    if (recommendations.length === 0) {
      recommendations.push('Continue current self-care practices');
      recommendations.push('Maintain regular therapy sessions');
    }

    const report = {
      report_date: new Date().toISOString(),
      period: `${year}-${month.toString().padStart(2, '0')}`,
      sessions_count: data.sessions.length,
      mental_health_score: score,
      key_concerns: keyConcerns,
      positive_trends: positiveTrends,
      recommendations: recommendations,
      emotion_trends: emotionAnalysis,
      toxic_thought_patterns: toxicAnalysis,
      repeated_worries: worryAnalysis,
      social_patterns: socialAnalysis,
      sleep_connection: sleepAnalysis,
    };

    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate report' },
      { status: 500 }
    );
  }
}
