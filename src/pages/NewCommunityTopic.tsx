import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Paywall from '@/components/Paywall';
import NewTopicForm from '@/components/community/NewTopicForm';

const NewCommunityTopic = () => {
  const { user, hasAccess, checkingPayment, isAdmin } = useAuth();
  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User';

  if (checkingPayment) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isLoggedIn hasPurchased={hasAccess} userName={userName} isAdmin={isAdmin} />
        <main className="container max-w-2xl py-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isLoggedIn hasPurchased={false} userName={userName} />
        <main className="container max-w-2xl py-12">
          <Paywall />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn hasPurchased={hasAccess} userName={userName} isAdmin={isAdmin} />
      
      <main className="container max-w-2xl py-8 md:py-12">
        <NewTopicForm />
      </main>

      <Footer />
    </div>
  );
};

export default NewCommunityTopic;
