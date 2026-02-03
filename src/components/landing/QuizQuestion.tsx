import { cn } from '@/lib/utils';
import { CheckCircle } from 'lucide-react';

interface QuizOption {
  value: string;
  label: string;
  points: number;
}

interface QuizQuestionProps {
  question: string;
  options: readonly QuizOption[];
  selectedValue?: string;
  onSelect: (value: string) => void;
}

export function QuizQuestion({ question, options, selectedValue, onSelect }: QuizQuestionProps) {
  return (
    <div className="animate-fade-up">
      <h3 className="text-xl sm:text-2xl font-heading font-semibold text-foreground mb-6 text-center">
        {question}
      </h3>
      
      <div className="grid gap-3">
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                "hover:border-primary/50 hover:bg-primary/5",
                "focus:outline-none focus:ring-2 focus:ring-primary/20",
                isSelected
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border bg-card"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <span className={cn(
                  "font-medium",
                  isSelected ? "text-primary" : "text-foreground"
                )}>
                  {option.label}
                </span>
                
                {isSelected && (
                  <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
