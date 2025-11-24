import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { db } from '@/lib/db';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are a compassionate and professional AI therapist. Your role is to:

1. Listen actively and empathetically to the user's concerns
2. Ask thoughtful follow-up questions to understand their emotional state
3. Identify patterns in their thinking and behavior
4. Help them recognize cognitive distortions and toxic thought loops
5. Track their emotional trends, worries, social patterns, and sleep habits
6. Provide supportive, non-judgmental responses
7. Encourage healthy coping mechanisms and self-reflection

After each response, you should also provide structured analysis in JSON format about:
- Detected emotions and their intensity (0-10 scale)
- Any toxic thought patterns (catastrophizing, black-and-white thinking, overgeneralization, etc.)
- Recurring worries or concerns
- Social interaction patterns mentioned
- Sleep-related information if discussed

IMPORTANT: Respond in two parts:
1. First, your empathetic response to the user
2. Then, on a new line after "---ANALYSIS---", provide a JSON object with your analysis

Example format:
[Your empathetic response here]

---ANALYSIS---
{
  "emotions": [{"emotion": "anxiety", "intensity": 7, "context": "work deadline"}],
  "toxic_patterns": [{"type": "catastrophizing", "description": "believing the worst will happen"}],
  "worries": [{"text": "afraid of failing the project", "category": "work", "severity": 8}],
  "social_patterns": [{"type": "isolation", "description": "avoiding colleagues", "sentiment": "negative"}],
  "sleep_info": {"mentioned": false}
}

Remember: You are supportive but professional. You don't provide medical diagnoses or replace professional help.`;

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId, userId, conversationHistory } = await request.json();

    if (!message || !sessionId || !userId) {
      return NextResponse.json(
        { error: 'Message, sessionId, and userId are required' },
        { status: 400 }
      );
    }

    // Store user message
    await db.addMessage(sessionId, 'user', message);

    // Build conversation history
    const messages = conversationHistory || [];
    messages.push({
      role: 'user',
      content: message,
    });

    // Get AI response
    const response = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: messages,
    });

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : '';

    // Parse response and analysis
    let responseText = assistantMessage;
    let analysis: any = {
      emotions: [],
      toxic_patterns: [],
      worries: [],
      social_patterns: [],
      sleep_info: { mentioned: false },
    };

    if (assistantMessage.includes('---ANALYSIS---')) {
      const parts = assistantMessage.split('---ANALYSIS---');
      responseText = parts[0].trim();
      try {
        analysis = JSON.parse(parts[1].trim());
      } catch (e) {
        console.error('Failed to parse analysis:', e);
      }
    }

    // Store assistant message
    await db.addMessage(sessionId, 'assistant', responseText);

    // Store analysis data
    try {
      // Store emotions
      for (const emotion of analysis.emotions || []) {
        await db.addEmotion(
          sessionId,
          emotion.emotion,
          emotion.intensity,
          emotion.context || ''
        );
      }

      // Store toxic patterns
      for (const pattern of analysis.toxic_patterns || []) {
        await db.addThoughtPattern(
          sessionId,
          pattern.type,
          pattern.description,
          true
        );
      }

      // Store worries
      for (const worry of analysis.worries || []) {
        await db.addWorry(
          sessionId,
          worry.text,
          worry.category,
          worry.severity
        );
      }

      // Store social patterns
      for (const social of analysis.social_patterns || []) {
        await db.addSocialPattern(
          sessionId,
          social.type,
          social.description,
          social.sentiment
        );
      }

      // Store sleep info if mentioned
      if (analysis.sleep_info?.mentioned) {
        await db.addSleepData(
          sessionId,
          analysis.sleep_info.date || new Date().toISOString().split('T')[0],
          analysis.sleep_info.hours || 0,
          analysis.sleep_info.quality || 'unknown',
          analysis.sleep_info.notes || ''
        );
      }
    } catch (error) {
      console.error('Error storing analysis:', error);
    }

    return NextResponse.json({
      response: responseText,
      analysis,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process message' },
      { status: 500 }
    );
  }
}
