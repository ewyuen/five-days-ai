export type ModelProvider = 'openai' | 'anthropic' | 'google';
export type ModelCategory = 'reasoning' | 'fast' | 'balanced';

export interface Model {
  id: string;
  name: string;
  description: string;
  provider: ModelProvider;
  category: ModelCategory;
}

export const MODELS: Model[] = [
  // Local RAG
  {
    id: 'local-rag',
    name: 'Local RAG',
    description: 'Queries the locally running FastAPI RAG server over Cumulonimbus Robotics policy documents.',
    provider: 'openai',
    category: 'balanced',
  },
  // Local ReAct Agent (MCP)
  {
    id: 'local-react-agent',
    name: 'Local ReAct Agent (MCP)',
    description: 'Queries the local FastAPI ReAct server which uses tools to search policy RAG and the MCP org chart.',
    provider: 'openai',
    category: 'reasoning',
  },
  // OpenAI Models
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'High-performance, balanced model for general tasks, reasoning, and complex instructions.',
    provider: 'openai',
    category: 'balanced',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Fast, lightweight model optimized for low-latency responses and high efficiency.',
    provider: 'openai',
    category: 'fast',
  },
  {
    id: 'o1',
    name: 'o1',
    description: 'Reasoning model trained with reinforcement learning for complex STEM, coding, and multi-step reasoning.',
    provider: 'openai',
    category: 'reasoning',
  },
  {
    id: 'o3-mini',
    name: 'o3-mini',
    description: 'Cost-efficient reasoning model offering deep reasoning capabilities with faster speeds.',
    provider: 'openai',
    category: 'reasoning',
  },
  // Anthropic Models
  {
    id: 'claude-3-5-sonnet-latest',
    name: 'Claude 3.5 Sonnet',
    description: "Anthropic's most advanced balanced model with excellent reasoning, coding, and writing capabilities.",
    provider: 'anthropic',
    category: 'balanced',
  },
  {
    id: 'claude-3-5-haiku-latest',
    name: 'Claude 3.5 Haiku',
    description: "Anthropic's fastest model, offering high speed and efficiency with sonnet-like intelligence levels.",
    provider: 'anthropic',
    category: 'fast',
  },
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    description: 'Powerful reasoning model designed for complex analysis and deep research tasks.',
    provider: 'anthropic',
    category: 'reasoning',
  },
  // Google Models
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: "Google's state-of-the-art model for complex reasoning, planning, and coding.",
    provider: 'google',
    category: 'reasoning',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: "Google's high-speed, lightweight model for efficient, cost-effective processing.",
    provider: 'google',
    category: 'fast',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: "Google's reliable multimodal model with a very large context window for balanced tasks.",
    provider: 'google',
    category: 'balanced',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: "Google's legacy high-speed model offering fast responses and strong performance.",
    provider: 'google',
    category: 'fast',
  },
];
