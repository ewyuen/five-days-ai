'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { UIMessage } from 'ai';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export interface Conversation {
  id: string;
  title: string;
  modelId: string;
  messages: UIMessage[];
  createdAt: number;
  updatedAt: number;
  systemPrompt?: string;
}

export interface ApiKeys {
  openai: string;
  anthropic: string;
  google: string;
}

export interface UISettings {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
}

export interface ChatContextType {
  conversations: Conversation[];
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  selectedModelId: string;
  apiKeys: ApiKeys;
  systemPrompt: string;
  uiSettings: UISettings;
  
  createNewConversation: (modelId?: string) => Conversation;
  deleteConversation: (id: string) => void;
  clearAllConversations: () => void;
  setActiveConversationId: (id: string | null) => void;
  updateConversationMessages: (id: string, messages: UIMessage[]) => void;
  updateConversationTitle: (id: string, title: string) => void;
  setSelectedModelId: (modelId: string) => void;
  updateApiKey: (provider: 'openai' | 'anthropic' | 'google', key: string) => void;
  setSystemPrompt: (prompt: string) => void;
  updateUiSettings: (settings: Partial<UISettings>) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('chat-conversations', []);
  const [activeConversationId, setActiveConversationId] = useLocalStorage<string | null>('chat-active-id', null);
  const [selectedModelId, setSelectedModelId] = useLocalStorage<string>('chat-selected-model', 'gpt-4o');
  const [apiKeys, setApiKeys] = useLocalStorage<ApiKeys>('chat-api-keys', {
    openai: '',
    anthropic: '',
    google: '',
  });
  const [systemPrompt, setSystemPrompt] = useLocalStorage<string>('chat-system-prompt', '');
  const [uiSettings, setUiSettings] = useLocalStorage<UISettings>('chat-ui-settings', {
    theme: 'system',
    sidebarOpen: true,
  });

  // Derived active conversation
  const activeConversation = useMemo(() => {
    if (!activeConversationId) return null;
    return conversations.find((c) => c.id === activeConversationId) || null;
  }, [conversations, activeConversationId]);

  // Create a new conversation
  const createNewConversation = (modelId?: string) => {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15);
      
    const newConv: Conversation = {
      id: newId,
      title: 'New Chat',
      modelId: modelId || selectedModelId,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      systemPrompt: systemPrompt || undefined,
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveConversationId(newId);
    console.log('[ChatContext] Created new conversation:', newId);
    return newConv;
  };

  // Delete a conversation
  const deleteConversation = (id: string) => {
    console.log('[ChatContext] Deleting conversation:', id);
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeConversationId === id) {
      setActiveConversationId(null);
    }
  };

  // Clear all conversations
  const clearAllConversations = () => {
    console.log('[ChatContext] Clearing all conversations');
    setConversations([]);
    setActiveConversationId(null);
  };

  // Update messages for a specific conversation
  const updateConversationMessages = (id: string, messages: UIMessage[]) => {
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          // Auto-generate title if it's the default 'New Chat'
          let title = c.title;
          if (title === 'New Chat' && messages.length > 0) {
            const firstUserMessage = messages.find((m) => m.role === 'user');
            if (firstUserMessage) {
              const text = firstUserMessage.parts
                .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
                .map((part) => part.text)
                .join('');
              if (text) {
                title = text.slice(0, 30).trim();
                if (text.length > 30) {
                  title += '...';
                }
              }
            }
          }
          return {
            ...c,
            messages,
            title,
            updatedAt: Date.now(),
          };
        }
        return c;
      })
    );
  };

  // Update conversation title manually
  const updateConversationTitle = (id: string, title: string) => {
    console.log(`[ChatContext] Updating title for conversation "${id}" to "${title}"`);
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: title.trim(), updatedAt: Date.now() } : c))
    );
  };

  // Update a specific API key
  const updateApiKey = (provider: 'openai' | 'anthropic' | 'google', key: string) => {
    setApiKeys((prev) => ({
      ...prev,
      [provider]: key,
    }));
  };

  // Update UI settings
  const updateUiSettings = (settings: Partial<UISettings>) => {
    setUiSettings((prev) => ({
      ...prev,
      ...settings,
    }));
  };

  const contextValue = useMemo<ChatContextType>(
    () => ({
      conversations,
      activeConversationId,
      activeConversation,
      selectedModelId,
      apiKeys,
      systemPrompt,
      uiSettings,
      createNewConversation,
      deleteConversation,
      clearAllConversations,
      setActiveConversationId,
      updateConversationMessages,
      updateConversationTitle,
      setSelectedModelId,
      updateApiKey,
      setSystemPrompt,
      updateUiSettings,
    }),
    [
      conversations,
      activeConversationId,
      activeConversation,
      selectedModelId,
      apiKeys,
      systemPrompt,
      uiSettings,
    ]
  );

  return <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>;
}

export function useChatState() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatState must be used within a ChatProvider');
  }
  return context;
}
