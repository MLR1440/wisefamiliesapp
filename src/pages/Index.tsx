import { useEffect } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/landing/Hero';
import Quiz from '@/components/landing/Quiz';
import WhoThisIsFor from '@/components/landing/WhoThisIsFor';
import ProblemValidation from '@/components/landing/ProblemValidation';
import Solution from '@/components/landing/Solution';
import Transformation from '@/components/landing/Transformation';
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
      <Navbar />
      <main>
        <Hero />
        <Quiz />
        <WhoThisIsFor />
        <ProblemValidation />
        <Solution />
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