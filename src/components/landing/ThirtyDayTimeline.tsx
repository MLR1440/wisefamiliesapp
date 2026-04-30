import { Moon, Search, Handshake, Brain, Target } from 'lucide-react';

const steps = [
  {
    label: 'Tonight',
    icon: Moon,
    title: 'Your first win',
    description:
      'Run the 10-Minute AI Check-In script with your child before bed. No lecture. Just one conversation.',
  },
  {
    label: 'Week 1',
    icon: Search,
    title: 'Map their AI reality',
    description:
      "Discover exactly how (and where) your child is already using AI \u2014 without judgment, without surveillance.",
  },
  {
    label: 'Week 2',
    icon: Handshake,
    title: 'Install your Family AI Agreement',
    description:
      "Build it together so they actually follow it. Use the agreement builder \u2014 no blank-page rule-writing required.",
  },
  {
    label: 'Week 3',
    icon: Brain,
    title: 'Brain-Before-Bot for homework',
    description:
      "Install the protocol that ends the homework-cheating panic and keeps their thinking muscles working.",
  },
  {
    label: 'Week 4',
    icon: Target,
    title: 'Lock in your long-term Co-Pilot Plan',
    description:
      "Your child as Pilot, AI as Co-Pilot \u2014 a repeatable protocol that grows with them.",
  },
];

const ThirtyDayTimeline = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            What You'll Actually Do in the Next 30 Days
          </h2>
          <p className="text-lg text-muted-foreground">
            A clear week-by-week path. Quick wins from night one.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid gap-5 md:gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className="bg-card rounded-xl border border-border shadow-soft p-6 md:p-7 flex flex-col md:flex-row md:items-start gap-5 hover:shadow-card transition-shadow"
            >
              <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-3 md:w-40 flex-shrink-0">
                <div className="w-14 h-14 rounded-full bg-secondary/15 flex items-center justify-center">
                  <step.icon className="h-7 w-7 text-secondary" />
                </div>
                <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                  {step.label}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-base md:text-lg font-medium text-foreground/80 max-w-2xl mx-auto">
          10 minutes a day. No banning AI. No becoming the family police.
        </p>
      </div>
    </section>
  );
};

export default ThirtyDayTimeline;