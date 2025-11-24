import { sql } from '@vercel/postgres';

export interface Session {
  id: number;
  user_id: string;
  timestamp: Date;
  duration_minutes?: number;
  summary?: string;
}

export interface Message {
  id: number;
  session_id: number;
  timestamp: Date;
  role: 'user' | 'assistant';
  content: string;
}

export interface Emotion {
  id: number;
  session_id: number;
  timestamp: Date;
  emotion: string;
  intensity: number;
  context: string;
}

export interface ThoughtPattern {
  id: number;
  session_id: number;
  timestamp: Date;
  pattern_type: string;
  description: string;
  is_toxic: boolean;
}

export interface Worry {
  id: number;
  session_id: number;
  timestamp: Date;
  worry_text: string;
  category: string;
  severity: number;
}

export interface SocialPattern {
  id: number;
  session_id: number;
  timestamp: Date;
  interaction_type: string;
  description: string;
  sentiment: string;
}

export interface SleepData {
  id: number;
  session_id: number;
  date: string;
  hours: number;
  quality: string;
  notes: string;
}

export class TherapyDatabase {
  async initDatabase() {
    try {
      // Sessions table
      await sql`
        CREATE TABLE IF NOT EXISTS sessions (
          id SERIAL PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          duration_minutes INTEGER,
          summary TEXT
        )
      `;

      // Messages table
      await sql`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          role VARCHAR(50) NOT NULL,
          content TEXT NOT NULL
        )
      `;

      // Emotions table
      await sql`
        CREATE TABLE IF NOT EXISTS emotions (
          id SERIAL PRIMARY KEY,
          session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          emotion VARCHAR(100) NOT NULL,
          intensity FLOAT NOT NULL,
          context TEXT
        )
      `;

      // Thought patterns table
      await sql`
        CREATE TABLE IF NOT EXISTS thought_patterns (
          id SERIAL PRIMARY KEY,
          session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          pattern_type VARCHAR(100) NOT NULL,
          description TEXT,
          is_toxic BOOLEAN DEFAULT FALSE
        )
      `;

      // Worries table
      await sql`
        CREATE TABLE IF NOT EXISTS worries (
          id SERIAL PRIMARY KEY,
          session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          worry_text TEXT NOT NULL,
          category VARCHAR(100),
          severity FLOAT
        )
      `;

      // Social patterns table
      await sql`
        CREATE TABLE IF NOT EXISTS social_patterns (
          id SERIAL PRIMARY KEY,
          session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
          timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          interaction_type VARCHAR(100),
          description TEXT,
          sentiment VARCHAR(50)
        )
      `;

      // Sleep data table
      await sql`
        CREATE TABLE IF NOT EXISTS sleep_data (
          id SERIAL PRIMARY KEY,
          session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          hours FLOAT NOT NULL,
          quality VARCHAR(50),
          notes TEXT
        )
      `;

      return { success: true };
    } catch (error: any) {
      // Tables might already exist
      if (error.message?.includes('already exists')) {
        return { success: true };
      }
      throw error;
    }
  }

  async createSession(userId: string): Promise<number> {
    const result = await sql`
      INSERT INTO sessions (user_id, timestamp)
      VALUES (${userId}, NOW())
      RETURNING id
    `;
    return result.rows[0].id;
  }

  async endSession(sessionId: number, durationMinutes: number, summary: string) {
    await sql`
      UPDATE sessions
      SET duration_minutes = ${durationMinutes}, summary = ${summary}
      WHERE id = ${sessionId}
    `;
  }

  async addMessage(sessionId: number, role: string, content: string) {
    await sql`
      INSERT INTO messages (session_id, timestamp, role, content)
      VALUES (${sessionId}, NOW(), ${role}, ${content})
    `;
  }

  async addEmotion(sessionId: number, emotion: string, intensity: number, context: string) {
    await sql`
      INSERT INTO emotions (session_id, timestamp, emotion, intensity, context)
      VALUES (${sessionId}, NOW(), ${emotion}, ${intensity}, ${context})
    `;
  }

  async addThoughtPattern(sessionId: number, patternType: string, description: string, isToxic: boolean) {
    await sql`
      INSERT INTO thought_patterns (session_id, timestamp, pattern_type, description, is_toxic)
      VALUES (${sessionId}, NOW(), ${patternType}, ${description}, ${isToxic})
    `;
  }

  async addWorry(sessionId: number, worryText: string, category: string, severity: number) {
    await sql`
      INSERT INTO worries (session_id, timestamp, worry_text, category, severity)
      VALUES (${sessionId}, NOW(), ${worryText}, ${category}, ${severity})
    `;
  }

  async addSocialPattern(sessionId: number, interactionType: string, description: string, sentiment: string) {
    await sql`
      INSERT INTO social_patterns (session_id, timestamp, interaction_type, description, sentiment)
      VALUES (${sessionId}, NOW(), ${interactionType}, ${description}, ${sentiment})
    `;
  }

  async addSleepData(sessionId: number, date: string, hours: number, quality: string, notes: string) {
    await sql`
      INSERT INTO sleep_data (session_id, date, hours, quality, notes)
      VALUES (${sessionId}, ${date}, ${hours}, ${quality}, ${notes})
    `;
  }

  async getMonthlyData(userId: string, year: number, month: number) {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
    const endDate = month === 12
      ? `${year + 1}-01-01`
      : `${year}-${(month + 1).toString().padStart(2, '0')}-01`;

    const [sessions, emotions, thoughtPatterns, worries, socialPatterns, sleepData] = await Promise.all([
      sql`SELECT * FROM sessions WHERE user_id = ${userId} AND timestamp >= ${startDate} AND timestamp < ${endDate} ORDER BY timestamp`,
      sql`
        SELECT e.* FROM emotions e
        JOIN sessions s ON e.session_id = s.id
        WHERE s.user_id = ${userId} AND e.timestamp >= ${startDate} AND e.timestamp < ${endDate}
        ORDER BY e.timestamp
      `,
      sql`
        SELECT t.* FROM thought_patterns t
        JOIN sessions s ON t.session_id = s.id
        WHERE s.user_id = ${userId} AND t.timestamp >= ${startDate} AND t.timestamp < ${endDate}
        ORDER BY t.timestamp
      `,
      sql`
        SELECT w.* FROM worries w
        JOIN sessions s ON w.session_id = s.id
        WHERE s.user_id = ${userId} AND w.timestamp >= ${startDate} AND w.timestamp < ${endDate}
        ORDER BY w.timestamp
      `,
      sql`
        SELECT sp.* FROM social_patterns sp
        JOIN sessions s ON sp.session_id = s.id
        WHERE s.user_id = ${userId} AND sp.timestamp >= ${startDate} AND sp.timestamp < ${endDate}
        ORDER BY sp.timestamp
      `,
      sql`
        SELECT sd.* FROM sleep_data sd
        JOIN sessions s ON sd.session_id = s.id
        WHERE s.user_id = ${userId} AND sd.date >= ${startDate} AND sd.date < ${endDate}
        ORDER BY sd.date
      `,
    ]);

    return {
      sessions: sessions.rows,
      emotions: emotions.rows,
      thought_patterns: thoughtPatterns.rows,
      worries: worries.rows,
      social_patterns: socialPatterns.rows,
      sleep_data: sleepData.rows,
    };
  }

  async getUserSessions(userId: string, limit: number = 10) {
    const result = await sql`
      SELECT * FROM sessions
      WHERE user_id = ${userId}
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `;
    return result.rows;
  }
}

export const db = new TherapyDatabase();
