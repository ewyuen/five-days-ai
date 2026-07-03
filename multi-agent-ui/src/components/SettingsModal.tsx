'use client';

import React, { useState, useEffect } from 'react';
import { useChatState } from '@/context/ChatContext';
import { X, Eye, EyeOff, Key, Terminal, Check, Info } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { apiKeys, updateApiKey, systemPrompt, setSystemPrompt } = useChatState();

  const [openaiKey, setOpenaiKey] = useState(apiKeys.openai);
  const [anthropicKey, setAnthropicKey] = useState(apiKeys.anthropic);
  const [googleKey, setGoogleKey] = useState(apiKeys.google);
  const [localPrompt, setLocalPrompt] = useState(systemPrompt);

  const [showOpenai, setShowOpenai] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);
  const [showGoogle, setShowGoogle] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync with context values when modal opens
  useEffect(() => {
    if (isOpen) {
      setOpenaiKey(apiKeys.openai);
      setAnthropicKey(apiKeys.anthropic);
      setGoogleKey(apiKeys.google);
      setLocalPrompt(systemPrompt);
      setSaveSuccess(false);
    }
  }, [isOpen, apiKeys, systemPrompt]);

  if (!isOpen) return null;

  const handleSave = () => {
    setIsSaving(true);
    
    // Simulate slight save latency for smooth UI feel
    setTimeout(() => {
      updateApiKey('openai', openaiKey);
      updateApiKey('anthropic', anthropicKey);
      updateApiKey('google', googleKey);
      setSystemPrompt(localPrompt);
      
      setIsSaving(false);
      setSaveSuccess(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with premium blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/90 text-zinc-100 shadow-2xl shadow-indigo-950/20 backdrop-blur-2xl transition-all duration-300 animate-scale-up md:max-w-xl">
        {/* Glow decoration */}
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

        {/* Header */}
        <div className="relative flex items-center justify-between border-b border-zinc-900 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400">
              <Key className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-white">API Settings</h2>
              <p className="text-xs text-zinc-500">Keys are stored locally in your browser.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="relative max-h-[70vh] overflow-y-auto px-6 py-5 space-y-5">
          {/* OpenAI Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">OpenAI API Key</label>
              {openaiKey && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                  Configured
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <input
                type={showOpenai ? 'text' : 'password'}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 pr-10 text-sm font-mono text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30"
              />
              <button
                type="button"
                onClick={() => setShowOpenai(!showOpenai)}
                className="absolute right-3 text-zinc-500 hover:text-zinc-300"
              >
                {showOpenai ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Anthropic Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Anthropic API Key</label>
              {anthropicKey && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                  Configured
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <input
                type={showAnthropic ? 'text' : 'password'}
                value={anthropicKey}
                onChange={(e) => setAnthropicKey(e.target.value)}
                placeholder="sk-ant-..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 pr-10 text-sm font-mono text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30"
              />
              <button
                type="button"
                onClick={() => setShowAnthropic(!showAnthropic)}
                className="absolute right-3 text-zinc-500 hover:text-zinc-300"
              >
                {showAnthropic ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Gemini Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Google Gemini API Key</label>
              {googleKey && (
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                  Configured
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <input
                type={showGoogle ? 'text' : 'password'}
                value={googleKey}
                onChange={(e) => setGoogleKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2.5 pr-10 text-sm font-mono text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30"
              />
              <button
                type="button"
                onClick={() => setShowGoogle(!showGoogle)}
                className="absolute right-3 text-zinc-500 hover:text-zinc-300"
              >
                {showGoogle ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* System Prompt */}
          <div className="space-y-1.5 pt-2 border-t border-zinc-900">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Global System Prompt</label>
              <div className="group relative">
                <Info className="h-3.5 w-3.5 text-zinc-500 cursor-help" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded bg-zinc-900 border border-zinc-800 p-2 text-[10px] leading-normal text-zinc-400 opacity-0 transition-opacity pointer-events-none group-hover:opacity-100 z-10 shadow-lg">
                  Sets the behavior and persona of the AI assistant for all chats.
                </span>
              </div>
            </div>
            <div className="relative">
              <textarea
                value={localPrompt}
                onChange={(e) => setLocalPrompt(e.target.value)}
                placeholder="You are a helpful, expert AI assistant..."
                rows={4}
                className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition-all focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 font-sans"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-900 px-6 py-4 bg-zinc-950/40">
          <div className="text-xs text-zinc-500">
            {saveSuccess ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium animate-pulse">
                <Check className="h-3.5 w-3.5" /> Settings saved!
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Terminal className="h-3.5 w-3.5 text-indigo-400" /> Client-side only
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="rounded-xl border border-zinc-800 px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="relative overflow-hidden rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2 text-sm font-semibold text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
