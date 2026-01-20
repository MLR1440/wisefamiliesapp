import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'What age children is this course designed for?',
    answer: 'This framework is specifically designed for parents of children ages 8-16. The concepts are adaptable for different developmental stages, and we provide age-specific guidance throughout the modules.',
  },
  {
    question: 'Do I need to be tech-savvy to take this course?',
    answer: "Not at all! This course is designed for parents of all technical backgrounds. We explain AI concepts in simple, accessible terms and focus on practical parenting strategies rather than technical details. If you can use a smartphone, you can complete this course.",
  },
  {
    question: 'How long does it take to complete the course?',
    answer: 'The course contains approximately 3 hours of video content spread across 6 chapters. Most parents complete it within 1-2 weeks, going at their own pace. You have lifetime access to revisit any content whenever you need it.',
  },
  {
    question: 'What if the course is not right for me?',
    answer: 'We offer a 90-day money-back guarantee. If you\'re not satisfied with the course for any reason, simply contact us for a full refund. No questions asked. See our full refund policy at wisefamilies.co/refund-policy.',
  },
  {
    question: 'Do I get access to future updates?',
    answer: 'Absolutely! AI technology evolves rapidly, and so does our course. All future updates, new modules, and bonus content are included with your one-time purchase at no additional cost.',
  },
  {
    question: 'Can both parents use the same account?',
    answer: 'Yes! Your account includes access for your entire household. We encourage both parents to go through the course together and discuss the strategies as a team.',
  },
  {
    question: 'How do I access the course after purchase?',
    answer: "After completing your purchase, you'll receive an email with login instructions. You can access the course immediately from any device - computer, tablet, or smartphone. Your progress is saved automatically.",
  },
  {
    question: 'Is this a one-time payment or a subscription?',
    answer: "This is a one-time payment for lifetime access. There are no recurring charges or hidden fees. Pay once, and the course is yours forever, including all future updates.",
  },
  {
    question: 'What if I have questions while taking the course?',
    answer: "Each module includes an AI-powered assistant that can answer your questions and provide personalized guidance based on your family's situation. You can also reach our support team via email.",
  },
  {
    question: 'Is my payment secure?',
    answer: "Yes, absolutely. We use Stripe, a leading payment processor trusted by millions of businesses worldwide. Your payment information is encrypted and never stored on our servers.",
  },
];

const FAQ = () => {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-gradient-to-b from-secondary/5 via-accent/5 to-background">
      <div className="container px-4 sm:px-6">
        <div className="mx-auto mb-8 sm:mb-12 max-w-2xl text-center">
          <h2 className="mb-3 sm:mb-4 font-heading text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Got questions? We've got answers.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-lg sm:rounded-xl border border-border bg-card px-4 sm:px-6 data-[state=open]:border-primary/40 data-[state=open]:shadow-card data-[state=open]:bg-primary/5 transition-all"
              >
                <AccordionTrigger className="py-4 sm:py-5 font-heading text-left text-sm sm:text-base font-semibold hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="pb-4 sm:pb-5 text-sm sm:text-base text-muted-foreground">
                  {faq.answer}
                  {faq.question.includes('not right for me') && (
                    <a 
                      href="https://wisefamilies.co/refund-policy/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block mt-2 text-primary hover:underline"
                    >
                      View our full refund policy →
                    </a>
                  )}
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
