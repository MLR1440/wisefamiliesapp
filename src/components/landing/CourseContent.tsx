import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { useState } from 'react';

const chapters = [
  {
    number: 1,
    title: "Understanding the Stakes",
    modules: [
      "Why AI is different from every technology that came before",
      "The \"cognitive offloading\" risk most parents miss",
      "Your child's brain during the 8-14 construction window",
    ],
  },
  {
    number: 2,
    title: "Know Your Child's Reality",
    modules: [
      "Assess where your child actually is with AI (no judgment)",
      "Discover what they're already using (you might be surprised)",
      "Identify opportunities and red flags",
    ],
  },
  {
    number: 3,
    title: "Build Your Connection Foundation",
    modules: [
      "The 10-minute daily habit that changes everything",
      "Conversation scripts that actually work",
      "Why connection comes before correction",
    ],
  },
  {
    number: 4,
    title: "Develop Their Thinking Muscles",
    modules: [
      "The \"Brain First\" rule: struggle before AI",
      "How to build frustration tolerance",
      "Critical thinking exercises that stick",
    ],
  },
  {
    number: 5,
    title: "Create Boundaries That Work",
    modules: [
      "The Family Technology Agreement framework",
      "Rules they'll actually follow (because they helped create them)",
      "Age-appropriate guidelines for 8-16",
    ],
  },
  {
    number: 6,
    title: "The Co-Pilot Protocol",
    modules: [
      "Your child as Pilot, AI as Co-Pilot",
      "The Scaffolding-Fading Framework (Novice → Intermediate → Advanced)",
      "Teaching them to question AI output",
    ],
  },
  {
    number: 7,
    title: "Your 30-Day Action Plan",
    modules: [
      "Week-by-week implementation guide",
      "When things go wrong (and how to recover)",
      "The long game: what success looks like in 5 years",
    ],
  },
];

const CourseContent = () => {
  const [expandedChapter, setExpandedChapter] = useState<number | null>(1);

  const toggleChapter = (chapterNumber: number) => {
    setExpandedChapter(expandedChapter === chapterNumber ? null : chapterNumber);
  };

  return (
    <section id="course-content" className="py-16 md:py-24 bg-background">
      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            What You'll Learn
          </h2>
          <p className="text-lg text-muted-foreground">
            7 chapters designed to give you practical tools you can use today
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {chapters.map((chapter) => (
            <div
              key={chapter.number}
              className="bg-card rounded-xl border border-border shadow-soft overflow-hidden"
            >
              <button
                onClick={() => toggleChapter(chapter.number)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    {chapter.number}
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    {chapter.title}
                  </h3>
                </div>
                {expandedChapter === chapter.number ? (
                  <ChevronUp className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                )}
              </button>

              {expandedChapter === chapter.number && (
                <div className="px-6 pb-6 pt-0">
                  <ul className="space-y-3 ml-14">
                    {chapter.modules.map((module, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <BookOpen className="h-4 w-4 text-secondary mt-1 flex-shrink-0" />
                        <span className="text-muted-foreground">{module}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourseContent;
