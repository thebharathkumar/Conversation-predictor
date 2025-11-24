"""Database layer for storing therapy sessions and tracking data."""

import sqlite3
import json
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional, Any


class TherapyDatabase:
    """Manages all data storage for the Digital Therapist AI."""

    def __init__(self, db_path: str = "digital_therapist/data/therapy.db"):
        self.db_path = db_path
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)
        self.init_database()

    def get_connection(self):
        """Get database connection."""
        return sqlite3.connect(self.db_path)

    def init_database(self):
        """Initialize database tables."""
        conn = self.get_connection()
        cursor = conn.cursor()

        # Sessions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                duration_minutes INTEGER,
                summary TEXT
            )
        """)

        # Conversations table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS conversations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                role TEXT,
                content TEXT,
                FOREIGN KEY (session_id) REFERENCES sessions (id)
            )
        """)

        # Emotions table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS emotions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                emotion TEXT,
                intensity FLOAT,
                context TEXT,
                FOREIGN KEY (session_id) REFERENCES sessions (id)
            )
        """)

        # Thought patterns table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS thought_patterns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                pattern_type TEXT,
                description TEXT,
                is_toxic BOOLEAN,
                frequency INTEGER DEFAULT 1,
                FOREIGN KEY (session_id) REFERENCES sessions (id)
            )
        """)

        # Worries table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS worries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                worry_text TEXT,
                category TEXT,
                severity FLOAT,
                FOREIGN KEY (session_id) REFERENCES sessions (id)
            )
        """)

        # Social patterns table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS social_patterns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                interaction_type TEXT,
                description TEXT,
                sentiment TEXT,
                FOREIGN KEY (session_id) REFERENCES sessions (id)
            )
        """)

        # Sleep data table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS sleep_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER,
                date DATE,
                hours FLOAT,
                quality TEXT,
                notes TEXT,
                FOREIGN KEY (session_id) REFERENCES sessions (id)
            )
        """)

        conn.commit()
        conn.close()

    def create_session(self) -> int:
        """Create a new therapy session."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO sessions (timestamp) VALUES (?)",
                      (datetime.now(),))
        session_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return session_id

    def end_session(self, session_id: int, duration_minutes: int, summary: str):
        """End a therapy session with summary."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE sessions
            SET duration_minutes = ?, summary = ?
            WHERE id = ?
        """, (duration_minutes, summary, session_id))
        conn.commit()
        conn.close()

    def add_conversation(self, session_id: int, role: str, content: str):
        """Add a conversation entry."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO conversations (session_id, timestamp, role, content)
            VALUES (?, ?, ?, ?)
        """, (session_id, datetime.now(), role, content))
        conn.commit()
        conn.close()

    def add_emotion(self, session_id: int, emotion: str, intensity: float, context: str = ""):
        """Track an emotion."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO emotions (session_id, timestamp, emotion, intensity, context)
            VALUES (?, ?, ?, ?, ?)
        """, (session_id, datetime.now(), emotion, intensity, context))
        conn.commit()
        conn.close()

    def add_thought_pattern(self, session_id: int, pattern_type: str,
                           description: str, is_toxic: bool):
        """Track a thought pattern."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO thought_patterns
            (session_id, timestamp, pattern_type, description, is_toxic)
            VALUES (?, ?, ?, ?, ?)
        """, (session_id, datetime.now(), pattern_type, description, is_toxic))
        conn.commit()
        conn.close()

    def add_worry(self, session_id: int, worry_text: str, category: str, severity: float):
        """Track a worry."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO worries (session_id, timestamp, worry_text, category, severity)
            VALUES (?, ?, ?, ?, ?)
        """, (session_id, datetime.now(), worry_text, category, severity))
        conn.commit()
        conn.close()

    def add_social_pattern(self, session_id: int, interaction_type: str,
                          description: str, sentiment: str):
        """Track a social pattern."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO social_patterns
            (session_id, timestamp, interaction_type, description, sentiment)
            VALUES (?, ?, ?, ?, ?)
        """, (session_id, datetime.now(), interaction_type, description, sentiment))
        conn.commit()
        conn.close()

    def add_sleep_data(self, session_id: int, date: str, hours: float,
                       quality: str, notes: str = ""):
        """Track sleep data."""
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO sleep_data (session_id, date, hours, quality, notes)
            VALUES (?, ?, ?, ?, ?)
        """, (session_id, date, hours, quality, notes))
        conn.commit()
        conn.close()

    def get_monthly_data(self, year: int, month: int) -> Dict[str, List[Dict]]:
        """Get all data for a specific month."""
        conn = self.get_connection()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        date_filter = f"{year}-{month:02d}%"

        data = {}

        # Get sessions
        cursor.execute("""
            SELECT * FROM sessions
            WHERE strftime('%Y-%m', timestamp) = strftime('%Y-%m', ?)
            ORDER BY timestamp
        """, (f"{year}-{month:02d}-01",))
        data['sessions'] = [dict(row) for row in cursor.fetchall()]

        # Get emotions
        cursor.execute("""
            SELECT * FROM emotions
            WHERE strftime('%Y-%m', timestamp) = strftime('%Y-%m', ?)
            ORDER BY timestamp
        """, (f"{year}-{month:02d}-01",))
        data['emotions'] = [dict(row) for row in cursor.fetchall()]

        # Get thought patterns
        cursor.execute("""
            SELECT * FROM thought_patterns
            WHERE strftime('%Y-%m', timestamp) = strftime('%Y-%m', ?)
            ORDER BY timestamp
        """, (f"{year}-{month:02d}-01",))
        data['thought_patterns'] = [dict(row) for row in cursor.fetchall()]

        # Get worries
        cursor.execute("""
            SELECT * FROM worries
            WHERE strftime('%Y-%m', timestamp) = strftime('%Y-%m', ?)
            ORDER BY timestamp
        """, (f"{year}-{month:02d}-01",))
        data['worries'] = [dict(row) for row in cursor.fetchall()]

        # Get social patterns
        cursor.execute("""
            SELECT * FROM social_patterns
            WHERE strftime('%Y-%m', timestamp) = strftime('%Y-%m', ?)
            ORDER BY timestamp
        """, (f"{year}-{month:02d}-01",))
        data['social_patterns'] = [dict(row) for row in cursor.fetchall()]

        # Get sleep data
        cursor.execute("""
            SELECT * FROM sleep_data
            WHERE strftime('%Y-%m', date) = strftime('%Y-%m', ?)
            ORDER BY date
        """, (f"{year}-{month:02d}-01",))
        data['sleep_data'] = [dict(row) for row in cursor.fetchall()]

        conn.close()
        return data
