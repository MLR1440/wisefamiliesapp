import { Target, Brain, Handshake } from 'lucide-react';
import courseModuleScreenshot from '@/assets/course-module-screenshot.png';

const differentiators = [
  {
    icon: Target,
    title: 'Not "Ban AI"',
    description: "We teach your child to use AI as a tool, not a crutch",
  },
  {
    icon: Brain,
    title: "Brain-First Philosophy",
    description: "Protect their thinking skills while they learn to leverage AI",
  },
  {
    icon: Handshake,
    title: "Connection Over Control",
    description: "Build trust instead of surveillance",
  },
];

const Solution = () => {
  return (
    <section className="py-16 md:py-24 bg-primary/5">
      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Introducing the{' '}
            <span className="text-primary">AI-Ready Families System</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to raise confident, capable kids who can think for themselves in a world full of AI.
          </p>
        </div>

        {/* Course mockup placeholder */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="rounded-2xl bg-card border border-border shadow-card overflow-hidden">
            <img 
              src={courseModuleScreenshot} 
              alt="WiseFamilies course module showing video lesson about the prefrontal cortex and AI coaching assistant" 
              className="w-full h-auto"
            />
          </div>
        </div>

        {/* Key differentiators */}
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {differentiators.map((item, index) => (
            <div
              key={index}
              className="text-center p-8 rounded-xl bg-card border border-border shadow-soft hover:shadow-card transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center mx-auto mb-6">
                <item.icon className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-3">
                {item.title}
              </h3>
              <p className="text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Solution;
