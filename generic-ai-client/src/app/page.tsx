'use client';

import React, { useState, useEffect } from 'react';
import { ChatProvider } from '@/context/ChatContext';
import Sidebar from '@/components/Sidebar';
import ChatWindow from '@/components/ChatWindow';
import SettingsModal from '@/components/SettingsModal';

export default function Home() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Set mounted state to prevent SSR/hydration mismatch issues with local storage values
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-xs font-semibold tracking-wider uppercase">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <ChatProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans antialiased">
        {/* Sidebar Navigation */}
        <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />

        {/* Main Chat Area */}
        <ChatWindow onOpenSettings={() => setIsSettingsOpen(true)} />

        {/* Settings modal drawer */}
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      </div>
    </ChatProvider>
  );
}
