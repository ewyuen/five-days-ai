'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChatState, Conversation } from '@/context/ChatContext';
import { 
  Plus, MessageSquare, Trash2, Edit3, Settings, 
  Sun, Moon, Laptop, Trash, Check, X, Menu, ChevronLeft 
} from 'lucide-react';

interface SidebarProps {
  onOpenSettings: () => void;
}

export default function Sidebar({ onOpenSettings }: SidebarProps) {
  const { 
    conversations, 
    activeConversationId, 
    setActiveConversationId,
    createNewConversation, 
    deleteConversation, 
    clearAllConversations,
    updateConversationTitle,
    uiSettings,
    updateUiSettings
  } = useChatState();

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Focus rename input when activated
  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  // Handle theme application
  useEffect(() => {
    const root = window.document.documentElement;
    if (uiSettings.theme === 'dark') {
      root.classList.add('dark');
    } else if (uiSettings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      if (systemTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [uiSettings.theme]);

  // Sort conversations by updatedAt desc
  const sortedConversations = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);

  const startRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(conv.id);
    setRenameValue(conv.title);
  };

  const saveRename = (id: string) => {
    if (renameValue.trim()) {
      updateConversationTitle(id, renameValue);
    }
    setRenamingId(null);
  };

  const cancelRename = () => {
    setRenamingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (deleteConfirmId === id) {
      deleteConversation(id);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(id);
      // Reset delete confirmation after 3 seconds
      setTimeout(() => {
        setDeleteConfirmId((current) => (current === id ? null : current));
      }, 3000);
    }
  };

  const handleClearAll = () => {
    if (isClearingAll) {
      clearAllConversations();
      setIsClearingAll(false);
    } else {
      setIsClearingAll(true);
      setTimeout(() => {
        setIsClearingAll(false);
      }, 3000);
    }
  };

  const toggleTheme = () => {
    const themes: ('dark' | 'light' | 'system')[] = ['dark', 'light', 'system'];
    const currentIndex = themes.indexOf(uiSettings.theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    updateUiSettings({ theme: themes[nextIndex] });
  };

  const getThemeIcon = () => {
    switch (uiSettings.theme) {
      case 'dark':
        return <Moon className="h-4 w-4" />;
      case 'light':
        return <Sun className="h-4 w-4 text-amber-500" />;
      case 'system':
      default:
        return <Laptop className="h-4 w-4" />;
    }
  };

  const getThemeName = () => {
    switch (uiSettings.theme) {
      case 'dark': return 'Dark Mode';
      case 'light': return 'Light Mode';
      case 'system': return 'System Default';
    }
  };

  const sidebarOpen = uiSettings.sidebarOpen;

  if (!sidebarOpen) {
    return (
      <div className="hidden md:flex flex-col items-center py-4 px-2 bg-zinc-950 border-r border-zinc-900 w-16 h-full shrink-0 transition-all duration-300">
        <button
          onClick={() => updateUiSettings({ sidebarOpen: true })}
          className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-xl transition-all"
          title="Open Sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex-1" />
        <button
          onClick={() => createNewConversation()}
          className="p-2.5 text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/10 transition-all mb-4"
          title="New Chat"
        >
          <Plus className="h-5 w-5" />
        </button>
        <button
          onClick={onOpenSettings}
          className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-xl transition-all mb-2"
          title="API Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 rounded-xl transition-all"
          title="Toggle Theme"
        >
          {getThemeIcon()}
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => updateUiSettings({ sidebarOpen: false })}
        />
      )}

      {/* Main Sidebar Panel */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 flex flex-col w-72 md:relative md:translate-x-0 bg-zinc-950 border-r border-zinc-900 text-zinc-200 h-full transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-zinc-900">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <span className="font-bold text-white tracking-tight">O</span>
            </div>
            <span className="font-bold text-base bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Orchestrator Chat
            </span>
          </div>
          <button
            onClick={() => updateUiSettings({ sidebarOpen: false })}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 rounded-lg transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Action Button: New Chat */}
        <div className="p-4">
          <button
            onClick={() => {
              createNewConversation();
              if (window.innerWidth < 768) {
                updateUiSettings({ sidebarOpen: false });
              }
            }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-500 active:scale-98 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 scrollbar-thin">
          {sortedConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center text-zinc-600">
              <MessageSquare className="h-8 w-8 mb-2 stroke-1" />
              <p className="text-xs">No conversations yet</p>
            </div>
          ) : (
            sortedConversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const isRenaming = renamingId === conv.id;
              const isDeleting = deleteConfirmId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => {
                    if (!isRenaming) {
                      setActiveConversationId(conv.id);
                      if (window.innerWidth < 768) {
                        updateUiSettings({ sidebarOpen: false });
                      }
                    }
                  }}
                  className={`group relative flex items-center justify-between rounded-xl px-3 py-2.5 text-sm cursor-pointer transition-all border ${
                    isActive 
                      ? 'bg-zinc-900 border-zinc-800 text-white' 
                      : 'border-transparent text-zinc-400 hover:bg-zinc-900/40 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-400' : 'text-zinc-600'}`} />
                    
                    {isRenaming ? (
                      <input
                        ref={renameInputRef}
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={() => saveRename(conv.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename(conv.id);
                          if (e.key === 'Escape') cancelRename();
                        }}
                        className="bg-transparent border-b border-indigo-500 text-white outline-none w-full py-0.5 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="truncate pr-4">{conv.title}</span>
                    )}
                  </div>

                  {/* Actions buttons, hidden by default, visible on hover */}
                  {!isRenaming && (
                    <div className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isDeleting ? (
                        <button
                          onClick={(e) => handleDelete(conv.id, e)}
                          className="p-1 rounded bg-red-950 text-red-400 border border-red-800 hover:bg-red-900 transition-colors text-[10px] px-1.5 font-bold"
                          title="Confirm Delete"
                        >
                          Confirm
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={(e) => startRename(conv, e)}
                            className="p-1 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-850 rounded transition-all"
                            title="Rename Chat"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(conv.id, e)}
                            className="p-1 text-zinc-500 hover:text-red-400 hover:bg-zinc-850 rounded transition-all"
                            title="Delete Chat"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-950/60 space-y-2.5">
          {/* Settings button */}
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all"
          >
            <Settings className="h-4.5 w-4.5 text-zinc-500" />
            <span>API & System Settings</span>
          </button>

          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-all"
          >
            <div className="flex items-center gap-3">
              {getThemeIcon()}
              <span>Theme</span>
            </div>
            <span className="text-[10px] bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-800 text-zinc-500">
              {getThemeName()}
            </span>
          </button>

          {/* Clear History */}
          <button
            onClick={handleClearAll}
            className={`w-full flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all ${
              isClearingAll 
                ? 'bg-red-950/40 border-red-900 text-red-300 hover:bg-red-900/40' 
                : 'border-zinc-900 text-zinc-500 hover:border-zinc-800 hover:text-zinc-300'
            }`}
          >
            <Trash className="h-4 w-4" />
            <span>{isClearingAll ? 'Confirm Clear All?' : 'Clear History'}</span>
          </button>
        </div>
      </div>
    </>
  );
}
