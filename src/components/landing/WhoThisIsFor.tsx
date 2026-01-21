import { Check, X } from 'lucide-react';
const forYou = ["Your child is 8-16 and already using (or will soon use) AI tools", "You want to guide them, not just restrict them", "You believe in preparing kids for the future, not hiding from it", "You're willing to learn alongside your child", "You want practical tools, not just theory"];
const notForYou = ["You're looking for a \"set it and forget it\" parental control app", "You believe the answer is simply banning all technology", "You want someone else to solve this for you", "Your child is under 8 (this content is designed for 8-16)"];
const WhoThisIsFor = () => {
  return <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            The AI-Ready Families System Is For You If...
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
              {forYou.map((item, index) => <li key={index} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
                  <span className="text-foreground/80">{item}</span>
                </li>)}
            </ul>
          </div>

          {/* Not For You */}
          <div className="bg-muted/50 rounded-xl p-8 border border-border">
            <h3 className="font-heading text-xl font-semibold text-muted-foreground mb-6 flex items-center gap-2">
              <X className="h-6 w-6 bg-inherit text-red-600" />
              This is NOT for you if:
            </h3>
            <ul className="space-y-4">
              {notForYou.map((item, index) => <li key={index} className="flex items-start gap-3">
                  <X className="h-5 w-5 text-destructive/60 flex-shrink-0 mt-0.5" />
                  <span className="text-muted-foreground">{item}</span>
                </li>)}
            </ul>
          </div>
        </div>
      </div>
    </section>;
};
export default WhoThisIsFor;