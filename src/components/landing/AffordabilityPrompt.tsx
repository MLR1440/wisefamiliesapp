import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AffordabilityPrompt = () => {
  return (
    <section className="bg-muted/30 py-10 md:py-12">
      <div className="container px-4 sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <Heart className="mx-auto mb-4 h-6 w-6 text-muted-foreground/60" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you truly want this for your family but finances are standing in the way, please reach out to us. 
            We don't want money to be the reason your family misses out on this opportunity.
          </p>
          <a href="mailto:hello@wisefamilies.co" className="mt-4 inline-block">
            <Button variant="link" size="sm" className="text-muted-foreground hover:text-primary">
              Reach Out →
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default AffordabilityPrompt;
