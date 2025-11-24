"""AI-powered conversation handler for therapy sessions."""

import os
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
import anthropic
from dotenv import load_dotenv

load_dotenv()


class AITherapist:
    """Handles AI-powered therapy conversations and analysis."""

    def __init__(self):
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError(
                "ANTHROPIC_API_KEY not found. Please set it in .env file"
            )
        self.client = anthropic.Anthropic(api_key=api_key)
        self.conversation_history = []
        self.system_prompt = self._create_system_prompt()

    def _create_system_prompt(self) -> str:
        """Create the system prompt for the AI therapist."""
        return """You are a compassionate and professional AI therapist. Your role is to:

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

Remember: You are supportive but professional. You don't provide medical diagnoses or replace professional help."""

    def chat(self, user_message: str) -> Dict[str, Any]:
        """Send a message and get response with analysis."""
        self.conversation_history.append({
            "role": "user",
            "content": user_message
        })

        try:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=2000,
                system=self.system_prompt,
                messages=self.conversation_history
            )

            assistant_message = response.content[0].text
            self.conversation_history.append({
                "role": "assistant",
                "content": assistant_message
            })

            # Parse response and analysis
            if "---ANALYSIS---" in assistant_message:
                parts = assistant_message.split("---ANALYSIS---")
                response_text = parts[0].strip()
                try:
                    analysis = json.loads(parts[1].strip())
                except json.JSONDecodeError:
                    analysis = self._create_empty_analysis()
            else:
                response_text = assistant_message
                analysis = self._create_empty_analysis()

            return {
                "response": response_text,
                "analysis": analysis,
                "timestamp": datetime.now().isoformat()
            }

        except Exception as e:
            return {
                "response": f"I apologize, but I encountered an error: {str(e)}",
                "analysis": self._create_empty_analysis(),
                "timestamp": datetime.now().isoformat(),
                "error": str(e)
            }

    def _create_empty_analysis(self) -> Dict:
        """Create empty analysis structure."""
        return {
            "emotions": [],
            "toxic_patterns": [],
            "worries": [],
            "social_patterns": [],
            "sleep_info": {"mentioned": False}
        }

    def get_session_summary(self) -> str:
        """Generate a summary of the current session."""
        if not self.conversation_history:
            return "No conversation history available."

        summary_prompt = """Based on our conversation, please provide a brief summary of:
1. Main topics discussed
2. Key emotions expressed
3. Important insights or patterns identified
4. Any action items or coping strategies suggested

Keep it concise (3-5 sentences)."""

        self.conversation_history.append({
            "role": "user",
            "content": summary_prompt
        })

        try:
            response = self.client.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=500,
                system="You are a therapist creating a session summary.",
                messages=self.conversation_history
            )

            return response.content[0].text

        except Exception as e:
            return f"Could not generate summary: {str(e)}"

    def reset_conversation(self):
        """Reset conversation history for a new session."""
        self.conversation_history = []
