'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function Home() {
  const [userId] = useState(() => {
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('userId');
      if (!id) {
        id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('userId', id);
      }
      return id;
    }
    return 'anonymous';
  });

  const [sessionId, setSessionId] = useState<number | null>(null);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startSession = async () => {
    try {
      console.log('Starting session for user:', userId);
      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('Session created:', data.sessionId);

      if (!data.sessionId) {
        throw new Error('No session ID returned');
      }

      setSessionId(data.sessionId);
      setSessionStartTime(new Date());
      setIsSessionActive(true);
      setMessages([
        {
          role: 'assistant',
          content:
            "Welcome to your therapy session. I'm here to listen and support you. Feel free to share what's on your mind.",
        },
      ]);
    } catch (error: any) {
      console.error('Failed to start session:', error);
      alert(`Failed to start session: ${error.message}\n\nCheck console and see SETUP.md for help.`);
    }
  };

  const endSession = async () => {
    if (!sessionId || !sessionStartTime) return;

    const durationMinutes = Math.floor(
      (new Date().getTime() - sessionStartTime.getTime()) / 60000
    );

    try {
      await fetch('/api/session', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          durationMinutes,
          summary: 'Session completed',
        }),
      });

      setSessionId(null);
      setSessionStartTime(null);
      setIsSessionActive(false);
      setMessages([]);
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !sessionId || isLoading) {
      console.log('Cannot send:', { inputMessage: !!inputMessage.trim(), sessionId, isLoading });
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: inputMessage,
    };

    console.log('Sending message:', inputMessage);
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputMessage,
          sessionId,
          userId,
          conversationHistory: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      console.log('Chat response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Chat response received');

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.response) {
        throw new Error('No response from AI');
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Failed to send message:', error);
      const errorMessage = `Failed to send message: ${error.message}\n\nTroubleshooting:\n1. Check browser console (F12)\n2. Ensure environment variables are set\n3. Visit /api/health to check setup\n4. See TROUBLESHOOTING.md for help`;
      alert(errorMessage);

      // Add error message to chat
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Error: ${error.message}\n\nPlease check your setup. Visit /api/health to verify configuration.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              🧠 Digital Therapist AI
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your compassionate AI mental health companion
            </p>
          </div>
          <nav className="flex gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
            >
              Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {!isSessionActive ? (
          /* Welcome Screen */
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Welcome to Your Safe Space
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                A private, supportive environment to explore your thoughts and feelings.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-indigo-50 dark:bg-indigo-900/30 p-6 rounded-lg">
                <div className="text-3xl mb-2">🎭</div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  Emotion Tracking
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Automatically detect and track emotional patterns
                </p>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/30 p-6 rounded-lg">
                <div className="text-3xl mb-2">🧠</div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  Pattern Recognition
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Identify toxic thought loops and worries
                </p>
              </div>

              <div className="bg-pink-50 dark:bg-pink-900/30 p-6 rounded-lg">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  Monthly Reports
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Comprehensive mental health insights
                </p>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 mb-6">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <strong>Important:</strong> This is a supportive tool, not a replacement
                for professional mental health care. If you're in crisis, please contact
                emergency services or a crisis helpline.
              </p>
            </div>

            <button
              onClick={startSession}
              className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition shadow-lg"
            >
              Start Therapy Session
            </button>
          </div>
        ) : (
          /* Chat Interface */
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[calc(100vh-200px)]">
            {/* Chat Header */}
            <div className="bg-indigo-600 text-white px-6 py-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">Session in Progress</h3>
                <p className="text-sm opacity-90">
                  Talk freely - everything is tracked automatically
                </p>
              </div>
              <button
                onClick={endSession}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition"
              >
                End Session
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                      message.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-6 py-4">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t dark:border-gray-700 p-4">
              <div className="flex gap-2">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share your thoughts..."
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white resize-none"
                  rows={3}
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
