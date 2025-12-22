'use client';

import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ChatbotFloatingButton() {
  return (
    <Link href="/chatbot">
      <Button
        className="
          fixed bottom-6 right-6 z-50
          bg-gradient-to-r from-indigo-600 to-teal-600
          text-white shadow-xl
           h-45 w-45
          flex items-center justify-center
          hover:scale-105 transition-transform
        "
      >
        <MessageSquare className="w-6 h-6" />
        Finova Assistant
      </Button>
    </Link>
  );
}
