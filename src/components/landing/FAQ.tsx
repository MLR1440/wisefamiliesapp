import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What age children is this course designed for?',
    answer: 'This framework is designed for parents of children ages 5-18. The concepts are adaptable for different developmental stages, and we provide age-specific guidance throughout the modules.',
  },
  {
    question: 'Do I need to be tech-savvy to take this course?',
    answer: 'Not at all! This course is designed for parents of all technical backgrounds. We explain AI concepts in simple, accessible terms and focus on practical parenting strategies rather than technical details.',
  },
  {
    question: 'How long does it take to complete the course?',
    answer: 'The course contains approximately 3 hours of video content spread across 6 modules. Most parents complete it within 1-2 weeks, going at their own pace. You have lifetime access to revisit any content.',
  },
  {
    question: 'Is there a refund policy?',
    answer: 'Yes! We offer a 30-day money-back guarantee. If you\'re not satisfied with the course for any reason, simply contact us for a full refund.',
  },
  {
    question: 'Do I get access to future updates?',
    answer: 'Absolutely! AI technology evolves rapidly, and so does our course. All future updates and new modules are included with your one-time purchase.',
  },
  {
    question: 'Can both parents use the same account?',
    answer: 'Yes! Your account includes access for your entire household. We encourage both parents to go through the course together and discuss the strategies.',
  },
];

const FAQ = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="mb-4 font-heading text-3xl font-bold text-foreground md:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Got questions? We've got answers.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-xl border border-border bg-card px-6 data-[state=open]:border-primary/30 data-[state=open]:shadow-soft"
              >
                <AccordionTrigger className="py-5 font-heading text-left font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-muted-foreground">
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
