import { Brain, Shield, Lightbulb } from 'lucide-react';

const benefits = [
  {
    icon: Brain,
    title: 'Critical Thinking Skills',
    description: 'Teach your children to question, evaluate, and think critically about AI-generated content and information.',
  },
  {
    icon: Shield,
    title: 'Healthy Boundaries',
    description: 'Create effective technology rules that protect without restricting your child\'s growth and curiosity.',
  },
  {
    icon: Lightbulb,
    title: 'Future-Ready Creativity',
    description: 'Foster authentic creativity that works alongside AI tools, not in competition with them.',
  },
];

const Benefits = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 font-heading text-3xl font-bold text-foreground md:text-4xl">
            What You'll Learn
          </h2>
          <p className="text-lg text-muted-foreground">
            A comprehensive framework to prepare your family for the AI revolution
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-border bg-card p-8 transition-all duration-300 hover:border-primary/30 hover:shadow-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-hero text-primary-foreground transition-transform duration-300 group-hover:scale-110">
                <benefit.icon className="h-7 w-7" />
              </div>

              <h3 className="mb-3 font-heading text-xl font-semibold text-foreground">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground">
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
