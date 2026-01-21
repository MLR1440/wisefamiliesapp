import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/landing/Hero';
import ProblemValidation from '@/components/landing/ProblemValidation';
import Solution from '@/components/landing/Solution';
import CourseContent from '@/components/landing/CourseContent';
import WhatMakesThisDifferent from '@/components/landing/WhatMakesThisDifferent';
import WhoThisIsFor from '@/components/landing/WhoThisIsFor';
import Pricing from '@/components/landing/Pricing';
import Guarantee from '@/components/landing/Guarantee';
import FAQ from '@/components/landing/FAQ';
import CTA from '@/components/landing/CTA';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <ProblemValidation />
        <Solution />
        <CourseContent />
        <WhatMakesThisDifferent />
        <WhoThisIsFor />
        <Pricing />
        <Guarantee />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;