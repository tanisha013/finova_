'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'react-motion';
import { Bot, User, Send, Trash2, Lightbulb } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';

import {
  sendChatMessage,
  getChatHistory,
  clearChatHistory,
  getQuickInsights,
} from '@/actions/chatbot';

import { toast } from 'sonner';

export default function FinanceChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState([]);

  const scrollRef = useRef(null);

  /* ---------------- LOAD DATA ---------------- */
  useEffect(() => {
    getChatHistory().then((h) => setMessages(h || []));
    getQuickInsights().then((r) => r?.success && setInsights(r.insights));
  }, []);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  /* ---------------- SEND MESSAGE ---------------- */
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const text = input;
    setInput('');
    setIsLoading(true);

    setMessages((prev) => [
      ...prev,
      { role: 'user', content: text, timestamp: new Date() },
    ]);

    try {
      const res = await sendChatMessage(text);
      if (res?.success) {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: res.response, timestamp: new Date() },
        ]);
      } else {
        toast.error('Failed to send message');
      }
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- CLEAR CHAT ---------------- */
  const handleClear = async () => {
    if (!confirm('Clear chat history?')) return;
    await clearChatHistory();
    setMessages([]);
    toast.success('Chat history cleared');
  };

  return (
    <Card className="h-[calc(100vh-5rem)] max-w-5xl mx-auto flex flex-col overflow-hidden shadow-xl">

      {/* ================= HEADER (FIXED) ================= */}
      <CardHeader className="shrink-0 sticky top-0 z-20 bg-white/90 backdrop-blur border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-teal-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 text-xl">
              Finova Assistant
            </h3>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleClear}
            className="text-gray-500 hover:text-red-600 font-medium text-sm"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear History
          </Button>
        </div>
      </CardHeader>

      {/* ================= CHAT AREA (ONLY SCROLLS) ================= */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea ref={scrollRef} className="h-full px-6 py-4">
          <div className="space-y-4">

            {/* INSIGHTS */}
            {insights.length > 0 && (
              <Alert className="bg-gradient-to-r from-indigo-50 to-teal-50 border-indigo-100">
                <Lightbulb className="h-4 w-4 text-indigo-600" />
                <AlertDescription className="space-y-1">
                  {insights.map((i, idx) => (
                    <p key={idx} className="text-sm">{i}</p>
                  ))}
                </AlertDescription>
              </Alert>
            )}

            {/* EMPTY STATE */}
            {messages.length === 0 && !isLoading && (
              <div className="text-center py-20 text-gray-500">
                <Bot className="w-12 h-12 mx-auto mb-2 opacity-70" />
                <p className="font-medium">
                  Ask me anything about your finances, budgets, or spending habits.
                </p>
              </div>
            )}

            {/* MESSAGES */}
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-indigo-600" />
                  </div>
                )}

                <div className="max-w-[75%]">
                  <div
                    className={`px-4 py-3 rounded-xl text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-indigo-600 to-teal-600 text-white'
                        : 'bg-slate-50 border border-slate-200 text-slate-800'
                    }`}
                  >
                    {msg.content}
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1 ml-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-600 to-teal-600 flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </motion.div>
            ))}

            {/* TYPING INDICATOR */}
            {isLoading && (
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

          </div>
        </ScrollArea>
      </div>

      {/* ================= INPUT (FIXED) ================= */}
      <div className="shrink-0 sticky bottom-0 z-20 bg-white/90 backdrop-blur border-t px-6 py-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything about your finances..."
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-indigo-600 to-teal-600 text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-xs text-gray-400 text-right mt-1">
          {input.length}/1000 characters
        </p>
      </div>
    </Card>
  );
}
