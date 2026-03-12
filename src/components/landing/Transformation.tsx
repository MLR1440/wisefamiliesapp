import { ArrowRight, XCircle, CheckCircle2 } from 'lucide-react';

const transformations = [
  {
    before: "Unsure what AI tools your child is using",
    after: "Full visibility into their AI habits and a plan for each one",
  },
  {
    before: "Constant fights about screen time and technology",
    after: "A collaborative family tech agreement everyone follows",
  },
  {
    before: "Worried AI is doing their thinking for them",
    after: "Kids who use AI as a tool, not a crutch",
  },
  {
    before: "Feeling one step behind the technology",
    after: "Confident parent who guides, not restricts",
  },
  {
    before: "No framework — just reacting to each new AI tool",
    after: "A clear 30-day action plan and long-term strategy",
  },
];

const Transformation = () => {
  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Picture Your Family 30 Days From Now
          </h2>
          <p className="text-lg text-muted-foreground">
            Here's what changes when you have a system instead of stress.
          </p>
        </div>

        <div className="mx-auto max-w-4xl space-y-4">
          {transformations.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-3 md:gap-4 items-center bg-card rounded-xl border border-border p-5 md:p-6 transition-shadow hover:shadow-soft"
            >
              {/* Before */}
              <div className="flex items-start gap-3">
                <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <span className="text-foreground/70 text-sm md:text-base">{item.before}</span>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex justify-center">
                <ArrowRight className="h-5 w-5 text-primary" />
              </div>
              <div className="flex md:hidden justify-center">
                <ArrowRight className="h-4 w-4 text-primary rotate-90" />
              </div>

              {/* After */}
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                <span className="text-foreground font-medium text-sm md:text-base">{item.after}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Transformation;
