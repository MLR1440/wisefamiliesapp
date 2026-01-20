import { FileText, MessageCircle, ClipboardList, Users, Gift } from 'lucide-react';

const bonuses = [
  {
    icon: FileText,
    title: "AI Tool Evaluation Cheat Sheet",
    description: "A quick-reference guide to evaluate ANY new AI tool your child wants to use. Know instantly if it's safe and appropriate.",
    value: "$29"
  },
  {
    icon: MessageCircle,
    title: "25 Family Conversation Starters",
    description: "Ready-to-use discussion prompts that make talking about AI natural and engaging—not awkward or preachy.",
    value: "$19"
  },
  {
    icon: ClipboardList,
    title: "Age-Appropriate AI Guidelines",
    description: "Printable guide with specific recommendations for AI access and usage by age group (5-8, 9-12, 13-17).",
    value: "$19"
  },
  {
    icon: Users,
    title: "Private Parent Community",
    description: "Connect with like-minded families navigating the same challenges. Share wins, ask questions, and support each other.",
    value: "$97"
  }
];

const Bonuses = () => {
  const totalValue = bonuses.reduce((acc, bonus) => acc + parseInt(bonus.value.replace('$', '')), 0);
  
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-28">
      <div className="container px-4 sm:px-6">
        <div className="mx-auto mb-8 sm:mb-12 max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent mb-4">
            <Gift className="h-4 w-4" />
            <span className="text-sm font-medium">Included Free</span>
          </div>
          <h2 className="mb-3 sm:mb-4 font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Plus These Exclusive Bonuses
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Everything you need to implement what you learn—valued at ${totalValue}+
          </p>
        </div>

        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto">
          {bonuses.map((bonus, index) => (
            <div
              key={index}
              className="relative group rounded-xl sm:rounded-2xl border border-border bg-card p-5 sm:p-6 transition-all duration-300 hover:border-accent/30 hover:shadow-card"
            >
              {/* Value badge */}
              <div className="absolute -top-2 -right-2 px-2 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold">
                {bonus.value} value
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 inline-flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition-transform duration-300 group-hover:scale-110">
                  <bonus.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="mb-2 font-heading text-base sm:text-lg font-semibold text-foreground">
                    {bonus.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {bonus.description}
                  </p>
                </div>
              </div>

              {/* Included badge */}
              <div className="mt-4 pt-4 border-t border-border">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  Included with your purchase
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Bonuses;
