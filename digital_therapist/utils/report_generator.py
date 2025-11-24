"""Generates comprehensive monthly mental health reports."""

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, Any
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend


class ReportGenerator:
    """Generates detailed monthly mental health reports."""

    def __init__(self, db, analyzer):
        self.db = db
        self.analyzer = analyzer

    def generate_monthly_report(self, year: int, month: int,
                                export_format: str = "text") -> str:
        """Generate a comprehensive monthly report."""

        # Get all monthly data
        data = self.db.get_monthly_data(year, month)

        # Analyze all patterns
        emotion_analysis = self.analyzer.analyze_emotion_trends(data)
        toxic_analysis = self.analyzer.analyze_toxic_patterns(data)
        worry_analysis = self.analyzer.analyze_repeated_worries(data)
        social_analysis = self.analyzer.analyze_social_patterns(data)
        sleep_analysis = self.analyzer.analyze_sleep_connection(data)

        # Compile report
        report_data = {
            "report_date": datetime.now().isoformat(),
            "period": f"{year}-{month:02d}",
            "sessions_count": len(data.get("sessions", [])),
            "emotion_trends": emotion_analysis,
            "toxic_thought_patterns": toxic_analysis,
            "repeated_worries": worry_analysis,
            "social_patterns": social_analysis,
            "sleep_connection": sleep_analysis,
        }

        # Generate overall insights
        report_data["overall_insights"] = self._generate_insights(report_data)

        if export_format == "json":
            return self._export_json(report_data, year, month)
        elif export_format == "visual":
            return self._export_visual(report_data, data, year, month)
        else:
            return self._export_text(report_data, year, month)

    def _generate_insights(self, report_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate overall insights and recommendations."""
        insights = {
            "mental_health_score": 0,
            "key_concerns": [],
            "positive_trends": [],
            "recommendations": []
        }

        # Calculate mental health score (0-100)
        score = 50  # Base score

        # Adjust based on various factors
        emotion_data = report_data.get("emotion_trends", {})
        if emotion_data.get("overall_avg_intensity", 5) < 7:
            score += 10
            insights["positive_trends"].append("Emotional intensity within healthy range")
        else:
            score -= 10
            insights["key_concerns"].append("High emotional intensity detected")

        # Toxic patterns
        toxic_data = report_data.get("toxic_thought_patterns", {})
        if toxic_data.get("total_toxic_patterns", 0) > 10:
            score -= 15
            insights["key_concerns"].append("Frequent toxic thought patterns")
            insights["recommendations"].append(
                "Consider cognitive behavioral therapy (CBT) techniques"
            )
        elif toxic_data.get("healthy_thinking"):
            score += 15
            insights["positive_trends"].append("Healthy thought patterns maintained")

        # Worries
        worry_data = report_data.get("repeated_worries", {})
        if worry_data.get("needs_professional_help"):
            score -= 10
            insights["key_concerns"].append("High number of severe worries")
            insights["recommendations"].append(
                "Strongly recommend consulting a mental health professional"
            )

        # Social patterns
        social_data = report_data.get("social_patterns", {})
        if social_data.get("isolation_warning"):
            score -= 10
            insights["key_concerns"].append("Social isolation patterns detected")
            insights["recommendations"].append(
                "Try to increase social interactions gradually"
            )

        social_score = social_data.get("social_health_score", 5)
        if social_score > 7:
            score += 10
            insights["positive_trends"].append("Positive social interactions")

        # Sleep
        sleep_data = report_data.get("sleep_connection", {})
        sleep_score = sleep_data.get("sleep_health_score", 5)
        if sleep_score < 5:
            score -= 10
            insights["key_concerns"].append("Poor sleep quality")
            insights["recommendations"].append(sleep_data.get("recommendation", ""))
        elif sleep_score > 7:
            score += 10
            insights["positive_trends"].append("Good sleep patterns maintained")

        # Ensure score is within 0-100
        insights["mental_health_score"] = max(0, min(100, score))

        # Add general recommendations if none exist
        if not insights["recommendations"]:
            insights["recommendations"].append(
                "Continue current self-care practices"
            )
            insights["recommendations"].append(
                "Maintain regular therapy sessions"
            )

        return insights

    def _export_text(self, report_data: Dict[str, Any], year: int, month: int) -> str:
        """Export report as formatted text."""
        month_name = datetime(year, month, 1).strftime("%B %Y")

        report = f"""
╔══════════════════════════════════════════════════════════════╗
║        DIGITAL THERAPIST AI - MONTHLY MENTAL HEALTH REPORT         ║
╚══════════════════════════════════════════════════════════════╝

Report Period: {month_name}
Generated: {datetime.now().strftime("%Y-%m-%d %H:%M")}
Total Sessions: {report_data['sessions_count']}

═══════════════════════════════════════════════════════════════

📊 OVERALL MENTAL HEALTH SCORE: {report_data['overall_insights']['mental_health_score']}/100

"""

        # Key Concerns
        if report_data['overall_insights']['key_concerns']:
            report += "⚠️  KEY CONCERNS:\n"
            for concern in report_data['overall_insights']['key_concerns']:
                report += f"   • {concern}\n"
            report += "\n"

        # Positive Trends
        if report_data['overall_insights']['positive_trends']:
            report += "✅ POSITIVE TRENDS:\n"
            for trend in report_data['overall_insights']['positive_trends']:
                report += f"   • {trend}\n"
            report += "\n"

        # Recommendations
        report += "💡 RECOMMENDATIONS:\n"
        for rec in report_data['overall_insights']['recommendations']:
            report += f"   • {rec}\n"
        report += "\n"

        report += "═══════════════════════════════════════════════════════════════\n\n"

        # Emotion Trends
        report += "🎭 EMOTIONAL TRENDS\n"
        emotion_data = report_data['emotion_trends']
        if emotion_data.get('total_emotions_tracked'):
            report += f"   Total emotions tracked: {emotion_data['total_emotions_tracked']}\n"
            report += f"   Average intensity: {emotion_data.get('overall_avg_intensity', 'N/A')}/10\n"
            report += "   Dominant emotions:\n"
            for emotion, count in emotion_data.get('dominant_emotions', []):
                avg_int = emotion_data['average_intensities'].get(emotion, 0)
                report += f"      • {emotion.capitalize()}: {count} times (avg intensity: {avg_int:.1f})\n"
        else:
            report += "   No emotion data available\n"
        report += "\n"

        # Toxic Thought Patterns
        report += "🧠 THOUGHT PATTERNS\n"
        toxic_data = report_data['toxic_thought_patterns']
        if toxic_data.get('total_toxic_patterns'):
            report += f"   Toxic patterns detected: {toxic_data['total_toxic_patterns']}\n"
            report += "   Most common patterns:\n"
            for pattern, count in toxic_data.get('most_common_patterns', []):
                report += f"      • {pattern}: {count} times\n"
        else:
            report += "   ✓ Healthy thinking patterns maintained\n"
        report += "\n"

        # Repeated Worries
        report += "😰 REPEATED WORRIES\n"
        worry_data = report_data['repeated_worries']
        if worry_data.get('total_worries'):
            report += f"   Total worries tracked: {worry_data['total_worries']}\n"
            report += f"   High severity worries: {worry_data.get('high_severity_count', 0)}\n"
            report += "   Main worry categories:\n"
            for category, count in worry_data.get('most_worried_about', []):
                avg_sev = worry_data['avg_severity_by_category'].get(category, 0)
                report += f"      • {category}: {count} times (avg severity: {avg_sev:.1f})\n"
        else:
            report += "   No worries tracked\n"
        report += "\n"

        # Social Patterns
        report += "👥 SOCIAL PATTERNS\n"
        social_data = report_data['social_patterns']
        if social_data.get('total_interactions_tracked'):
            report += f"   Interactions tracked: {social_data['total_interactions_tracked']}\n"
            report += f"   Social health score: {social_data.get('social_health_score', 0)}/10\n"
            report += "   Sentiment breakdown:\n"
            for sentiment, ratio in social_data.get('sentiment_ratio', {}).items():
                report += f"      • {sentiment.capitalize()}: {ratio*100:.1f}%\n"
        else:
            report += "   No social data available\n"
        report += "\n"

        # Sleep Connection
        report += "😴 SLEEP PATTERNS\n"
        sleep_data = report_data['sleep_connection']
        if sleep_data.get('total_sleep_entries'):
            report += f"   Sleep entries: {sleep_data['total_sleep_entries']}\n"
            report += f"   Average hours: {sleep_data.get('average_hours', 0)} hours/night\n"
            report += f"   Sleep health score: {sleep_data.get('sleep_health_score', 0)}/10\n"
            report += f"   Good sleep days: {sleep_data.get('good_sleep_days', 0)}\n"
            report += f"   Poor sleep days: {sleep_data.get('poor_sleep_days', 0)}\n"
            report += f"   ℹ️  {sleep_data.get('recommendation', '')}\n"
        else:
            report += "   No sleep data available\n"
        report += "\n"

        report += "═══════════════════════════════════════════════════════════════\n"
        report += "\n💚 Remember: This report is for self-awareness and tracking.\n"
        report += "   Always consult qualified mental health professionals for\n"
        report += "   diagnosis and treatment.\n"
        report += "═══════════════════════════════════════════════════════════════\n"

        # Save to file
        output_dir = Path("reports")
        output_dir.mkdir(exist_ok=True)
        filename = output_dir / f"mental_health_report_{year}_{month:02d}.txt"

        with open(filename, 'w') as f:
            f.write(report)

        return str(filename)

    def _export_json(self, report_data: Dict[str, Any], year: int, month: int) -> str:
        """Export report as JSON."""
        output_dir = Path("reports")
        output_dir.mkdir(exist_ok=True)
        filename = output_dir / f"mental_health_report_{year}_{month:02d}.json"

        with open(filename, 'w') as f:
            json.dump(report_data, f, indent=2)

        return str(filename)

    def _export_visual(self, report_data: Dict[str, Any],
                      data: Dict[str, List[Dict]], year: int, month: int) -> str:
        """Export report with visualizations."""
        output_dir = Path("reports")
        output_dir.mkdir(exist_ok=True)

        # Create text report first
        text_file = self._export_text(report_data, year, month)

        # Create visualizations
        fig, axes = plt.subplots(2, 2, figsize=(14, 10))
        fig.suptitle(f'Mental Health Report - {datetime(year, month, 1).strftime("%B %Y")}',
                     fontsize=16, fontweight='bold')

        # 1. Emotion distribution
        emotion_data = report_data['emotion_trends']
        if emotion_data.get('emotion_distribution'):
            emotions = list(emotion_data['emotion_distribution'].keys())
            counts = list(emotion_data['emotion_distribution'].values())
            axes[0, 0].bar(emotions, counts, color='skyblue')
            axes[0, 0].set_title('Emotion Distribution')
            axes[0, 0].set_xlabel('Emotions')
            axes[0, 0].set_ylabel('Frequency')
            axes[0, 0].tick_params(axis='x', rotation=45)

        # 2. Worry categories
        worry_data = report_data['repeated_worries']
        if worry_data.get('worry_categories'):
            categories = list(worry_data['worry_categories'].keys())
            worry_counts = list(worry_data['worry_categories'].values())
            axes[0, 1].pie(worry_counts, labels=categories, autopct='%1.1f%%', startangle=90)
            axes[0, 1].set_title('Worry Categories')

        # 3. Social sentiment
        social_data = report_data['social_patterns']
        if social_data.get('sentiment_ratio'):
            sentiments = list(social_data['sentiment_ratio'].keys())
            ratios = [social_data['sentiment_ratio'][s] * 100 for s in sentiments]
            colors = {'positive': 'green', 'neutral': 'gray', 'negative': 'red'}
            bar_colors = [colors.get(s, 'blue') for s in sentiments]
            axes[1, 0].bar(sentiments, ratios, color=bar_colors)
            axes[1, 0].set_title('Social Interaction Sentiment')
            axes[1, 0].set_ylabel('Percentage')

        # 4. Overall scores
        scores = {
            'Mental Health': report_data['overall_insights']['mental_health_score'],
            'Social Health': social_data.get('social_health_score', 0) * 10,
            'Sleep Health': report_data['sleep_connection'].get('sleep_health_score', 0) * 10
        }
        score_names = list(scores.keys())
        score_values = list(scores.values())
        bars = axes[1, 1].barh(score_names, score_values, color='lightcoral')
        axes[1, 1].set_xlim(0, 100)
        axes[1, 1].set_title('Health Scores (0-100)')
        axes[1, 1].set_xlabel('Score')

        # Add value labels on bars
        for bar in bars:
            width = bar.get_width()
            axes[1, 1].text(width, bar.get_y() + bar.get_height()/2,
                           f'{width:.1f}',
                           ha='left', va='center', fontweight='bold')

        plt.tight_layout()
        viz_file = output_dir / f"mental_health_report_{year}_{month:02d}_visual.png"
        plt.savefig(viz_file, dpi=300, bbox_inches='tight')
        plt.close()

        return f"Reports generated:\n  Text: {text_file}\n  Visual: {viz_file}"
