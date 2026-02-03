import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useQuiz } from '@/hooks/useQuiz';
import { QuizQuestion } from './QuizQuestion';
import { QuizResults } from './QuizResults';
import { cn } from '@/lib/utils';

export function Quiz() {
  const {
    currentStep,
    totalSteps,
    currentQuestion,
    isEmailStep,
    answers,
    email,
    setEmail,
    isSubmitting,
    result,
    isComplete,
    handleAnswer,
    handleBack,
    handleSubmit,
  } = useQuiz();

  const progressPercent = ((currentStep) / totalSteps) * 100;

  return (
    <section className="py-16 sm:py-20 bg-background" id="quiz">
      <div className="container px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          {!isComplete && (
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
            {!isComplete ? (
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

                {/* Question or Email Step */}
                {currentQuestion && !isEmailStep && (
                  <QuizQuestion
                    question={currentQuestion.question}
                    options={currentQuestion.options}
                    selectedValue={answers[currentQuestion.id]}
                    onSelect={handleAnswer}
                  />
                )}

                {isEmailStep && (
                  <div className="animate-fade-up">
                    <h3 className="text-xl sm:text-2xl font-heading font-semibold text-foreground mb-2 text-center">
                      Almost there! 🎉
                    </h3>
                    <p className="text-muted-foreground text-center mb-6">
                      Where should we send your AI-Readiness Score?
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
                            Calculating...
                          </>
                        ) : (
                          <>
                            Get My Score
                            <ArrowRight className="h-5 w-5" />
                          </>
                        )}
                      </Button>
                      
                      <p className="text-xs text-muted-foreground text-center">
                        We respect your privacy. Unsubscribe anytime.
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                {currentStep > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <Button
                      variant="ghost"
                      onClick={handleBack}
                      className="gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                  </div>
                )}
              </>
            ) : (
              /* Results */
              result && <QuizResults result={result} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Quiz;
