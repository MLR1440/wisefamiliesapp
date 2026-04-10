import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface QuizAnswer {
  childAge: string;
  aiUsage: string;
  biggestConcern: string;
  currentApproach: string;
  confidenceLevel: number;
}

export interface QuizResult {
  score: number;
  category: 'ai-ready' | 'growing' | 'early';
  recommendations: string[];
}

const QUIZ_QUESTIONS = [
  {
    id: 'childAge',
    question: "What age range is your child?",
    options: [
      { value: 'under-8', label: 'Under 8 years old', points: 1 },
      { value: '8-11', label: '8-11 years old', points: 2 },
      { value: '12-14', label: '12-14 years old', points: 2 },
      { value: '15-plus', label: '15+ years old', points: 2 },
    ],
  },
  {
    id: 'aiUsage',
    question: "Has your child used AI tools like ChatGPT?",
    options: [
      { value: 'regularly', label: 'Yes, regularly', points: 2 },
      { value: 'occasionally', label: 'Yes, occasionally', points: 2 },
      { value: 'once-twice', label: 'Just once or twice', points: 1 },
      { value: 'never', label: 'Not yet', points: 0 },
    ],
  },
  {
    id: 'biggestConcern',
    question: "What's your biggest concern about kids and AI?",
    options: [
      { value: 'homework', label: 'Using AI for homework shortcuts', points: 1 },
      { value: 'misinformation', label: 'Believing false information', points: 1 },
      { value: 'screen-time', label: 'More screen time addiction', points: 1 },
      { value: 'social', label: 'Replacing real social connections', points: 1 },
    ],
  },
  {
    id: 'currentApproach',
    question: "What's your current approach to AI at home?",
    options: [
      { value: 'guided', label: 'Active guidance and discussion', points: 3 },
      { value: 'monitoring', label: 'Monitoring but not much guidance', points: 2 },
      { value: 'no-rules', label: 'No specific rules yet', points: 1 },
      { value: 'banned', label: 'Banned or restricted entirely', points: 0 },
    ],
  },
  {
    id: 'confidenceLevel',
    question: "How confident do you feel guiding your child on AI?",
    options: [
      { value: '5', label: 'Very confident', points: 2 },
      { value: '4', label: 'Somewhat confident', points: 2 },
      { value: '3', label: 'Neutral', points: 1 },
      { value: '2', label: 'Not very confident', points: 0 },
      { value: '1', label: 'Not confident at all', points: 0 },
    ],
  },
  {
    id: 'aiKnowledge',
    question: "How would you describe your own understanding of AI?",
    options: [
      { value: 'strong', label: 'I could explain it to a friend', points: 3 },
      { value: 'basics', label: 'I know the basics', points: 2 },
      { value: 'heard', label: "I've heard of it but not much more", points: 1 },
      { value: 'lost', label: "I'm pretty lost", points: 0 },
    ],
  },
  {
    id: 'familyDiscussion',
    question: "How often does your family talk about technology or AI?",
    options: [
      { value: 'regularly', label: 'Regularly — it comes up often', points: 3 },
      { value: 'sometimes', label: 'Sometimes, when something prompts it', points: 2 },
      { value: 'rarely', label: 'Rarely', points: 1 },
      { value: 'never', label: 'Never', points: 0 },
    ],
  },
  {
    id: 'desiredOutcome',
    question: "What would success look like for you after this course?",
    options: [
      { value: 'conversations', label: 'Confident conversations about AI with my child', points: 1 },
      { value: 'boundaries', label: 'Clear rules and boundaries around AI use', points: 1 },
      { value: 'safety', label: 'Knowing how to keep my child safe online', points: 1 },
      { value: 'understanding', label: 'Understanding AI well enough to guide them', points: 1 },
    ],
  },
] as const;

export function useQuiz() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const totalSteps = QUIZ_QUESTIONS.length + 1; // +1 for email capture

  const currentQuestion = QUIZ_QUESTIONS[currentStep] || null;
  const isEmailStep = currentStep === QUIZ_QUESTIONS.length;

  const calculateResult = useCallback((answers: Record<string, string>): QuizResult => {
    let totalPoints = 0;
    
    QUIZ_QUESTIONS.forEach((question) => {
      const answer = answers[question.id];
      const option = question.options.find((opt) => opt.value === answer);
      if (option) {
        totalPoints += option.points;
      }
    });

    // Max possible score is ~11, normalize to 10
    const score = Math.min(10, Math.round((totalPoints / 17) * 10));
    
    let category: QuizResult['category'];
    let recommendations: string[];

    if (score >= 7) {
      category = 'ai-ready';
      recommendations = [
        "You've built a strong foundation—this course will help you refine and strengthen it.",
        "Learn advanced strategies to keep pace as AI evolves rapidly.",
        "Join a community of like-minded parents to share insights.",
      ];
    } else if (score >= 4) {
      category = 'growing';
      recommendations = [
        "You're on the right track! The course fills crucial gaps in AI parenting.",
        "Get practical frameworks to turn monitoring into meaningful guidance.",
        "Build confidence with step-by-step conversation starters.",
      ];
    } else {
      category = 'early';
      recommendations = [
        "Great timing! Starting now gives you a real advantage.",
        "The course provides a complete roadmap—no AI expertise required.",
        "Transform uncertainty into confident, proactive parenting.",
      ];
    }

    return { score, category, recommendations };
  }, []);

  const handleAnswer = useCallback((value: string) => {
    if (!currentQuestion) return;
    
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
    
    // Auto-advance to next step
    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
    }, 300);
  }, [currentQuestion]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const quizResult = calculateResult(answers);
      
      // Call the edge function to submit quiz and sync to Kit
      const { data, error } = await supabase.functions.invoke('submit-quiz', {
        body: {
          email,
          answers,
          score: quizResult.score,
          source: 'hero',
        },
      });

      if (error) {
        console.error('Quiz submission error:', error);
        // Still show result even if backend fails
        toast.error('Could not save your results, but here they are!');
      }

      setResult(quizResult);
      setIsComplete(true);
    } catch (error) {
      console.error('Quiz submission error:', error);
      // Calculate and show result anyway
      const quizResult = calculateResult(answers);
      setResult(quizResult);
      setIsComplete(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [email, answers, isSubmitting, calculateResult]);

  const resetQuiz = useCallback(() => {
    setCurrentStep(0);
    setAnswers({});
    setEmail('');
    setResult(null);
    setIsComplete(false);
  }, []);

  return {
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
    resetQuiz,
    questions: QUIZ_QUESTIONS,
  };
}
