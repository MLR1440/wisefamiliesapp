import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, RefreshCw, Loader2, AlertTriangle, WifiOff } from 'lucide-react';
import { useChat, ChatMessage } from '@/hooks/useChat';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { toast } from '@/hooks/use-toast';
import { ChatSkeleton } from '@/components/ui/skeleton';

interface StarterPrompt {
  id: string;
  label: string;
  prompt_text: string;
}

interface ChatInterfaceProps {
  moduleId: string;
  userId: string;
  starterPrompts: StarterPrompt[];
  onFirstInteraction?: () => void;
}

const MessageBubble = ({ message }: { message: ChatMessage }) => {
  const isUser = message.role === 'user';
  const isError = message.id.startsWith('error-');
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isError
            ? 'bg-destructive/10 text-destructive border border-destructive/20'
            : isUser
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        {message.created_at && (
          <p className={`text-xs mt-1 ${isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  );
};

const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="rounded-2xl bg-muted px-4 py-3">
      <div className="flex gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '0ms' }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '150ms' }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

// Error display component
const ErrorMessage = ({ onRetry, onClear }: { onRetry: () => void; onClear: () => void }) => (
  <div className="flex justify-start">
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
  </div>
);

const ChatInterface = ({ moduleId, userId, starterPrompts, onFirstInteraction }: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState('');
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasTriggeredInteraction = useRef(false);
  const { isOnline } = useNetworkStatus();
  
  const {
    messages,
    isLoading,
    isLoadingHistory,
    error,
    sendMessage,
    clearConversation,
    retryLastMessage,
    hasHistory,
  } = useChat({ moduleId, userId });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
        variant: "destructive",
      });
    }
  }, [isOnline]);

  const handlePromptClick = (promptText: string) => {
    if (!isOnline) {
      toast({
        title: "You're offline",
        description: "Please check your internet connection.",
        variant: "destructive",
      });
      return;
    }
    setLastFailedMessage(promptText);
    sendMessage(promptText);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    if (!isOnline) {
      toast({
        title: "You're offline",
        description: "Please check your internet connection.",
        variant: "destructive",
      });
      return;
    }
    
    setLastFailedMessage(inputValue.trim());
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
    toast({
      title: "Conversation cleared",
      description: "You can start a fresh conversation.",
    });
  };

  if (isLoadingHistory) {
    return <ChatSkeleton />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      {/* Offline banner */}
      {!isOnline && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-2 flex items-center gap-2">
          <WifiOff className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive font-medium">You're offline</span>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-border bg-muted/50 px-4 py-3 md:px-6 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <h2 className="font-heading font-semibold text-foreground text-sm md:text-base">AI Coaching Assistant</h2>
          </div>
          {hasHistory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAndRestart}
              className="text-muted-foreground hover:text-foreground h-8 px-2 md:px-3"
            >
              <RefreshCw className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Start Fresh</span>
            </Button>
          )}
        </div>
        <p className="mt-1 text-xs md:text-sm text-muted-foreground">
          Ask questions about this module or get personalized parenting guidance
        </p>
      </div>

      {/* Messages area */}
      <div className="h-[350px] md:h-[400px] overflow-y-auto p-4 md:p-6">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <p className="text-center text-muted-foreground text-sm">
              Start a conversation with one of these prompts:
            </p>
            {/* Mobile: single column, Desktop: two columns */}
            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handlePromptClick(prompt.prompt_text)}
                  disabled={isLoading || !isOnline}
                  className="rounded-xl border border-border bg-background p-4 text-left transition-all duration-200 hover:border-primary/50 hover:shadow-soft disabled:opacity-50 active:scale-[0.98]"
                >
                  <span className="text-sm font-medium text-foreground">{prompt.label}</span>
                </button>
              ))}
            </div>
            {starterPrompts.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">
                No starter prompts available. Type your question below.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && <TypingIndicator />}
            {error && !isLoading && (
              <ErrorMessage onRetry={handleRetry} onClear={handleClearAndRestart} />
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area - thumb accessible on mobile */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 md:gap-3 border-t border-border bg-muted/30 p-3 md:p-4">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={messages.length > 0 ? "Ask a follow-up question..." : "Type your question..."}
          className="flex-1 h-10 md:h-10 text-base"
          disabled={isLoading || !isOnline}
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={!inputValue.trim() || isLoading || !isOnline}
          className="h-10 w-10 md:h-10 md:w-10 flex-shrink-0"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
};

export default ChatInterface;
