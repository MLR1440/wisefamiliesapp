import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/landing/Hero';
import Benefits from '@/components/landing/Benefits';
import Solution from '@/components/landing/Solution';
import CoursePreview from '@/components/landing/CoursePreview';
import Bonuses from '@/components/landing/Bonuses';
import Guarantee from '@/components/landing/Guarantee';
import FAQ from '@/components/landing/FAQ';
import CTA from '@/components/landing/CTA';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Benefits />
        <Solution />
        <CoursePreview />
        <Bonuses />
        <Guarantee />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
