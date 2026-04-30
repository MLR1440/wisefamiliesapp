import { Bot, Users, BookOpen } from 'lucide-react';
const features = [{
  icon: Bot,
  title: "AI-Powered Coaching Tools",
  description: "Get personalised guidance, not generic advice. Custom family tech agreements, conversation scripts, and action plans tailored to YOUR child. So you get a personalised next step the moment something goes wrong — instead of Googling at midnight."
}, {
  icon: Users,
  title: "Private Parent Community",
  description: "Connect with other parents navigating the same challenges. Share what's working, ask questions, and swap scripts. Real parents, real situations — so you're never the only one figuring this out at 10pm. (12 months access included)"
}, {
  icon: BookOpen,
  title: "Evidence-Based, Not Fear-Based",
  description: "Every framework is grounded in developmental psychology and neuroscience — not clickbait headlines. You get what the research actually says, translated into things you can do tonight."
}];
const WhatMakesThisDifferent = () => {
  return <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4 text-secondary">
            This Isn't Just Another Parenting Course
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {features.map((feature, index) => <div key={index} className="bg-card rounded-xl p-8 shadow-card border border-border text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <feature.icon className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold mb-4 text-secondary">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>)}
        </div>
      </div>
    </section>;
};
export default WhatMakesThisDifferent;