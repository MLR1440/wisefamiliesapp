import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { mockUser, mockModules, mockModulePrompts } from '@/data/mockData';
import { ArrowRight, ArrowLeft, Send, Sparkles, Play } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const ModulePage = () => {
  const { moduleId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const module = mockModules.find((m) => m.id === moduleId);
  const moduleIndex = mockModules.findIndex((m) => m.id === moduleId);
  const prompts = mockModulePrompts.filter((p) => p.moduleId === moduleId);
  const nextModule = mockModules[moduleIndex + 1];
  const prevModule = mockModules[moduleIndex - 1];

  if (!module) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Module not found</p>
      </div>
    );
  }

  const handlePromptClick = (promptText: string) => {
    setHasInteracted(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: promptText,
    };
    setMessages([...messages, userMessage]);

    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Great question! This is a simulated response about "${promptText.substring(0, 50)}...". In the full implementation, this would connect to your configured LLM provider to provide personalized guidance based on your parenting situation.`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    setHasInteracted(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
    };
    setMessages([...messages, userMessage]);
    setInputValue('');

    // Simulate AI response
    setIsTyping(true);
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Thank you for sharing that. This is a simulated response to your question. In the full implementation, this would provide personalized AI coaching based on the module's system prompt and your specific parenting situation.`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };

  // Extract YouTube video ID for embedding
  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const embedUrl = getYouTubeEmbedUrl(module.videoUrl);

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn hasPurchased userName={mockUser.firstName} />

      <main className="container py-8 md:py-12">
        {/* Back navigation */}
        <Link
          to="/dashboard"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        {/* Module header */}
        <div className="mb-8">
          <span className="mb-2 inline-block text-sm font-medium text-secondary">
            Module {moduleIndex + 1} of {mockModules.length}
          </span>
          <h1 className="mb-3 font-heading text-3xl font-bold text-foreground md:text-4xl">
            {module.title}
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">{module.description}</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Main content - Video & Chat */}
          <div className="lg:col-span-3 space-y-8">
            {/* Video Section */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              {embedUrl ? (
                <div className="aspect-video">
                  <iframe
                    src={embedUrl}
                    title={module.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="flex aspect-video items-center justify-center bg-muted">
                  <div className="text-center">
                    <Play className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">Video player placeholder</p>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Section */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
              <div className="border-b border-border bg-muted/50 px-6 py-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" />
                  <h2 className="font-heading font-semibold text-foreground">
                    AI Coaching Assistant
                  </h2>
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
                      {prompts.map((prompt) => (
                        <button
                          key={prompt.id}
                          onClick={() => handlePromptClick(prompt.promptText)}
                          className="rounded-xl border border-border bg-background p-4 text-left transition-all duration-200 hover:border-primary/50 hover:shadow-soft"
                        >
                          <span className="text-sm font-medium text-foreground">
                            {prompt.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-foreground'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="rounded-2xl bg-muted px-4 py-3">
                          <div className="flex gap-1">
                            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '0ms' }} />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '150ms' }} />
                            <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Input area */}
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-3 border-t border-border bg-muted/30 p-4"
              >
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask a question..."
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!inputValue.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>

          {/* Sidebar - Navigation */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mark as complete */}
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="complete"
                  checked={isCompleted}
                  onCheckedChange={(checked) => setIsCompleted(checked as boolean)}
                />
                <label
                  htmlFor="complete"
                  className="text-sm font-medium text-foreground cursor-pointer"
                >
                  Mark as completed
                </label>
              </div>
            </div>

            {/* Next module preview */}
            {nextModule && (
              <div className="rounded-xl border border-border bg-card p-6">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Up Next
                </span>
                <h3 className="mt-2 font-heading font-semibold text-foreground">
                  {nextModule.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                  {nextModule.description}
                </p>
                <Link to={`/course/${nextModule.id}`}>
                  <Button
                    variant={hasInteracted ? 'cta' : 'soft'}
                    className="mt-4 w-full gap-2"
                    disabled={!hasInteracted}
                  >
                    Continue to Next Module
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                {!hasInteracted && (
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Complete at least one prompt to continue
                  </p>
                )}
              </div>
            )}

            {/* Previous module */}
            {prevModule && (
              <Link to={`/course/${prevModule.id}`}>
                <Button variant="ghost" className="w-full gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Previous: {prevModule.title}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ModulePage;
