import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/landing/Hero';
import Benefits from '@/components/landing/Benefits';
import CoursePreview from '@/components/landing/CoursePreview';
import FAQ from '@/components/landing/FAQ';
import CTA from '@/components/landing/CTA';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        <Benefits />
        <CoursePreview />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
