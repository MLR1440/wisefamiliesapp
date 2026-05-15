import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import SEO from '@/components/SEO';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/landing/Hero';
import Quiz from '@/components/landing/Quiz';
import WhoThisIsFor from '@/components/landing/WhoThisIsFor';
import ProblemValidation from '@/components/landing/ProblemValidation';
import Solution from '@/components/landing/Solution';
import Transformation from '@/components/landing/Transformation';
import ThirtyDayTimeline from '@/components/landing/ThirtyDayTimeline';
import CourseContent from '@/components/landing/CourseContent';
import WhatMakesThisDifferent from '@/components/landing/WhatMakesThisDifferent';
import Pricing from '@/components/landing/Pricing';
import Guarantee from '@/components/landing/Guarantee';
import FAQ from '@/components/landing/FAQ';
import CTA from '@/components/landing/CTA';
import ContactPrompt from '@/components/landing/ContactPrompt';
import AffordabilityPrompt from '@/components/landing/AffordabilityPrompt';

const Index = () => {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="WiseFamilies — The 30-Day AI-Ready Family Reset"
        description="Install a family AI agreement, end homework-cheating panic, and raise kids who think for themselves. 10 minutes a day. No tech skills required."
        path="/"
      />
      <Navbar />
      <main>
        <Hero />
        <Quiz />
        <WhoThisIsFor />
        <ProblemValidation />
        <Solution />
        <ThirtyDayTimeline />
        <Transformation />
        <CourseContent />
        <WhatMakesThisDifferent />
        <Pricing />
        <Guarantee />
        <FAQ />
        <CTA />
        <ContactPrompt />
        <AffordabilityPrompt />
      </main>
      <Footer />
    </div>
  );
};

export default Index;