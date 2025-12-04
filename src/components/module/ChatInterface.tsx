import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { useChat, ChatMessage } from '@/hooks/useChat';

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
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
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

const ChatInterface = ({ moduleId, userId, starterPrompts, onFirstInteraction }: ChatInterfaceProps) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasTriggeredInteraction = useRef(false);
  
  const {
    messages,
    isLoading,
    isLoadingHistory,
    sendMessage,
    clearConversation,
    hasHistory,
  } = useChat({ moduleId, userId });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Trigger first interaction callback
  useEffect(() => {
    if (messages.length > 0 && !hasTriggeredInteraction.current) {
      hasTriggeredInteraction.current = true;
      onFirstInteraction?.();
    }
  }, [messages.length, onFirstInteraction]);

  const handlePromptClick = (promptText: string) => {
    sendMessage(promptText);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (isLoadingHistory) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <div className="border-b border-border bg-muted/50 px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <h2 className="font-heading font-semibold text-foreground">AI Coaching Assistant</h2>
          </div>
        </div>
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      {/* Header */}
      <div className="border-b border-border bg-muted/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <h2 className="font-heading font-semibold text-foreground">AI Coaching Assistant</h2>
          </div>
          {hasHistory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearConversation}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="mr-1 h-4 w-4" />
              Start Fresh
            </Button>
          )}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask questions about this module or get personalized parenting guidance
        </p>
      </div>

      {/* Messages area */}
      <div className="h-[400px] overflow-y-auto p-6">
        {messages.length === 0 ? (
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">
              Start a conversation with one of these prompts:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  onClick={() => handlePromptClick(prompt.prompt_text)}
                  disabled={isLoading}
                  className="rounded-xl border border-border bg-background p-4 text-left transition-all duration-200 hover:border-primary/50 hover:shadow-soft disabled:opacity-50"
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
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="flex items-center gap-3 border-t border-border bg-muted/30 p-4">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={messages.length > 0 ? "Ask a follow-up question..." : "Type your question..."}
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={!inputValue.trim() || isLoading}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
};

export default ChatInterface;
