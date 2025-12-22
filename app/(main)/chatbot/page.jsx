import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import FinanceChatbot from './_components/financeChatbot';

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <FinanceChatbot />
    </Suspense>
  );
}

export const metadata = {
  title: 'AI Financial Assistant | Finova',
  description: 'Chat with your AI-powered finance assistant',
};
