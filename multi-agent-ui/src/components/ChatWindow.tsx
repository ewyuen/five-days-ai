'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useChatState } from '@/context/ChatContext';
import { Menu, Settings, AlertTriangle, ArrowDown, Sparkles } from 'lucide-react';
import ModelSelector from './ModelSelector';
import MessageItem from './MessageItem';
import ChatInput from './ChatInput';
import EmptyState from './EmptyState';

interface ChatWindowProps {
  onOpenSettings: () => void;
}

export default function ChatWindow({ onOpenSettings }: ChatWindowProps) {
  const {
    activeConversationId,
    activeConversation,
    selectedModelId,
    apiKeys,
    systemPrompt,
    uiSettings,
    updateUiSettings,
    updateConversationMessages,
    createNewConversation,
  } = useChatState();

  const [prevId, setPrevId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomSpacerRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const transport = useMemo(() => {
    const customFetch = async (url: RequestInfo | URL, init?: RequestInit) => {
      const response = await fetch(url, init);
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `Server error: ${response.status}`);
      }
      return response;
    };

    return new DefaultChatTransport({
      api: '/api/chat',
      body: {
        modelId: selectedModelId,
        apiKeys,
        systemPrompt,
      },
      fetch: customFetch,
    });
  }, [selectedModelId, apiKeys, systemPrompt]);

  // Initialize useChat hook with state integration
  const {
    messages,
    status,
    stop,
    setMessages,
    sendMessage,
  } = useChat({
    transport,
    id: activeConversationId ? `${activeConversationId}-${selectedModelId}` : undefined,
    onError: (error) => {
      console.error('[useChat] error:', error);
      setErrorMsg(error.message || 'Connection lost. Please verify your keys and network.');
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  // 1. Sync messages from global context to useChat on conversation switch
  useEffect(() => {
    if (activeConversationId !== prevId) {
      setPrevId(activeConversationId);
      setErrorMsg(null);
      if (activeConversationId) {
        setMessages(activeConversation?.messages || []);
      } else {
        setMessages([]);
      }
      setInput('');
    }
  }, [activeConversationId, activeConversation, setMessages, setInput, prevId]);

  // 2. Sync messages from useChat back to global storage Context
  useEffect(() => {
    if (activeConversationId && messages.length > 0) {
      const currentMessages = activeConversation?.messages || [];
      if (JSON.stringify(currentMessages) !== JSON.stringify(messages)) {
        updateConversationMessages(activeConversationId, messages);
      }
    }
  }, [messages, activeConversationId, activeConversation, updateConversationMessages]);

  // 3. Scroll to bottom handler
  const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
    bottomSpacerRef.current?.scrollIntoView({ behavior });
  };

  // 4. Scroll tracking for conditional "Scroll to Bottom" button
  const handleScroll = () => {
    const scrollEl = scrollRef.current;
    if (scrollEl) {
      const { scrollTop, scrollHeight, clientHeight } = scrollEl;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 150;
      setShowScrollBtn(!isNearBottom && scrollHeight > clientHeight);
    }
  };

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom('smooth');
    }
  }, [messages.length]);

  const handleSelectPrompt = (prompt: string) => {
    setInput(prompt);
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.focus();
    }
  };

  // Wrapper for submit to auto-create conversation if writing on blank layout
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setErrorMsg(null);

    if (!activeConversationId) {
      createNewConversation(selectedModelId);
      // Wait a tick for state to register
      setTimeout(() => {
        sendMessage({ text: input });
        setInput('');
      }, 50);
    } else {
      sendMessage({ text: input });
      setInput('');
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full bg-zinc-950 text-zinc-100 overflow-hidden relative">
      {/* Background Subtle Gradients */}
      <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-zinc-900 bg-zinc-950/80 px-4 md:px-6 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          {!uiSettings.sidebarOpen && (
            <button
              onClick={() => updateUiSettings({ sidebarOpen: true })}
              className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-xl transition-all"
              title="Open Navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
          <ModelSelector />
        </div>

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/40 text-xs font-semibold text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 transition-all"
        >
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </header>

      {/* Messages Scroll Area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scrollbar-thin relative"
      >
        {messages.length === 0 ? (
          <EmptyState onSelectPrompt={handleSelectPrompt} />
        ) : (
          <div className="w-full max-w-4xl mx-auto flex flex-col pb-4">
            {messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}

            {/* Loading Stream state placeholder */}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-4 py-6 px-4 md:px-6 bg-zinc-900/20 border-y border-zinc-900/50 backdrop-blur-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white animate-pulse">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-2 items-start">
                  <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">Thinking...</span>
                  <div className="flex items-center gap-1 py-3 px-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80">
                    <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Error Notification Alert */}
            {errorMsg && (
              <div className="mx-4 md:mx-6 mt-4 p-4 rounded-xl border border-red-950 bg-red-950/20 text-red-400 flex items-start gap-3 shadow-lg">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1">
                  <h4 className="text-sm font-bold">API Execution Error</h4>
                  <p className="text-xs text-red-400/80 leading-normal">{errorMsg}</p>
                  <button
                    onClick={onOpenSettings}
                    className="text-xs font-semibold underline text-white hover:text-zinc-200 transition-colors mt-2"
                  >
                    Provide credentials in API Settings
                  </button>
                </div>
              </div>
            )}

            <div ref={bottomSpacerRef} />
          </div>
        )}
      </div>

      {/* Floating Scroll-to-Bottom button */}
      {showScrollBtn && (
        <button
          onClick={() => scrollToBottom('smooth')}
          className="absolute bottom-24 right-6 p-2.5 rounded-full border border-zinc-850 bg-zinc-900/90 text-zinc-400 hover:text-white shadow-xl hover:bg-zinc-850 hover:border-zinc-700 active:scale-95 transition-all z-20"
          title="Scroll to bottom"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      )}

      {/* Input area */}
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleFormSubmit}
        isLoading={isLoading}
        stop={stop}
        onOpenSettings={onOpenSettings}
      />
    </div>
  );
}
