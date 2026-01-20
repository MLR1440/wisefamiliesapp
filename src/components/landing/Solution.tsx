import { Brain, Palette, Compass, CheckCircle2, ArrowRight } from 'lucide-react';

const pillars = [
  {
    icon: Brain,
    title: "Think Critically",
    description: "Teach your child to question AI outputs, verify information, and develop independent judgment in an AI-saturated world."
  },
  {
    icon: Palette,
    title: "Create Authentically",
    description: "Protect and nurture their creativity so they use AI as a tool, not a crutch. Build skills that can't be automated."
  },
  {
    icon: Compass,
    title: "Use Wisely",
    description: "Set healthy boundaries and habits around AI use. Know when AI helps and when it hurts their development."
  }
];

const outcomes = [
  "Confidently discuss AI with your kids at any age",
  "Spot the difference between learning and cheating",
  "Set boundaries that stick without constant battles",
  "Protect their creativity while embracing technology",
  "Prepare them for jobs that don't exist yet"
];

const Solution = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-muted/30">
      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center mb-10 sm:mb-14">
          <p className="text-sm sm:text-base font-medium text-secondary mb-2">
            The Solution
          </p>
          <h2 className="mb-4 sm:mb-6 font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Introducing the{' '}
            <span className="text-gradient">AI-Ready Family Framework</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            A proven 3-pillar approach that gives you the confidence to guide your children through the AI revolution—without needing to be a tech expert.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto mb-12 sm:mb-16">
          {pillars.map((pillar, index) => (
            <div
              key={index}
              className="relative group text-center p-6 sm:p-8 rounded-2xl bg-card border border-border transition-all duration-300 hover:shadow-card hover:border-primary/30"
            >
              {/* Pillar number */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center">
                {index + 1}
              </div>
              
              <div className="mb-4 sm:mb-5 inline-flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-gradient-hero text-primary-foreground transition-transform duration-300 group-hover:scale-110">
                <pillar.icon className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>
              
              <h3 className="mb-3 font-heading text-xl sm:text-2xl font-semibold text-foreground">
                {pillar.title}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>

        {/* Outcomes */}
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h3 className="font-heading text-xl sm:text-2xl font-semibold text-foreground">
              After completing this course, you'll be able to:
            </h3>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {outcomes.map((outcome, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 sm:p-4 rounded-xl bg-card border border-border"
              >
                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-success flex-shrink-0 mt-0.5" />
                <span className="text-sm sm:text-base text-foreground">{outcome}</span>
              </div>
            ))}
          </div>

          {/* Transition text */}
          <div className="mt-10 sm:mt-12 text-center">
            <p className="inline-flex items-center gap-2 text-muted-foreground font-medium">
              <ArrowRight className="h-4 w-4" />
              Here's exactly what you'll learn
              <ArrowRight className="h-4 w-4" />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Solution;
