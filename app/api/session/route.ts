import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Create new session
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const sessionId = await db.createSession(userId);

    return NextResponse.json({ sessionId });
  } catch (error: any) {
    console.error('Session creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create session' },
      { status: 500 }
    );
  }
}

// End session
export async function PUT(request: NextRequest) {
  try {
    const { sessionId, durationMinutes, summary } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    await db.endSession(sessionId, durationMinutes || 0, summary || '');

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Session end error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to end session' },
      { status: 500 }
    );
  }
}

// Get user sessions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const sessions = await db.getUserSessions(userId);

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get sessions' },
      { status: 500 }
    );
  }
}
