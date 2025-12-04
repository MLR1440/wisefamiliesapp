export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  orderNumber: number;
  videoUrl: string;
  videoType: 'youtube' | 'vimeo' | 'direct';
  systemPrompt: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

export interface ModulePrompt {
  id: string;
  moduleId: string;
  label: string;
  promptText: string;
  orderNumber: number;
}

export interface Progress {
  id: string;
  userId: string;
  moduleId: string;
  startedAt: Date | null;
  completedAt: Date | null;
  firstPromptClicked: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  moduleId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

export interface Purchase {
  id: string;
  userId: string;
  stripeSessionId: string;
  stripePaymentId: string;
  amount: number;
  status: 'pending' | 'completed' | 'refunded';
  createdAt: Date;
}

export interface Settings {
  courseTitle: string;
  coursePrice: number;
  llmProvider: 'openai' | 'anthropic' | 'openrouter';
  llmModel: string;
  llmTemperature: number;
}
