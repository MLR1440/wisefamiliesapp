import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, TrendingUp, Rocket, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizResult } from '@/hooks/useQuiz';

interface QuizResultsProps {
  result: QuizResult;
  emailCaptured?: boolean;
}

const categoryConfig = {
  'ai-ready': {
    title: 'AI-Ready Foundation',
    subtitle: "You're ahead of most parents!",
    icon: Sparkles,
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
  },
  'growing': {
    title: 'Growing Awareness',
    subtitle: "You're building momentum",
    icon: TrendingUp,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
    borderColor: 'border-secondary/30',
  },
  'early': {
    title: 'Early Days',
    subtitle: "Perfect time to start",
    icon: Rocket,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
  },
};

export function QuizResults({ result, emailCaptured }: QuizResultsProps) {
  const config = categoryConfig[result.category];
  const Icon = config.icon;

  return (
    <div className="animate-fade-up text-center">
      {/* Score Display */}
      <div className={cn(
        "inline-flex items-center gap-3 px-6 py-3 rounded-full mb-6",
        config.bgColor, config.borderColor, "border"
      )}>
        <Icon className={cn("h-6 w-6", config.color)} />
        <span className={cn("font-semibold text-lg", config.color)}>
          {config.title}
        </span>
      </div>

      <h3 className="text-2xl sm:text-3xl font-heading font-bold text-foreground mb-2">
        Your AI-Readiness Score
      </h3>
      
      {/* Score Circle */}
      <div className="relative w-32 h-32 mx-auto my-8">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="45" fill="none"
            stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${(result.score / 10) * 283} 283`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-primary">{result.score}</span>
          <span className="text-sm text-muted-foreground">/10</span>
        </div>
      </div>

      <p className="text-lg text-muted-foreground mb-2">
        {config.subtitle}
      </p>

      {/* Reassuring message */}
      <p className="text-sm font-medium text-foreground/80 mb-4">
        The fact that you took this quiz already puts you ahead of most parents.
      </p>

      {/* Category description */}
      <p className="text-muted-foreground mb-6">
        {result.description}
      </p>

      {/* What your score means */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-6 text-left">
        <h4 className="font-heading font-semibold text-foreground mb-3">
          What your score means
        </h4>
        <p className="text-muted-foreground mb-4">
          {result.insight}
        </p>
        <div className={cn(
          "flex items-start gap-3 rounded-xl p-4",
          config.bgColor, config.borderColor, "border"
        )}>
          <Lightbulb className={cn("h-5 w-5 mt-0.5 flex-shrink-0", config.color)} />
          <div>
            <span className={cn("font-semibold text-sm", config.color)}>Your one step today:</span>
            <p className="text-foreground/80 text-sm mt-1">{result.oneStepToday}</p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-8 text-left">
        <h4 className="font-heading font-semibold text-foreground mb-4">
          Here's what you can do right now:
        </h4>
        <ul className="space-y-3">
          {result.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                {index + 1}
              </span>
              <span className="text-muted-foreground">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <a href="#pricing">
        <Button variant="cta" size="lg" className="gap-2 shadow-lg hover:shadow-xl">
          Start the Course
          <ArrowRight className="h-5 w-5" />
        </Button>
      </a>
      
      {emailCaptured && (
        <p className="mt-4 text-sm text-muted-foreground">
          Check your inbox — we've sent you 3 practical actions you can take this week plus your full AI-readiness breakdown.
        </p>
      )}

      {/* Blog link */}
      <div className="mt-6">
        <a
          href="https://wisefamilies.co/blog/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Want to learn more? Explore our blog →
        </a>
      </div>
    </div>
  );
}
