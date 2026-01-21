import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, RefreshCw, Loader2, AlertTriangle, WifiOff } from 'lucide-react';
import { useChat, ChatMessage } from '@/hooks/useChat';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useAnalytics } from '@/hooks/useAnalytics';
import { toast } from '@/hooks/use-toast';
import { ChatSkeleton } from '@/components/ui/skeleton';
import DocumentPreview from './DocumentPreview';
import { DocumentData } from '@/lib/documentTypes';

export interface StarterPrompt {
  id: string;
  label: string;
  prompt_text: string;
}

export interface DocumentConfig {
  documentType: 'family_agreement' | '30_day_plan';
  label: string;
  starterPromptLabel: string;
}

interface ChatInterfaceProps {
  moduleId: string;
  userId: string;
  starterPrompts: StarterPrompt[];
  onFirstInteraction?: () => void;
  onPromptClicked?: (promptId: string) => void;
  clickedPromptIds?: Set<string>;
  onResetPrompts?: () => void;
  documentConfig?: DocumentConfig | null;
}

// Try to parse document JSON from a message
const parseDocumentFromMessage = (content: string): DocumentData | null => {
  try {
    // Look for JSON in code blocks
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.type === 'family_agreement' || parsed.type === '30_day_plan') {
        // Add dateCreated if not present
        if (!parsed.dateCreated) {
          parsed.dateCreated = new Date().toISOString();
        }
        return parsed as DocumentData;
      }
    }
    
    // Try parsing the whole content as JSON
    const parsed = JSON.parse(content);
    if (parsed.type === 'family_agreement' || parsed.type === '30_day_plan') {
      if (!parsed.dateCreated) {
        parsed.dateCreated = new Date().toISOString();
      }
      return parsed as DocumentData;
    }
  } catch {
    // Not valid JSON, return null
  }
  return null;
};

const MessageBubble = ({
  message,
  userId,
  moduleId,
}: {
  message: ChatMessage;
  userId?: string;
  moduleId?: string;
}) => {
  const isUser = message.role === 'user';
  const isError = message.id.startsWith('error-');
  
  // Check if this is a document response
  const documentData = !isUser ? parseDocumentFromMessage(message.content) : null;
  
  if (documentData) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[90%]">
          <DocumentPreview data={documentData} userId={userId} moduleId={moduleId} />
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${isError ? 'bg-destructive/10 text-destructive border border-destructive/20' : isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
        <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
        {message.created_at && <p className={`text-sm mt-1.5 ${isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
            {new Date(message.created_at).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })}
          </p>}
      </div>
    </div>
  );
};

const TypingIndicator = () => <div className="flex justify-start">
    <div className="rounded-2xl bg-muted px-4 py-3">
      <div className="flex gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{
        animationDelay: '0ms'
      }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{
        animationDelay: '150ms'
      }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{
        animationDelay: '300ms'
      }} />
      </div>
    </div>
  </div>;

// Error display component
const ErrorMessage = ({
  onRetry,
  onClear
}: {
  onRetry: () => void;
  onClear: () => void;
}) => <div className="flex justify-start">
    <div className="max-w-[85%] rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground text-sm">Something went wrong</p>
          <p className="text-xs text-muted-foreground mt-1 mb-3">
            We couldn't get a response. This might be temporary.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onRetry} className="h-7 text-xs">
              Try Again
            </Button>
            <Button variant="ghost" size="sm" onClick={onClear} className="h-7 text-xs">
              Start Fresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>;

const ChatInterface = ({
  moduleId,
  userId,
  starterPrompts,
  onFirstInteraction,
  onPromptClicked,
  clickedPromptIds = new Set(),
  onResetPrompts,
  documentConfig,
}: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState('');
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasTriggeredInteraction = useRef(false);
  const {
    isOnline
  } = useNetworkStatus();
  const {
    trackPromptClicked,
    trackMessageSent
  } = useAnalytics();
  const {
    messages,
    isLoading,
    isLoadingHistory,
    error,
    sendMessage,
    clearConversation,
    retryLastMessage,
    hasHistory
  } = useChat({
    moduleId,
    userId,
    documentType: documentConfig?.documentType || null,
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  }, [messages, error]);

  // Trigger first interaction callback
  useEffect(() => {
    if (messages.length > 0 && !hasTriggeredInteraction.current) {
      hasTriggeredInteraction.current = true;
      onFirstInteraction?.();
    }
  }, [messages.length, onFirstInteraction]);

  // Show offline toast
  useEffect(() => {
    if (!isOnline) {
      toast({
        title: "You're offline",
        description: "Messages will be sent when you're back online.",
        variant: "destructive"
      });
    }
  }, [isOnline]);

  const handlePromptClick = (prompt: StarterPrompt) => {
    if (!isOnline) {
      toast({
        title: "You're offline",
        description: "Please check your internet connection.",
        variant: "destructive"
      });
      return;
    }
    setLastFailedMessage(prompt.prompt_text);
    trackPromptClicked(moduleId, prompt.label);
    trackMessageSent(moduleId, prompt.prompt_text.length);
    onPromptClicked?.(prompt.id);
    // Display the label, but send the full prompt text to the AI
    sendMessage(prompt.label, prompt.prompt_text);
  };

  // Filter out already clicked prompts
  const remainingPrompts = starterPrompts.filter(p => !clickedPromptIds.has(p.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    if (!isOnline) {
      toast({
        title: "You're offline",
        description: "Please check your internet connection.",
        variant: "destructive"
      });
      return;
    }
    setLastFailedMessage(inputValue.trim());
    trackMessageSent(moduleId, inputValue.trim().length);
    sendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleRetry = () => {
    if (lastFailedMessage) {
      retryLastMessage(lastFailedMessage);
    }
  };

  const handleClearAndRestart = async () => {
    await clearConversation();
    setLastFailedMessage(null);
    onResetPrompts?.(); // Reset clicked prompts to show all buttons again
    toast({
      title: "Conversation cleared",
      description: "You can start a fresh conversation."
    });
  };

  if (isLoadingHistory) {
    return <ChatSkeleton />;
  }

  return <div className="overflow-hidden rounded-xl border border-border bg-card">
      {/* Offline banner */}
      {!isOnline && <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 flex items-center gap-2">
          <WifiOff className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive font-medium">You're offline</span>
        </div>}

      {/* Minimal header */}
      <div className="border-b border-border/50 px-4 py-3 md:px-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="font-medium text-foreground text-sm">AI Assistant</h2>
          </div>
          {hasHistory && <Button variant="ghost" size="sm" onClick={handleClearAndRestart} className="text-muted-foreground hover:text-foreground h-8 px-2 text-xs">
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>}
        </div>
      </div>

      {/* Messages area */}
      <div className="h-[400px] md:h-[450px] overflow-y-auto p-4 md:p-6">
        {messages.length === 0 ? <div className="space-y-4">
            <p className="text-center text-muted-foreground text-base">Start a conversation with one of these prompts or ask your own:</p>
            {/* Mobile: single column, Desktop: two columns */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              {starterPrompts.map(prompt => <button key={prompt.id} onClick={() => handlePromptClick(prompt)} disabled={isLoading || !isOnline} className="rounded-xl border border-border bg-background p-4 text-left transition-all duration-200 hover:border-primary/50 hover:shadow-soft disabled:opacity-50 active:scale-[0.98]">
                  <span className="text-base font-medium text-foreground">{prompt.label}</span>
                </button>)}
            </div>
            {starterPrompts.length === 0 && <p className="text-center text-base text-muted-foreground">
                No starter prompts available. Type your question below.
              </p>}
          </div> : <div className="space-y-4">
            {messages.map(message => <MessageBubble key={message.id} message={message} userId={userId} moduleId={moduleId} />)}
            {isLoading && messages[messages.length - 1]?.role === 'user' && <TypingIndicator />}
            {error && !isLoading && <ErrorMessage onRetry={handleRetry} onClear={handleClearAndRestart} />}
            <div ref={messagesEndRef} />
          </div>}
      </div>

      {/* Remaining prompts below chat - only show when conversation has started and prompts remain */}
      {messages.length > 0 && remainingPrompts.length > 0 && <div className="border-t border-border bg-muted/20 px-4 py-3 md:px-6 md:py-4">
          <p className="text-sm text-muted-foreground mb-2.5">More prompts to explore:</p>
          <div className="flex flex-wrap gap-2">
            {remainingPrompts.map(prompt => <button key={prompt.id} onClick={() => handlePromptClick(prompt)} disabled={isLoading || !isOnline} className="rounded-lg border border-border bg-background px-3 py-2.5 text-left transition-all duration-200 hover:border-primary/50 hover:shadow-soft disabled:opacity-50 active:scale-[0.98]">
                <span className="text-sm font-medium text-foreground">{prompt.label}</span>
              </button>)}
          </div>
        </div>}

      {/* Input area - thumb accessible on mobile */}
      <div className="border-t border-border bg-muted/30">
        <form onSubmit={handleSubmit} className="flex items-center gap-3 p-4 pb-2">
          <Input ref={inputRef} value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={handleKeyDown} placeholder={messages.length > 0 ? "Ask a follow-up question..." : "Type your question..."} className="flex-1 h-12 text-base" disabled={isLoading || !isOnline} />
          <Button type="submit" size="icon" disabled={!inputValue.trim() || isLoading || !isOnline} className="h-12 w-12 flex-shrink-0">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </Button>
        </form>
        <p className="px-4 pb-3 text-xs text-muted-foreground text-center">
          AI responses may contain errors. Always verify important decisions with your own judgment or a professional.
        </p>
      </div>
    </div>;
};

export default ChatInterface;
