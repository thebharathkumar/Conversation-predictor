#!/usr/bin/env python3
"""Digital Therapist AI - Main Application

A compassionate AI therapist that tracks emotional trends, thought patterns,
worries, social interactions, and sleep, providing monthly mental health reports.
"""

import sys
import os
from datetime import datetime
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt, Confirm
from rich.table import Table
from rich import print as rprint

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent))

from digital_therapist.core.database import TherapyDatabase
from digital_therapist.core.ai_therapist import AITherapist
from digital_therapist.trackers.pattern_analyzer import PatternAnalyzer
from digital_therapist.utils.report_generator import ReportGenerator


class DigitalTherapistApp:
    """Main application class for Digital Therapist AI."""

    def __init__(self):
        self.console = Console()
        self.db = TherapyDatabase()
        self.analyzer = PatternAnalyzer(self.db)
        self.report_generator = ReportGenerator(self.db, self.analyzer)
        self.ai_therapist = None
        self.current_session_id = None
        self.session_start_time = None

    def show_welcome(self):
        """Display welcome message."""
        welcome_text = """
[bold cyan]Digital Therapist AI[/bold cyan]

A safe space for mental health tracking and support.

[yellow]Features:[/yellow]
• Compassionate AI conversations
• Emotional trend tracking
• Toxic thought pattern detection
• Worry monitoring
• Social pattern analysis
• Sleep connection tracking
• Monthly mental health reports

[dim]Remember: This is a supportive tool, not a replacement for
professional mental health care.[/dim]
        """
        self.console.print(Panel(welcome_text, border_style="cyan"))

    def show_menu(self):
        """Display main menu."""
        table = Table(title="Main Menu", show_header=False, border_style="cyan")
        table.add_column("Option", style="cyan", width=4)
        table.add_column("Description", style="white")

        table.add_row("1", "Start Therapy Session")
        table.add_row("2", "Generate Monthly Report")
        table.add_row("3", "Quick Stats")
        table.add_row("4", "Help & Info")
        table.add_row("5", "Exit")

        self.console.print(table)

    def start_session(self):
        """Start a new therapy session."""
        try:
            self.ai_therapist = AITherapist()
            self.current_session_id = self.db.create_session()
            self.session_start_time = datetime.now()

            self.console.print("\n[green]Starting new therapy session...[/green]\n")
            self.console.print(Panel(
                "[bold]Welcome to your therapy session.[/bold]\n\n"
                "Feel free to share what's on your mind. I'm here to listen "
                "and support you.\n\n"
                "[dim]Type 'end' to finish the session\n"
                "Type 'sleep' to log sleep data[/dim]",
                border_style="green"
            ))

            self.chat_loop()

        except ValueError as e:
            self.console.print(f"[red]Error: {e}[/red]")
            self.console.print(
                "[yellow]Please make sure you have set up your .env file "
                "with your ANTHROPIC_API_KEY[/yellow]"
            )

    def chat_loop(self):
        """Main chat interaction loop."""
        while True:
            try:
                user_input = Prompt.ask("\n[bold cyan]You[/bold cyan]")

                if user_input.lower() == 'end':
                    self.end_session()
                    break
                elif user_input.lower() == 'sleep':
                    self.log_sleep_data()
                    continue
                elif not user_input.strip():
                    continue

                # Store user message
                self.db.add_conversation(
                    self.current_session_id,
                    "user",
                    user_input
                )

                # Get AI response
                self.console.print("\n[dim]Thinking...[/dim]")
                response_data = self.ai_therapist.chat(user_input)

                # Display AI response
                self.console.print(
                    f"\n[bold green]Therapist[/bold green]: {response_data['response']}\n"
                )

                # Store AI response
                self.db.add_conversation(
                    self.current_session_id,
                    "assistant",
                    response_data['response']
                )

                # Process and store analysis
                if response_data['analysis']:
                    self.analyzer.process_analysis(
                        self.current_session_id,
                        response_data['analysis']
                    )

            except KeyboardInterrupt:
                self.console.print("\n[yellow]Session interrupted[/yellow]")
                self.end_session()
                break
            except Exception as e:
                self.console.print(f"\n[red]Error: {e}[/red]")

    def log_sleep_data(self):
        """Log sleep data during session."""
        self.console.print("\n[cyan]Sleep Data Logging[/cyan]")

        date = Prompt.ask("Date (YYYY-MM-DD)", default=datetime.now().date().isoformat())

        hours_str = Prompt.ask("Hours slept", default="7.5")
        try:
            hours = float(hours_str)
        except ValueError:
            hours = 7.5

        quality = Prompt.ask(
            "Sleep quality",
            choices=["excellent", "good", "fair", "poor", "bad"],
            default="good"
        )

        notes = Prompt.ask("Any notes (optional)", default="")

        self.db.add_sleep_data(
            self.current_session_id,
            date,
            hours,
            quality,
            notes
        )

        self.console.print("[green]✓ Sleep data logged successfully[/green]")

    def end_session(self):
        """End the current therapy session."""
        if not self.ai_therapist or not self.current_session_id:
            return

        self.console.print("\n[yellow]Ending session...[/yellow]")

        # Get session summary
        summary = self.ai_therapist.get_session_summary()

        # Calculate duration
        duration = (datetime.now() - self.session_start_time).total_seconds() / 60

        # Save session
        self.db.end_session(
            self.current_session_id,
            int(duration),
            summary
        )

        # Display summary
        self.console.print(Panel(
            f"[bold]Session Summary[/bold]\n\n{summary}",
            border_style="yellow"
        ))

        self.console.print(
            f"\n[green]Session ended. Duration: {int(duration)} minutes[/green]\n"
        )

        # Reset
        self.ai_therapist = None
        self.current_session_id = None
        self.session_start_time = None

    def generate_report(self):
        """Generate monthly mental health report."""
        self.console.print("\n[cyan]Generate Monthly Report[/cyan]\n")

        # Get current date as default
        now = datetime.now()
        year_str = Prompt.ask("Year", default=str(now.year))
        month_str = Prompt.ask("Month (1-12)", default=str(now.month))

        try:
            year = int(year_str)
            month = int(month_str)

            if not (1 <= month <= 12):
                self.console.print("[red]Invalid month. Must be 1-12[/red]")
                return

        except ValueError:
            self.console.print("[red]Invalid year or month[/red]")
            return

        format_choice = Prompt.ask(
            "Export format",
            choices=["text", "json", "visual"],
            default="text"
        )

        self.console.print("\n[yellow]Generating report...[/yellow]")

        try:
            output_file = self.report_generator.generate_monthly_report(
                year, month, format_choice
            )

            self.console.print(f"\n[green]✓ Report generated successfully![/green]")
            self.console.print(f"[cyan]Saved to: {output_file}[/cyan]\n")

        except Exception as e:
            self.console.print(f"\n[red]Error generating report: {e}[/red]\n")

    def show_quick_stats(self):
        """Show quick statistics."""
        now = datetime.now()
        data = self.db.get_monthly_data(now.year, now.month)

        stats = Table(title=f"Quick Stats - {now.strftime('%B %Y')}", border_style="cyan")
        stats.add_column("Metric", style="cyan")
        stats.add_column("Value", style="white")

        stats.add_row("Sessions", str(len(data.get('sessions', []))))
        stats.add_row("Emotions Tracked", str(len(data.get('emotions', []))))
        stats.add_row("Thought Patterns", str(len(data.get('thought_patterns', []))))
        stats.add_row("Worries Logged", str(len(data.get('worries', []))))
        stats.add_row("Social Interactions", str(len(data.get('social_patterns', []))))
        stats.add_row("Sleep Entries", str(len(data.get('sleep_data', []))))

        self.console.print(stats)
        self.console.print()

    def show_help(self):
        """Show help information."""
        help_text = """
[bold cyan]How to Use Digital Therapist AI[/bold cyan]

[yellow]Starting a Session:[/yellow]
1. Select option 1 from the main menu
2. Talk freely about your thoughts and feelings
3. The AI will listen, ask questions, and provide support
4. Type 'sleep' during a session to log sleep data
5. Type 'end' when you're done

[yellow]What Gets Tracked:[/yellow]
• Emotions: Automatically detected from your conversations
• Thought Patterns: Identifies cognitive distortions
• Worries: Tracks recurring concerns and their severity
• Social Patterns: Notes interaction types and quality
• Sleep: Logs sleep hours and quality

[yellow]Monthly Reports:[/yellow]
• Generate comprehensive mental health reports
• View trends, patterns, and insights
• Export as text, JSON, or visual charts
• Get personalized recommendations

[yellow]Important Notes:[/yellow]
• All data is stored locally in your database
• This tool complements but doesn't replace professional help
• If you're in crisis, please contact a mental health professional

[dim]For technical help, check the README.md file[/dim]
        """
        self.console.print(Panel(help_text, border_style="cyan"))

    def run(self):
        """Main application loop."""
        self.show_welcome()

        while True:
            try:
                self.show_menu()
                choice = Prompt.ask("\nSelect an option", choices=["1", "2", "3", "4", "5"])

                if choice == "1":
                    self.start_session()
                elif choice == "2":
                    self.generate_report()
                elif choice == "3":
                    self.show_quick_stats()
                elif choice == "4":
                    self.show_help()
                elif choice == "5":
                    if Confirm.ask("\nAre you sure you want to exit?"):
                        self.console.print("\n[cyan]Take care! 💚[/cyan]\n")
                        break

            except KeyboardInterrupt:
                self.console.print("\n\n[cyan]Goodbye! 💚[/cyan]\n")
                break
            except Exception as e:
                self.console.print(f"\n[red]Error: {e}[/red]\n")


def main():
    """Entry point for the application."""
    app = DigitalTherapistApp()
    app.run()


if __name__ == "__main__":
    main()
