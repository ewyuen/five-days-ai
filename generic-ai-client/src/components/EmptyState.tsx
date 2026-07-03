'use client';

import React from 'react';
import { useChatState } from '@/context/ChatContext';
import { MODELS } from '@/lib/models';
import { Sparkles, Terminal, Code, Zap, Brain } from 'lucide-react';

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

interface PromptSuggestion {
  icon: React.ReactNode;
  title: string;
  prompt: string;
  category: string;
}

const SUGGESTIONS: PromptSuggestion[] = [
  {
    icon: <Code className="h-4 w-4 text-indigo-400" />,
    title: 'Code Debouncing',
    prompt: 'Write a TypeScript function to debounce an API query input. Explain how it works step-by-step.',
    category: 'Development',
  },
  {
    icon: <Terminal className="h-4 w-4 text-purple-400" />,
    title: 'Design DB Schema',
    prompt: 'Create a SQL and Prisma schema design for a real-time chat application with workspace channels and thread support.',
    category: 'Database',
  },
  {
    icon: <Brain className="h-4 w-4 text-pink-400" />,
    title: 'Refactor Code',
    prompt: 'Refactor this JavaScript snippet to use modern ES6 async/await, error handling, and optimize performance:\n\n```js\nfunction getData() {\n  fetch("/api")\n    .then(r => r.json())\n    .then(data => console.log(data))\n    .catch(e => console.error(e));\n}\n```',
    category: 'Refactoring',
  },
  {
    icon: <Zap className="h-4 w-4 text-amber-400" />,
    title: 'Technical Concepts',
    prompt: 'Explain the concept of Server Actions in Next.js 15 App Router. What are the key benefits compared to API routes?',
    category: 'Concepts',
  },
];

export default function EmptyState({ onSelectPrompt }: EmptyStateProps) {
  const { selectedModelId } = useChatState();
  const activeModel = MODELS.find((m) => m.id === selectedModelId) || MODELS[0];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fast':
        return <Zap className="h-3.5 w-3.5 text-cyan-400" />;
      case 'reasoning':
        return <Brain className="h-3.5 w-3.5 text-purple-400" />;
      case 'balanced':
      default:
        return <Sparkles className="h-3.5 w-3.5 text-indigo-400" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto px-6 py-12 md:py-24 text-zinc-100 select-none">
      {/* Visual Glowing Mascot Element */}
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-blue-500 opacity-25 blur-xl animate-pulse" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">
          <Sparkles className="h-7 w-7 text-indigo-400" />
        </div>
      </div>

      {/* Main Greeting */}
      <h1 className="text-3xl font-extrabold tracking-tight text-center bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent sm:text-4xl">
        How can I help you build?
      </h1>
      <p className="text-sm text-zinc-500 text-center mt-2 max-w-md">
        Choose a suggestion below or write a custom message to begin your conversation.
      </p>

      {/* Model Detail Panel */}
      <div className="w-full mt-8 rounded-2xl border border-zinc-900 bg-zinc-950/40 p-4 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Current Session Model</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-indigo-500/10 text-indigo-400 border-indigo-500/20 capitalize">
              {activeModel.provider}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border bg-zinc-900 text-zinc-400 border-zinc-800 capitalize flex items-center gap-1">
              {getCategoryIcon(activeModel.category)}
              {activeModel.category}
            </span>
          </div>
        </div>
        <div className="pt-3">
          <h3 className="text-sm font-bold text-white">{activeModel.name}</h3>
          <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{activeModel.description}</p>
        </div>
      </div>

      {/* Suggestions Grid */}
      <div className="w-full mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SUGGESTIONS.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(suggestion.prompt)}
            className="group text-left p-4 rounded-2xl border border-zinc-900 bg-zinc-950/20 hover:bg-zinc-900/30 hover:border-zinc-800 transition-all active:scale-[0.98] flex flex-col justify-between h-32 hover:shadow-lg hover:shadow-indigo-950/10 cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-850 group-hover:bg-zinc-800/80 transition-colors">
                {suggestion.icon}
              </div>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-zinc-600 group-hover:text-zinc-500 transition-colors">
                {suggestion.category}
              </span>
            </div>
            
            <div className="mt-2.5">
              <h4 className="text-xs font-bold text-zinc-300 group-hover:text-white transition-colors">
                {suggestion.title}
              </h4>
              <p className="text-[11px] text-zinc-500 truncate mt-1">
                {suggestion.prompt}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
