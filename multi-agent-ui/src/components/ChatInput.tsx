'use client';

import React, { useRef, useEffect } from 'react';
import { Send, Square, Key, Sparkles, AlertCircle } from 'lucide-react';
import { useChatState } from '@/context/ChatContext';
import { MODELS } from '@/lib/models';

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isLoading: boolean;
  stop: () => void;
  onOpenSettings: () => void;
}

const CHAR_LIMIT = 4000;

export default function ChatInput({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  stop,
  onOpenSettings,
}: ChatInputProps) {
  const { selectedModelId } = useChatState();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const activeModel = MODELS.find((m) => m.id === selectedModelId) || MODELS[0];

  // Auto-resize textarea height as content grows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (unless Shift is pressed)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading && input.length <= CHAR_LIMIT) {
        const form = e.currentTarget.form;
        if (form) {
          form.requestSubmit();
        }
      }
    }
  };

  const isLimitExceeded = input.length > CHAR_LIMIT;
  const isNearLimit = input.length > CHAR_LIMIT - 400;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-6 pt-2">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex flex-col w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-md shadow-2xl transition-all focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/20 overflow-hidden">
          
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${activeModel.name}...`}
            className="w-full resize-none bg-transparent px-4 py-4 pr-16 text-sm text-zinc-100 placeholder-zinc-500 outline-none max-h-[200px] scrollbar-thin"
          />

          {/* Bottom Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 bg-zinc-950/20 border-t border-zinc-900/50">
            {/* Quick Actions (Left) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenSettings}
                className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 rounded-xl transition-all"
                title="Configure Keys"
              >
                <Key className="h-4 w-4" />
              </button>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-medium text-zinc-400">
                <Sparkles className="h-3 w-3 text-indigo-400" />
                <span>Active: {activeModel.name}</span>
              </div>
            </div>

            {/* Status & Send Button (Right) */}
            <div className="flex items-center gap-3">
              {/* Character Limit Indicator */}
              {input.length > 0 && (
                <div className={`text-[10px] font-mono font-medium flex items-center gap-1 ${
                  isLimitExceeded 
                    ? 'text-red-400' 
                    : isNearLimit 
                    ? 'text-amber-400' 
                    : 'text-zinc-500'
                }`}>
                  {isLimitExceeded && <AlertCircle className="h-3.5 w-3.5" />}
                  <span>{input.length}/{CHAR_LIMIT}</span>
                </div>
              )}

              {/* Submit/Stop Action Button */}
              {isLoading ? (
                <button
                  type="button"
                  onClick={stop}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/10 hover:shadow-red-600/20 active:scale-95 transition-all"
                  title="Stop generating"
                >
                  <Square className="h-4.5 w-4.5 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim() || isLimitExceeded}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-115 text-white shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all"
                  title="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </form>
      <p className="text-[10px] text-center text-zinc-650 mt-2">
        Orchestrator can make mistakes. Verify important info.
      </p>
    </div>
  );
}
