"""Analyzes and tracks patterns from therapy sessions."""

from typing import Dict, List, Any
from collections import Counter, defaultdict
from datetime import datetime, timedelta


class PatternAnalyzer:
    """Analyzes patterns in emotions, thoughts, worries, and behaviors."""

    def __init__(self, db):
        self.db = db

    def process_analysis(self, session_id: int, analysis: Dict[str, Any]):
        """Process AI analysis and store patterns in database."""

        # Store emotions
        for emotion_data in analysis.get("emotions", []):
            self.db.add_emotion(
                session_id=session_id,
                emotion=emotion_data.get("emotion", "unknown"),
                intensity=float(emotion_data.get("intensity", 5.0)),
                context=emotion_data.get("context", "")
            )

        # Store toxic thought patterns
        for pattern in analysis.get("toxic_patterns", []):
            self.db.add_thought_pattern(
                session_id=session_id,
                pattern_type=pattern.get("type", "unknown"),
                description=pattern.get("description", ""),
                is_toxic=True
            )

        # Store worries
        for worry in analysis.get("worries", []):
            self.db.add_worry(
                session_id=session_id,
                worry_text=worry.get("text", ""),
                category=worry.get("category", "general"),
                severity=float(worry.get("severity", 5.0))
            )

        # Store social patterns
        for social in analysis.get("social_patterns", []):
            self.db.add_social_pattern(
                session_id=session_id,
                interaction_type=social.get("type", "unknown"),
                description=social.get("description", ""),
                sentiment=social.get("sentiment", "neutral")
            )

        # Store sleep info if mentioned
        sleep_info = analysis.get("sleep_info", {})
        if sleep_info.get("mentioned"):
            self.db.add_sleep_data(
                session_id=session_id,
                date=sleep_info.get("date", datetime.now().date().isoformat()),
                hours=float(sleep_info.get("hours", 0)),
                quality=sleep_info.get("quality", "unknown"),
                notes=sleep_info.get("notes", "")
            )

    def analyze_emotion_trends(self, data: Dict[str, List[Dict]]) -> Dict[str, Any]:
        """Analyze emotional trends from monthly data."""
        emotions = data.get("emotions", [])

        if not emotions:
            return {"status": "No emotion data available"}

        # Count emotion frequencies
        emotion_counts = Counter(e["emotion"] for e in emotions)

        # Calculate average intensities
        emotion_intensities = defaultdict(list)
        for e in emotions:
            emotion_intensities[e["emotion"]].append(e["intensity"])

        avg_intensities = {
            emotion: sum(intensities) / len(intensities)
            for emotion, intensities in emotion_intensities.items()
        }

        # Identify dominant emotions
        dominant_emotions = emotion_counts.most_common(3)

        # Calculate overall emotional intensity trend
        intensities_over_time = [e["intensity"] for e in emotions]
        avg_intensity = sum(intensities_over_time) / len(intensities_over_time)

        return {
            "total_emotions_tracked": len(emotions),
            "unique_emotions": len(emotion_counts),
            "dominant_emotions": dominant_emotions,
            "average_intensities": avg_intensities,
            "overall_avg_intensity": round(avg_intensity, 2),
            "emotion_distribution": dict(emotion_counts)
        }

    def analyze_toxic_patterns(self, data: Dict[str, List[Dict]]) -> Dict[str, Any]:
        """Analyze toxic thought patterns."""
        patterns = [p for p in data.get("thought_patterns", []) if p.get("is_toxic")]

        if not patterns:
            return {"status": "No toxic patterns detected", "healthy_thinking": True}

        # Count pattern types
        pattern_types = Counter(p["pattern_type"] for p in patterns)

        # Most common toxic patterns
        common_patterns = pattern_types.most_common(5)

        # Pattern frequency over time
        total_patterns = len(patterns)

        return {
            "total_toxic_patterns": total_patterns,
            "unique_pattern_types": len(pattern_types),
            "most_common_patterns": common_patterns,
            "pattern_distribution": dict(pattern_types),
            "needs_attention": total_patterns > 10
        }

    def analyze_repeated_worries(self, data: Dict[str, List[Dict]]) -> Dict[str, Any]:
        """Analyze recurring worries."""
        worries = data.get("worries", [])

        if not worries:
            return {"status": "No worries tracked"}

        # Categorize worries
        worry_categories = Counter(w["category"] for w in worries)

        # Calculate average severity by category
        category_severity = defaultdict(list)
        for w in worries:
            category_severity[w["category"]].append(w["severity"])

        avg_severity_by_category = {
            cat: sum(sev) / len(sev)
            for cat, sev in category_severity.items()
        }

        # Find high-severity worries
        high_severity = [w for w in worries if w["severity"] >= 7]

        # Most common worry topics (simplified text analysis)
        worry_texts = [w["worry_text"].lower() for w in worries]

        return {
            "total_worries": len(worries),
            "worry_categories": dict(worry_categories),
            "avg_severity_by_category": avg_severity_by_category,
            "high_severity_count": len(high_severity),
            "most_worried_about": worry_categories.most_common(3),
            "needs_professional_help": len(high_severity) > 5
        }

    def analyze_social_patterns(self, data: Dict[str, List[Dict]]) -> Dict[str, Any]:
        """Analyze social interaction patterns."""
        social = data.get("social_patterns", [])

        if not social:
            return {"status": "No social patterns tracked"}

        # Count interaction types
        interaction_types = Counter(s["interaction_type"] for s in social)

        # Sentiment analysis
        sentiments = Counter(s["sentiment"] for s in social)

        # Calculate sentiment ratio
        total = len(social)
        sentiment_ratio = {
            "positive": sentiments.get("positive", 0) / total if total > 0 else 0,
            "negative": sentiments.get("negative", 0) / total if total > 0 else 0,
            "neutral": sentiments.get("neutral", 0) / total if total > 0 else 0
        }

        return {
            "total_interactions_tracked": len(social),
            "interaction_types": dict(interaction_types),
            "sentiment_distribution": dict(sentiments),
            "sentiment_ratio": sentiment_ratio,
            "social_health_score": round(sentiment_ratio["positive"] * 10, 2),
            "isolation_warning": interaction_types.get("isolation", 0) > 3
        }

    def analyze_sleep_connection(self, data: Dict[str, List[Dict]]) -> Dict[str, Any]:
        """Analyze sleep patterns and their connection to mental health."""
        sleep_data = data.get("sleep_data", [])
        emotions = data.get("emotions", [])

        if not sleep_data:
            return {"status": "No sleep data tracked"}

        # Calculate average sleep hours
        hours = [s["hours"] for s in sleep_data]
        avg_hours = sum(hours) / len(hours) if hours else 0

        # Quality distribution
        quality_counts = Counter(s["quality"] for s in sleep_data)

        # Find correlation with emotions (simplified)
        # Group emotions by date and compare with sleep quality
        poor_sleep_days = len([s for s in sleep_data if s["quality"] in ["poor", "bad"]])
        good_sleep_days = len([s for s in sleep_data if s["quality"] in ["good", "excellent"]])

        return {
            "total_sleep_entries": len(sleep_data),
            "average_hours": round(avg_hours, 2),
            "sleep_quality_distribution": dict(quality_counts),
            "poor_sleep_days": poor_sleep_days,
            "good_sleep_days": good_sleep_days,
            "sleep_health_score": round((good_sleep_days / len(sleep_data)) * 10, 2) if sleep_data else 0,
            "recommendation": self._get_sleep_recommendation(avg_hours, poor_sleep_days)
        }

    def _get_sleep_recommendation(self, avg_hours: float, poor_days: int) -> str:
        """Get sleep recommendation based on data."""
        if avg_hours < 6:
            return "Critical: Severely insufficient sleep. Consult a healthcare provider."
        elif avg_hours < 7:
            return "Warning: Below recommended sleep duration. Try to sleep 7-9 hours."
        elif poor_days > 10:
            return "Concern: Many poor quality sleep days. Consider sleep hygiene improvements."
        elif avg_hours > 9:
            return "Note: Higher than average sleep. Monitor for excessive sleeping."
        else:
            return "Good: Sleep duration is within healthy range."
