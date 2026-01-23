import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ContactPrompt = () => {
  return (
    <section className="bg-cream-50 py-12 md:py-16">
      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-lg text-muted-foreground leading-relaxed">
            You made it this far, so the framework clearly intrigues you.
          </p>
          
          <p className="mb-4 text-lg text-muted-foreground leading-relaxed">
            But you want to speak to a real person before you purchase. Honestly? We would too.
          </p>
          
          <p className="mb-8 text-lg text-muted-foreground leading-relaxed">
            If you're hesitating, let's clear it up. Send us your questions. We usually reply within 48 hours{' '}
            <span className="italic">(or as soon as the kids are asleep)</span>.
          </p>
          
          <a href="mailto:hello@wisefamilies.co">
            <Button variant="outline-primary" size="lg" className="gap-2">
              <MessageCircle className="h-5 w-5" />
              Chat with Us
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ContactPrompt;
