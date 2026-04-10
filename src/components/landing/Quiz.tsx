import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Loader2, Sparkles, TrendingUp, Rocket } from 'lucide-react';
import { useQuiz } from '@/hooks/useQuiz';
import { QuizQuestion } from './QuizQuestion';
import { QuizResults } from './QuizResults';
import { cn } from '@/lib/utils';

const categoryPreviewConfig = {
  'ai-ready': {
    title: 'AI-Ready Foundation',
    icon: Sparkles,
    color: 'text-success',
    bgColor: 'bg-success/10',
    borderColor: 'border-success/30',
  },
  'growing': {
    title: 'Growing Awareness',
    icon: TrendingUp,
    color: 'text-secondary',
    bgColor: 'bg-secondary/10',
    borderColor: 'border-secondary/30',
  },
  'early': {
    title: 'Early Days',
    icon: Rocket,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    borderColor: 'border-primary/30',
  },
};

export function Quiz() {
  const {
    currentStep,
    totalSteps,
    currentQuestion,
    isPreviewStep,
    showingPreview,
    answers,
    email,
    setEmail,
    isSubmitting,
    result,
    isComplete,
    handleAnswer,
    handleBack,
    handleSubmit,
    handleSkipEmail,
  } = useQuiz();

  const progressPercent = ((currentStep) / totalSteps) * 100;

  return (
    <section className="py-16 sm:py-20 bg-background" id="quiz">
      <div className="container px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          {!isComplete && !showingPreview && (
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                Free Assessment
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-3">
                Discover Your Family's AI-Readiness
              </h2>
              <p className="text-lg text-muted-foreground">
                Take this 60-second quiz to get your personalized score
              </p>
            </div>
          )}

          {/* Quiz Card */}
          <div className="bg-card border border-border rounded-2xl shadow-card p-6 sm:p-8">
            {isComplete && result ? (
              <QuizResults result={result} emailCaptured={!!email} />
            ) : showingPreview && result ? (
              /* Score Preview + Email Capture */
              <div className="animate-fade-up text-center">
                {/* Score Circle */}
                <div className="relative w-28 h-28 mx-auto my-4">
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
                    <span className="text-3xl font-bold text-primary">{result.score}</span>
                    <span className="text-xs text-muted-foreground">/10</span>
                  </div>
                </div>

                {/* Category Badge */}
                {(() => {
                  const config = categoryPreviewConfig[result.category];
                  const Icon = config.icon;
                  return (
                    <div className={cn(
                      "inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 border",
                      config.bgColor, config.borderColor
                    )}>
                      <Icon className={cn("h-5 w-5", config.color)} />
                      <span className={cn("font-semibold", config.color)}>{config.title}</span>
                    </div>
                  );
                })()}

                <h3 className="text-xl sm:text-2xl font-heading font-semibold text-foreground mb-2">
                  Your AI-Readiness Score
                </h3>
                <p className="text-muted-foreground mb-6">
                  Want personalized recommendations and tips sent to your inbox?
                </p>

                <div className="space-y-4">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 text-base"
                    autoFocus
                  />
                  
                  <Button
                    onClick={handleSubmit}
                    disabled={!email || isSubmitting}
                    variant="cta"
                    size="lg"
                    className="w-full gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Get My Personalized Report
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </Button>
                  
                  <button
                    onClick={handleSkipEmail}
                    className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
                  >
                    Skip — just show my results
                  </button>
                  
                  <p className="text-xs text-muted-foreground">
                    We respect your privacy. Unsubscribe anytime.
                  </p>
                </div>

                {/* Back button */}
                <div className="mt-6 pt-6 border-t border-border">
                  <Button variant="ghost" onClick={handleBack} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">
                      Step {currentStep + 1} of {totalSteps}
                    </span>
                    <span className="text-sm font-medium text-primary">
                      {Math.round(progressPercent)}%
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                </div>

                {/* Question */}
                {currentQuestion && (
                  <QuizQuestion
                    question={currentQuestion.question}
                    options={currentQuestion.options}
                    selectedValue={answers[currentQuestion.id]}
                    onSelect={handleAnswer}
                  />
                )}

                {/* Navigation */}
                {currentStep > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <Button variant="ghost" onClick={handleBack} className="gap-2">
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Quiz;
