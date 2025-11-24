export interface EmotionAnalysis {
  total_emotions_tracked: number;
  unique_emotions: number;
  dominant_emotions: [string, number][];
  average_intensities: Record<string, number>;
  overall_avg_intensity: number;
  emotion_distribution: Record<string, number>;
}

export interface ToxicPatternsAnalysis {
  total_toxic_patterns: number;
  unique_pattern_types: number;
  most_common_patterns: [string, number][];
  pattern_distribution: Record<string, number>;
  needs_attention: boolean;
  healthy_thinking?: boolean;
}

export interface WorriesAnalysis {
  total_worries: number;
  worry_categories: Record<string, number>;
  avg_severity_by_category: Record<string, number>;
  high_severity_count: number;
  most_worried_about: [string, number][];
  needs_professional_help: boolean;
}

export interface SocialPatternsAnalysis {
  total_interactions_tracked: number;
  interaction_types: Record<string, number>;
  sentiment_distribution: Record<string, number>;
  sentiment_ratio: {
    positive: number;
    negative: number;
    neutral: number;
  };
  social_health_score: number;
  isolation_warning: boolean;
}

export interface SleepAnalysis {
  total_sleep_entries: number;
  average_hours: number;
  sleep_quality_distribution: Record<string, number>;
  poor_sleep_days: number;
  good_sleep_days: number;
  sleep_health_score: number;
  recommendation: string;
}

export class PatternAnalyzer {
  analyzeEmotionTrends(emotions: any[]): EmotionAnalysis {
    if (!emotions.length) {
      return {
        total_emotions_tracked: 0,
        unique_emotions: 0,
        dominant_emotions: [],
        average_intensities: {},
        overall_avg_intensity: 0,
        emotion_distribution: {},
      };
    }

    const emotionCounts: Record<string, number> = {};
    const emotionIntensities: Record<string, number[]> = {};

    emotions.forEach((e) => {
      emotionCounts[e.emotion] = (emotionCounts[e.emotion] || 0) + 1;
      if (!emotionIntensities[e.emotion]) {
        emotionIntensities[e.emotion] = [];
      }
      emotionIntensities[e.emotion].push(e.intensity);
    });

    const avgIntensities: Record<string, number> = {};
    Object.keys(emotionIntensities).forEach((emotion) => {
      const intensities = emotionIntensities[emotion];
      avgIntensities[emotion] = intensities.reduce((a, b) => a + b, 0) / intensities.length;
    });

    const dominantEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3) as [string, number][];

    const allIntensities = emotions.map((e) => e.intensity);
    const avgIntensity = allIntensities.reduce((a, b) => a + b, 0) / allIntensities.length;

    return {
      total_emotions_tracked: emotions.length,
      unique_emotions: Object.keys(emotionCounts).length,
      dominant_emotions: dominantEmotions,
      average_intensities: avgIntensities,
      overall_avg_intensity: Math.round(avgIntensity * 100) / 100,
      emotion_distribution: emotionCounts,
    };
  }

  analyzeToxicPatterns(patterns: any[]): ToxicPatternsAnalysis {
    const toxicPatterns = patterns.filter((p) => p.is_toxic);

    if (!toxicPatterns.length) {
      return {
        total_toxic_patterns: 0,
        unique_pattern_types: 0,
        most_common_patterns: [],
        pattern_distribution: {},
        needs_attention: false,
        healthy_thinking: true,
      };
    }

    const patternCounts: Record<string, number> = {};
    toxicPatterns.forEach((p) => {
      patternCounts[p.pattern_type] = (patternCounts[p.pattern_type] || 0) + 1;
    });

    const commonPatterns = Object.entries(patternCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5) as [string, number][];

    return {
      total_toxic_patterns: toxicPatterns.length,
      unique_pattern_types: Object.keys(patternCounts).length,
      most_common_patterns: commonPatterns,
      pattern_distribution: patternCounts,
      needs_attention: toxicPatterns.length > 10,
    };
  }

  analyzeRepeatedWorries(worries: any[]): WorriesAnalysis {
    if (!worries.length) {
      return {
        total_worries: 0,
        worry_categories: {},
        avg_severity_by_category: {},
        high_severity_count: 0,
        most_worried_about: [],
        needs_professional_help: false,
      };
    }

    const categories: Record<string, number> = {};
    const categorySeverity: Record<string, number[]> = {};

    worries.forEach((w) => {
      categories[w.category] = (categories[w.category] || 0) + 1;
      if (!categorySeverity[w.category]) {
        categorySeverity[w.category] = [];
      }
      categorySeverity[w.category].push(w.severity);
    });

    const avgSeverity: Record<string, number> = {};
    Object.keys(categorySeverity).forEach((cat) => {
      const severities = categorySeverity[cat];
      avgSeverity[cat] = severities.reduce((a, b) => a + b, 0) / severities.length;
    });

    const highSeverity = worries.filter((w) => w.severity >= 7);

    const mostWorried = Object.entries(categories)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3) as [string, number][];

    return {
      total_worries: worries.length,
      worry_categories: categories,
      avg_severity_by_category: avgSeverity,
      high_severity_count: highSeverity.length,
      most_worried_about: mostWorried,
      needs_professional_help: highSeverity.length > 5,
    };
  }

  analyzeSocialPatterns(social: any[]): SocialPatternsAnalysis {
    if (!social.length) {
      return {
        total_interactions_tracked: 0,
        interaction_types: {},
        sentiment_distribution: {},
        sentiment_ratio: { positive: 0, negative: 0, neutral: 0 },
        social_health_score: 0,
        isolation_warning: false,
      };
    }

    const interactionTypes: Record<string, number> = {};
    const sentiments: Record<string, number> = {};

    social.forEach((s) => {
      interactionTypes[s.interaction_type] = (interactionTypes[s.interaction_type] || 0) + 1;
      sentiments[s.sentiment] = (sentiments[s.sentiment] || 0) + 1;
    });

    const total = social.length;
    const sentimentRatio = {
      positive: (sentiments.positive || 0) / total,
      negative: (sentiments.negative || 0) / total,
      neutral: (sentiments.neutral || 0) / total,
    };

    return {
      total_interactions_tracked: total,
      interaction_types: interactionTypes,
      sentiment_distribution: sentiments,
      sentiment_ratio: sentimentRatio,
      social_health_score: Math.round(sentimentRatio.positive * 100) / 10,
      isolation_warning: (interactionTypes.isolation || 0) > 3,
    };
  }

  analyzeSleepConnection(sleepData: any[]): SleepAnalysis {
    if (!sleepData.length) {
      return {
        total_sleep_entries: 0,
        average_hours: 0,
        sleep_quality_distribution: {},
        poor_sleep_days: 0,
        good_sleep_days: 0,
        sleep_health_score: 0,
        recommendation: 'No sleep data available',
      };
    }

    const hours = sleepData.map((s) => s.hours);
    const avgHours = hours.reduce((a, b) => a + b, 0) / hours.length;

    const qualityCounts: Record<string, number> = {};
    sleepData.forEach((s) => {
      qualityCounts[s.quality] = (qualityCounts[s.quality] || 0) + 1;
    });

    const poorDays = (qualityCounts.poor || 0) + (qualityCounts.bad || 0);
    const goodDays = (qualityCounts.good || 0) + (qualityCounts.excellent || 0);

    const sleepScore = (goodDays / sleepData.length) * 10;

    return {
      total_sleep_entries: sleepData.length,
      average_hours: Math.round(avgHours * 100) / 100,
      sleep_quality_distribution: qualityCounts,
      poor_sleep_days: poorDays,
      good_sleep_days: goodDays,
      sleep_health_score: Math.round(sleepScore * 100) / 100,
      recommendation: this.getSleepRecommendation(avgHours, poorDays),
    };
  }

  private getSleepRecommendation(avgHours: number, poorDays: number): string {
    if (avgHours < 6) {
      return 'Critical: Severely insufficient sleep. Consult a healthcare provider.';
    } else if (avgHours < 7) {
      return 'Warning: Below recommended sleep duration. Try to sleep 7-9 hours.';
    } else if (poorDays > 10) {
      return 'Concern: Many poor quality sleep days. Consider sleep hygiene improvements.';
    } else if (avgHours > 9) {
      return 'Note: Higher than average sleep. Monitor for excessive sleeping.';
    } else {
      return 'Good: Sleep duration is within healthy range.';
    }
  }
}

export const analyzer = new PatternAnalyzer();
