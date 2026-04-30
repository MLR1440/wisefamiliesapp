import { MessageCircleQuestion, Timer, Newspaper, Zap, AlertTriangle } from 'lucide-react';
const problems = [{
  icon: MessageCircleQuestion,
  text: "Your child just asked ChatGPT to help with homework. Is that cheating? Is it smart? You genuinely don't know."
}, {
  icon: Timer,
  text: "You've tried screen time apps, contracts, consequences... and you're still having the same fights."
}, {
  icon: Newspaper,
  text: "Every article you read either tells you AI will ruin your kids or that it's totally fine. Neither feels right."
}, {
  icon: Zap,
  text: "You want to guide them, but the technology is moving so fast you feel like you're already behind."
}, {
  icon: AlertTriangle,
  text: "Every week without a plan is another week of homework-cheating risk, privacy slip-ups, and AI doing the thinking your child's brain should be doing."
}];
const ProblemValidation = () => {
  return <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Sound Familiar?
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto mb-12">
          {problems.map((problem, index) => <div key={index} className="bg-card rounded-lg p-6 shadow-card border border-border hover:shadow-lg transition-shadow duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center">
                  <problem.icon className="h-6 w-6 text-secondary" />
                </div>
                <p className="text-foreground/80 text-lg leading-relaxed italic">
                  "{problem.text}"
                </p>
              </div>
            </div>)}
        </div>

        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg text-muted-foreground mb-4">You're not failing. You're parenting in an impossible moment, where the rules haven't been written yet.</p>
          <p className="font-semibold text-primary text-3xl py-[20px] pt-[40px]">
            What if you had a clear framework that actually works?
          </p>
        </div>
      </div>
    </section>;
};
export default ProblemValidation;