import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: "What ages is this course designed for?",
    answer: "The AI-Ready Families System is specifically designed for parents of children aged 8-16. The frameworks adapt to different developmental stages — from \"Curious Navigators\" (8-9) through \"Co-Pilots\" (10-12) to \"Balancers\" (13-14) and \"Mentors\" (15-16)."
  },
  {
    question: "How long do I have access to the course?",
    answer: "With the Core package, you get 12 months of access to all course materials, including any updates during that period. The Premium package extends this to 36 months. Community access is included for the duration of your course access."
  },
  {
    question: "What if my child is already heavily dependent on AI?",
    answer: "That's exactly who this course is for. Chapter 2 helps you assess where your child actually is, and the Scaffolding-Fading Framework (Chapter 6) gives you a clear path to gradually rebuild their independent thinking skills."
  },
  {
    question: "I'm not very tech-savvy. Will I be able to follow this?",
    answer: "Absolutely. The course is designed for parents, not technologists. We explain everything in plain language with practical examples. You don't need to understand how AI works — you just need to understand your child."
  },
  {
    question: "What are the AI coaching tools?",
    answer: "These are personalised AI assistants trained on the WiseFamilies frameworks. They help you create custom family technology agreements, generate conversation scripts tailored to your child's age and situation, and get guidance for specific challenges you're facing."
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes. You have a full 90 days to go through the entire course and implement the strategies. If it doesn't work for your family, email us for a full refund. No questions asked."
  },
  {
    question: "My partner isn't on board with this. Can I still do it alone?",
    answer: "Yes. While having both parents aligned is ideal, the frameworks work even if you're implementing them solo. The course includes guidance specifically for this situation."
  },
  {
    question: "What if I have questions while going through the course?",
    answer: "Post in the private community! Other parents and our team are there to support you. Premium members also get priority support."
  },
  {
    question: "Is this available in Australia?",
    answer: "Yes! WiseFamilies is based in Perth, Australia. All prices are in AUD, and the content is relevant for families in Australia, NZ, UK, US, and other English-speaking countries."
  }
];

const FAQ = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Questions? We've Got Answers.
          </h2>
        </div>

        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-soft transition-shadow"
              >
                <AccordionTrigger className="text-left font-heading font-semibold text-foreground hover:text-primary py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;