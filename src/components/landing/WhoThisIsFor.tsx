import { Check, AlertCircle, ArrowRight } from 'lucide-react';

const forYou = [
  "Your child is 8-16 and already using (or will soon use) AI tools",
  "You want to guide them, not just restrict them",
  "You believe in preparing kids for the future, not hiding from it",
  "You're willing to learn alongside your child",
  "You want practical tools, not just theory",
];

const myths = [
  {
    myth: '"Set & forget" parental controls',
    reality: "Kids find ways around these quickly. Empowering safe, smart use sets them up for the future far better than any filter.",
  },
  {
    myth: "Banning all technology",
    reality: "Unless you're moving off-grid, this isn't realistic. AI is already in their classrooms, friends' homes, and future workplaces.",
  },
  {
    myth: "Waiting for someone else to solve it",
    reality: "Children learn from parents and peers. Being a role model and setting up the whole family for safe AI use is what actually works.",
  },
];

const WhoThisIsFor = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Is This Right For You?
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {/* For You */}
          <div className="bg-primary/5 rounded-xl p-8 border-2 border-primary/20">
            <h3 className="font-heading text-xl font-semibold text-primary mb-6 flex items-center gap-2">
              <Check className="h-6 w-6" />
              This IS for you if:
            </h3>
            <ul className="space-y-4">
              {forYou.map((item, index) => (
                <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/80">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Why Other Approaches Fall Short */}
          <div className="bg-muted/50 rounded-xl p-8 border border-border">
            <h3 className="font-heading text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-amber-500" />
              Why other approaches fall short
            </h3>
            <div className="space-y-5">
              {myths.map((item, index) => (
                <div key={index} className="space-y-1.5">
                  <p className="font-medium text-foreground flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-amber-500 flex-shrink-0 mt-1" />
                    {item.myth}
                  </p>
                  <p className="text-muted-foreground text-sm pl-6">
                    {item.reality}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhoThisIsFor;
