import { Brain, Shield, Lightbulb, Eye, MessageCircleWarning, Zap, AlertTriangle } from 'lucide-react';

const challenges = [
  {
    icon: Eye,
    title: "Is AI Doing Their Homework?",
    description: "Learn to spot when your child is using AI to cheat vs. using it as a learning tool. Get practical strategies to foster genuine learning.",
    painPoint: "70% of students admit to using AI for assignments"
  },
  {
    icon: Brain,
    title: "Critical Thinking in an AI World",
    description: "Your child believes everything AI tells them. Teach them to question, verify, and think independently in a world of AI-generated content.",
    painPoint: "Most teens can't distinguish AI misinformation"
  },
  {
    icon: MessageCircleWarning,
    title: "Dangerous AI Conversations",
    description: "AI chatbots can give inappropriate advice on relationships, mental health, and more. Know the risks and how to set healthy boundaries.",
    painPoint: "Unfiltered AI can expose kids to harmful content"
  },
  {
    icon: Shield,
    title: "Screen Time & AI Addiction",
    description: "AI-powered apps are designed to be addictive. Create balanced tech rules that protect without restricting growth and curiosity.",
    painPoint: "AI makes screen addiction even harder to manage"
  },
  {
    icon: Lightbulb,
    title: "Protecting Their Creativity",
    description: "Will AI replace their need to learn? Help them develop authentic creativity that works alongside AI, not in competition with it.",
    painPoint: "Kids are losing motivation to create original work"
  },
  {
    icon: Zap,
    title: "Preparing for Their Future",
    description: "The job market is changing rapidly. Equip your child with the skills that will matter most in an AI-driven economy.",
    painPoint: "65% of today's students will work in jobs that don't exist yet"
  },
];

const Benefits = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-gradient-to-b from-secondary/5 via-accent/5 to-background">
      <div className="container px-4 sm:px-6">
        {/* Opening scenario */}
        <div className="mx-auto mb-10 sm:mb-14 max-w-3xl text-center">
          <p className="text-sm sm:text-base font-medium text-secondary mb-2">
            Sound Familiar?
          </p>
          <h2 className="mb-4 sm:mb-6 font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            You've Felt That Moment of Doubt
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground mb-6">
            Your child asks about ChatGPT at dinner. You see them typing into an AI app you've never heard of. Their homework seems suspiciously polished. And you wonder:{' '}
            <span className="text-foreground font-medium">"Am I already too late?"</span>
          </p>
          <p className="text-base sm:text-lg text-muted-foreground">
            You're not alone. These are the challenges every modern parent faces.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {challenges.map((challenge, index) => (
            <div
              key={index}
              className="group relative rounded-xl sm:rounded-2xl border-l-4 border-l-primary border border-border bg-card p-5 sm:p-6 md:p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-card hover:bg-card/80"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Pain point tag */}
              <div className="mb-4 sm:mb-5">
                <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${
                  index % 2 === 0 ? 'text-secondary bg-secondary/10' : 'text-accent-foreground bg-accent/15'
                }`}>
                  {challenge.painPoint}
                </span>
              </div>

              {/* Icon */}
              <div className="mb-4 sm:mb-5 inline-flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-hero text-primary-foreground transition-transform duration-300 group-hover:scale-110">
                <challenge.icon className="h-5 w-5 sm:h-7 sm:w-7" />
              </div>

              <h3 className="mb-2 sm:mb-3 font-heading text-lg sm:text-xl font-semibold text-foreground">
                {challenge.title}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {challenge.description}
              </p>
            </div>
          ))}
        </div>

        {/* The Real Cost of Inaction */}
        <div className="mt-12 sm:mt-16 max-w-3xl mx-auto">
          <div className="rounded-xl sm:rounded-2xl border-2 border-destructive/20 bg-destructive/5 p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
              </div>
              <div>
                <h3 className="font-heading text-lg sm:text-xl font-semibold text-foreground mb-2">
                  The Real Cost of Waiting
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4">
                  Every day without guidance, your child is forming AI habits—good or bad—that will shape how they learn, create, and think for years to come.
                </p>
                <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">•</span>
                    <span>They might be using AI to avoid learning, not accelerate it</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">•</span>
                    <span>Critical thinking skills may atrophy without intentional development</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-1">•</span>
                    <span>The confidence gap between AI-ready and AI-dependent kids is widening</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Benefits;
