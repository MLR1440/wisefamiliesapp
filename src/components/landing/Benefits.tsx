import { Brain, Shield, Lightbulb, Eye, MessageCircleWarning, Zap } from 'lucide-react';

const benefits = [
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
    <section className="py-12 sm:py-16 md:py-20 lg:py-28">
      <div className="container px-4 sm:px-6">
        <div className="mx-auto mb-8 sm:mb-12 max-w-2xl text-center">
          <p className="text-sm sm:text-base font-medium text-secondary mb-2">
            Sound Familiar?
          </p>
          <h2 className="mb-3 sm:mb-4 font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            The Challenges Every Parent Faces
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            AI is changing childhood faster than we can keep up. Here's what we help you navigate.
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group relative rounded-xl sm:rounded-2xl border border-border bg-card p-5 sm:p-6 md:p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Pain point tag */}
              <div className="mb-4 sm:mb-5">
                <span className="inline-block text-xs font-medium text-secondary bg-secondary/10 px-2 py-1 rounded-full">
                  {benefit.painPoint}
                </span>
              </div>

              {/* Icon */}
              <div className="mb-4 sm:mb-5 inline-flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-hero text-primary-foreground transition-transform duration-300 group-hover:scale-110">
                <benefit.icon className="h-5 w-5 sm:h-7 sm:w-7" />
              </div>

              <h3 className="mb-2 sm:mb-3 font-heading text-lg sm:text-xl font-semibold text-foreground">
                {benefit.title}
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Benefits;
