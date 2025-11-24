'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Report {
  mental_health_score: number;
  sessions_count: number;
  key_concerns: string[];
  positive_trends: string[];
  recommendations: string[];
  emotion_trends: any;
  toxic_thought_patterns: any;
  repeated_worries: any;
  social_patterns: any;
  sleep_connection: any;
}

export default function Dashboard() {
  const [userId, setUserId] = useState<string>('');
  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem('userId') || 'anonymous';
      setUserId(id);
    }
  }, []);

  const loadReport = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/report?userId=${userId}&year=${selectedYear}&month=${selectedMonth}`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setReport(data);
    } catch (error) {
      console.error('Failed to load report:', error);
      alert('Failed to load report. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadReport();
    }
  }, [userId, selectedMonth, selectedYear]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    if (score >= 20) return 'Needs Attention';
    return 'Critical';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              📊 Mental Health Dashboard
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track your mental health journey
            </p>
          </div>
          <nav className="flex gap-4">
            <Link
              href="/"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Start Session
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Month/Year Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="flex gap-4 items-center">
            <label className="text-gray-700 dark:text-gray-300 font-medium">
              Report Period:
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <option key={month} value={month}>
                  {new Date(2000, month - 1).toLocaleString('default', {
                    month: 'long',
                  })}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
            >
              {Array.from(
                { length: 5 },
                (_, i) => new Date().getFullYear() - i
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <button
              onClick={loadReport}
              disabled={isLoading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        {report ? (
          <>
            {/* Mental Health Score */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 mb-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
                  Overall Mental Health Score
                </h2>
                <div
                  className={`text-7xl font-bold mb-2 ${getScoreColor(
                    report.mental_health_score
                  )}`}
                >
                  {report.mental_health_score}
                  <span className="text-3xl">/100</span>
                </div>
                <div className="text-xl text-gray-600 dark:text-gray-400">
                  {getScoreLabel(report.mental_health_score)}
                </div>
                <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Based on {report.sessions_count} therapy sessions
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Key Concerns */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-2">⚠️</span>
                  Key Concerns
                </h3>
                {report.key_concerns.length > 0 ? (
                  <ul className="space-y-2">
                    {report.key_concerns.map((concern, index) => (
                      <li
                        key={index}
                        className="text-gray-700 dark:text-gray-300 flex items-start"
                      >
                        <span className="text-red-500 mr-2">•</span>
                        {concern}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No major concerns identified
                  </p>
                )}
              </div>

              {/* Positive Trends */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <span className="text-2xl mr-2">✅</span>
                  Positive Trends
                </h3>
                {report.positive_trends.length > 0 ? (
                  <ul className="space-y-2">
                    {report.positive_trends.map((trend, index) => (
                      <li
                        key={index}
                        className="text-gray-700 dark:text-gray-300 flex items-start"
                      >
                        <span className="text-green-500 mr-2">•</span>
                        {trend}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    Keep working on your mental health
                  </p>
                )}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="text-2xl mr-2">💡</span>
                Recommendations
              </h3>
              <ul className="space-y-3">
                {report.recommendations.map((rec, index) => (
                  <li
                    key={index}
                    className="text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg"
                  >
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Detailed Analytics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Emotions */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🎭 Emotions
                </h3>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total tracked: {report.emotion_trends.total_emotions_tracked}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Avg intensity:{' '}
                    {report.emotion_trends.overall_avg_intensity || 0}/10
                  </div>
                  {report.emotion_trends.dominant_emotions?.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                        Top emotions:
                      </div>
                      {report.emotion_trends.dominant_emotions.map(
                        ([emotion, count]: [string, number]) => (
                          <div
                            key={emotion}
                            className="text-sm text-gray-700 dark:text-gray-300"
                          >
                            {emotion}: {count}x
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Thought Patterns */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  🧠 Thought Patterns
                </h3>
                <div className="space-y-2">
                  {report.toxic_thought_patterns.healthy_thinking ? (
                    <div className="text-green-600 font-medium">
                      ✓ Healthy thinking maintained
                    </div>
                  ) : (
                    <>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Toxic patterns:{' '}
                        {report.toxic_thought_patterns.total_toxic_patterns}
                      </div>
                      {report.toxic_thought_patterns.most_common_patterns
                        ?.length > 0 && (
                        <div className="mt-3">
                          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                            Most common:
                          </div>
                          {report.toxic_thought_patterns.most_common_patterns.map(
                            ([pattern, count]: [string, number]) => (
                              <div
                                key={pattern}
                                className="text-sm text-gray-700 dark:text-gray-300"
                              >
                                {pattern}: {count}x
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Worries */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  😰 Worries
                </h3>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total: {report.repeated_worries.total_worries}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    High severity: {report.repeated_worries.high_severity_count}
                  </div>
                  {report.repeated_worries.most_worried_about?.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
                        Main categories:
                      </div>
                      {report.repeated_worries.most_worried_about.map(
                        ([category, count]: [string, number]) => (
                          <div
                            key={category}
                            className="text-sm text-gray-700 dark:text-gray-300"
                          >
                            {category}: {count}x
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Social Patterns */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  👥 Social
                </h3>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Interactions: {report.social_patterns.total_interactions_tracked}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Health score: {report.social_patterns.social_health_score}/10
                  </div>
                  {report.social_patterns.sentiment_ratio && (
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Positive:</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {(report.social_patterns.sentiment_ratio.positive * 100).toFixed(
                            0
                          )}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Neutral:</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {(report.social_patterns.sentiment_ratio.neutral * 100).toFixed(
                            0
                          )}
                          %
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-red-600">Negative:</span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {(report.social_patterns.sentiment_ratio.negative * 100).toFixed(
                            0
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sleep */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  😴 Sleep
                </h3>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Avg hours: {report.sleep_connection.average_hours}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Health score: {report.sleep_connection.sleep_health_score}/10
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Good days: {report.sleep_connection.good_sleep_days}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Poor days: {report.sleep_connection.poor_sleep_days}
                  </div>
                  {report.sleep_connection.recommendation && (
                    <div className="mt-3 text-xs bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
                      {report.sleep_connection.recommendation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {isLoading ? 'Loading report...' : 'No data available for this period'}
            </p>
            {!isLoading && (
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">
                Start some therapy sessions to generate insights
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
