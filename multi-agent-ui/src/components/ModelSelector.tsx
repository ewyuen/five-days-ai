'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useChatState } from '@/context/ChatContext';
import { MODELS, Model } from '@/lib/models';
import { ChevronDown, Sparkles, Zap, Brain, Check } from 'lucide-react';

export default function ModelSelector() {
  const { selectedModelId, setSelectedModelId, apiKeys } = useChatState();
  const [isOpen, setIsOpen] = useState(false);
  const [serverAvailability, setServerAvailability] = useState<Record<string, boolean>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch model availability on mount
  useEffect(() => {
    async function fetchAvailability() {
      try {
        const response = await fetch('/api/models');
        if (response.ok) {
          const data = await response.json();
          const availabilityMap: Record<string, boolean> = {};
          data.models.forEach((m: any) => {
            availabilityMap[m.id] = m.isAvailable;
          });
          setServerAvailability(availabilityMap);
        }
      } catch (error) {
        console.error('[ModelSelector] Error fetching models availability:', error);
      }
    }
    fetchAvailability();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedModel = MODELS.find((m) => m.id === selectedModelId) || MODELS[0];

  // Check if a model has its key configured (either server-side or client-side)
  const isKeyConfigured = (model: Model) => {
    if (model.id === 'local-rag') {
      // Local RAG requires OpenAI key
      return serverAvailability['gpt-4o-mini'] || !!apiKeys['openai'];
    }
    const isServerConfigured = serverAvailability[model.id] || false;
    const clientKey = apiKeys[model.provider];
    return isServerConfigured || !!clientKey;
  };

  const getProviderBadgeStyle = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'anthropic':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'google':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

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

  const getCategoryStyle = (category: string) => {
    switch (category) {
      case 'fast':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      case 'reasoning':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'balanced':
      default:
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-zinc-200 hover:border-zinc-700 hover:bg-zinc-900 transition-all focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
      >
        <span className="flex items-center gap-2">
          {/* Key Indicator Dot */}
          <span
            className={`h-2 w-2 rounded-full ring-4 ${
              isKeyConfigured(selectedModel)
                ? 'bg-emerald-400 ring-emerald-500/20'
                : 'bg-amber-400 ring-amber-500/20 animate-pulse'
            }`}
          />
          <span className="font-semibold text-white">{selectedModel.name}</span>
          <span className="text-xs text-zinc-500">({selectedModel.provider})</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 z-40 w-80 md:w-96 origin-top-left rounded-2xl border border-zinc-800 bg-zinc-950/95 p-2 shadow-2xl backdrop-blur-2xl transition-all">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-900 mb-1.5 flex justify-between items-center">
            <span>Select Model</span>
            <span className="normal-case text-zinc-600 flex items-center gap-1 font-normal">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Configured
              <span className="h-2 w-2 rounded-full bg-amber-400 ml-2" /> Key Missing
            </span>
          </div>

          <div className="max-h-[360px] overflow-y-auto space-y-1 pr-1 scrollbar-thin">
            {MODELS.map((model) => {
              const active = model.id === selectedModelId;
              const configured = isKeyConfigured(model);

              return (
                <button
                  key={model.id}
                  onClick={() => {
                    setSelectedModelId(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left rounded-xl p-3 flex items-start justify-between gap-3 border transition-all ${
                    active
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-white'
                      : 'border-transparent text-zinc-300 hover:bg-zinc-900/50 hover:text-white'
                  }`}
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Configuration Dot */}
                      <span
                        className={`h-2.5 w-2.5 rounded-full border border-zinc-950 ${
                          configured ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      />
                      <span className="font-semibold text-sm">{model.name}</span>
                      
                      {/* Provider Badge */}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-mono capitalize ${getProviderBadgeStyle(model.provider)}`}>
                        {model.provider}
                      </span>

                      {/* Category Badge */}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-mono capitalize flex items-center gap-1 ${getCategoryStyle(model.category)}`}>
                        {getCategoryIcon(model.category)}
                        {model.category}
                      </span>
                    </div>
                    
                    <p className="text-xs text-zinc-400 font-normal leading-relaxed">
                      {model.description}
                    </p>
                  </div>

                  {active && (
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
