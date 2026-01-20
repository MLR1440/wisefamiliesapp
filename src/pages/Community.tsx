import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Paywall from '@/components/Paywall';
import TopicCard from '@/components/community/TopicCard';
import { useTopics, COMMUNITY_CATEGORIES } from '@/hooks/useCommunity';

const Community = () => {
  const { user, hasAccess, checkingPayment, isAdmin } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { data: topics, isLoading } = useTopics(selectedCategory);

  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User';

  if (checkingPayment) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isLoggedIn hasPurchased={hasAccess} userName={userName} isAdmin={isAdmin} />
        <main className="container max-w-4xl py-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isLoggedIn hasPurchased={false} userName={userName} />
        <main className="container max-w-4xl py-12">
          <div className="mb-8">
            <h1 className="mb-2 font-heading text-2xl font-semibold text-foreground">
              Community
            </h1>
            <p className="text-muted-foreground">
              Join discussions with other parents navigating AI and parenting
            </p>
          </div>
          
          <div className="grid gap-8 lg:grid-cols-2">
            <Paywall />
            <div className="space-y-4">
              <p className="text-sm font-medium text-muted-foreground">What you'll get access to:</p>
              <div className="space-y-3">
                {COMMUNITY_CATEGORIES.filter(c => c.value !== 'all').map((cat) => (
                  <div key={cat.value} className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{cat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn hasPurchased={hasAccess} userName={userName} isAdmin={isAdmin} />
      
      <main className="container max-w-4xl py-8 md:py-12">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="mb-1 font-heading text-2xl font-semibold text-foreground">
              Community
            </h1>
            <p className="text-muted-foreground">
              Discuss AI and parenting with other families
            </p>
          </div>
          
          <Link to="/community/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Discussion
            </Button>
          </Link>
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {COMMUNITY_CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Topics list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : topics && topics.length > 0 ? (
          <div className="space-y-3">
            {topics.map((topic) => (
              <TopicCard key={topic.id} topic={topic} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border py-12 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">No discussions yet</p>
            <Link to="/community/new">
              <Button variant="outline" size="sm">
                Start the first discussion
              </Button>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Community;
