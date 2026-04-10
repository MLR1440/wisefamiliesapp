import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface QuizAnswer {
  motivationLevel: string;
  aiUsage: string;
  biggestConcern: string;
  currentApproach: string;
  confidenceLevel: number;
}

export interface QuizResult {
  score: number;
  category: 'ai-ready' | 'growing' | 'early';
  description: string;
  recommendations: string[];
}

const QUIZ_QUESTIONS = [
  {
    id: 'motivationLevel',
    question: "What motivated you to look into AI guidance for your family?",
    options: [
      { value: 'news', label: 'A news story or social media post worried me', points: 1 },
      { value: 'child-using', label: 'My child started using AI tools on their own', points: 2 },
      { value: 'proactive', label: 'I want to be proactive before it becomes a problem', points: 2 },
      { value: 'recommended', label: 'A friend or educator recommended it', points: 1 },
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
  const [showingPreview, setShowingPreview] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const totalSteps = QUIZ_QUESTIONS.length + 1; // +1 for preview/email step

  const currentQuestion = QUIZ_QUESTIONS[currentStep] || null;
  const isPreviewStep = currentStep === QUIZ_QUESTIONS.length;

  const calculateResult = useCallback((answers: Record<string, string>): QuizResult => {
    let totalPoints = 0;
    
    QUIZ_QUESTIONS.forEach((question) => {
      const answer = answers[question.id];
      const option = question.options.find((opt) => opt.value === answer);
      if (option) {
        totalPoints += option.points;
      }
    });

    // Max possible score is 16, normalize to 10
    const score = Math.min(10, Math.round((totalPoints / 16) * 10));
    
    let category: QuizResult['category'];
    let recommendations: string[];

    let description: string;

    if (score >= 7) {
      category = 'ai-ready';
      description = "You've built a strong foundation — you're already paying attention and having conversations most parents haven't started yet. The course will sharpen your approach as AI continues to evolve.";
      recommendations = [
        "Have a 5-minute 'curiosity' conversation with your child tonight — ask what they'd use AI for at school.",
        "Try an AI tool together at the kitchen table to remove the mystery.",
        "Set one simple trust guideline: 'We check AI answers together before trusting them.'",
      ];
    } else if (score >= 4) {
      category = 'growing';
      description = "You're aware AI matters and you've taken some steps. A structured approach will help you turn that awareness into confident, everyday guidance for your family.";
      recommendations = [
        "Start a low-pressure conversation tonight — ask your child what they've heard about AI at school.",
        "Pick one AI tool and explore it together this week — keep it fun and low-stakes.",
        "Agree on one family rule about AI, like always checking answers together.",
      ];
    } else {
      category = 'early';
      description = "AI is already part of your child's world, even if it doesn't feel like it yet. The good news? Starting now puts you ahead of most families. You don't need to be technical — you just need a plan.";
      recommendations = [
        "Ask your child tonight: 'Have you heard about AI at school?' — just listen, no judgment.",
        "Spend 5 minutes exploring ChatGPT yourself so you know what your child might encounter.",
        "Set one simple rule to start: 'We explore new tech together first.'",
      ];
    }

    return { score, category, description, recommendations };
  }, []);

  const handleAnswer = useCallback((value: string) => {
    if (!currentQuestion) return;
    
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);
    
    // Auto-advance to next step
    setTimeout(() => {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // If we just answered the last question, calculate result for preview
      if (nextStep === QUIZ_QUESTIONS.length) {
        const quizResult = calculateResult(newAnswers);
        setResult(quizResult);
        setShowingPreview(true);
      }
    }, 300);
  }, [currentQuestion, currentStep, answers, calculateResult]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      if (isPreviewStep) {
        setShowingPreview(false);
        setResult(null);
      }
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep, isPreviewStep]);

  const handleSubmit = useCallback(async () => {
    if (!email || isSubmitting || !result) return;

    setIsSubmitting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('submit-quiz', {
        body: {
          email,
          answers,
          score: result.score,
          source: 'hero',
        },
      });

      if (error) {
        console.error('Quiz submission error:', error);
        toast.error('Could not save your results, but here they are!');
      }

      setShowingPreview(false);
      setIsComplete(true);
    } catch (error) {
      console.error('Quiz submission error:', error);
      setShowingPreview(false);
      setIsComplete(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [email, answers, isSubmitting, result]);

  const handleSkipEmail = useCallback(() => {
    setShowingPreview(false);
    setIsComplete(true);
  }, []);

  const resetQuiz = useCallback(() => {
    setCurrentStep(0);
    setAnswers({});
    setEmail('');
    setResult(null);
    setShowingPreview(false);
    setIsComplete(false);
  }, []);

  return {
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
    resetQuiz,
    questions: QUIZ_QUESTIONS,
  };
}
