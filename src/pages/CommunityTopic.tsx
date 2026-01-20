import { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, Trash2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useTopic, useReplies, useCreateReply, useDeleteTopic, COMMUNITY_CATEGORIES } from '@/hooks/useCommunity';
import ReplyCard from '@/components/community/ReplyCard';
import DOMPurify from 'dompurify';

const CommunityTopic = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const navigate = useNavigate();
  const { user, hasAccess, isAdmin } = useAuth();
  const { data: topic, isLoading: topicLoading } = useTopic(topicId || '');
  const { data: replies, isLoading: repliesLoading } = useReplies(topicId || '');
  const createReply = useCreateReply();
  const deleteTopic = useDeleteTopic();
  const [replyContent, setReplyContent] = useState('');

  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'User';
  const isOwner = user?.id === topic?.user_id;
  const canDelete = isOwner || isAdmin;

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !topicId) return;

    await createReply.mutateAsync({ topicId, content: replyContent });
    setReplyContent('');
  };

  const handleDeleteTopic = async () => {
    if (!topicId) return;
    if (confirm('Delete this discussion and all its replies?')) {
      await deleteTopic.mutateAsync(topicId);
      navigate('/community');
    }
  };

  if (topicLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isLoggedIn hasPurchased={hasAccess} userName={userName} isAdmin={isAdmin} />
        <main className="container max-w-4xl py-12 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isLoggedIn hasPurchased={hasAccess} userName={userName} isAdmin={isAdmin} />
        <main className="container max-w-4xl py-12 text-center">
          <p className="text-muted-foreground mb-4">Discussion not found</p>
          <Link to="/community">
            <Button variant="outline">Back to Community</Button>
          </Link>
        </main>
      </div>
    );
  }

  const categoryLabel = COMMUNITY_CATEGORIES.find(c => c.value === topic.category)?.label || topic.category;
  const timeAgo = formatDistanceToNow(new Date(topic.created_at), { addSuffix: true });

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn hasPurchased={hasAccess} userName={userName} isAdmin={isAdmin} />
      
      <main className="container max-w-4xl py-8 md:py-12">
        {/* Back button */}
        <Link to="/community" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Community
        </Link>

        {/* Topic content */}
        <div className="rounded-xl border border-border bg-card p-6 mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{categoryLabel}</Badge>
              <span className="text-sm text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">{timeAgo}</span>
            </div>
            
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive"
                onClick={handleDeleteTopic}
                disabled={deleteTopic.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <h1 className="text-xl font-semibold text-foreground mb-4">
            {topic.title}
          </h1>

          <div 
            className="prose prose-sm max-w-none text-foreground"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(topic.content) }}
          />

          <div className="mt-4 pt-4 border-t border-border">
            <span className="text-sm text-muted-foreground">Posted by Member</span>
          </div>
        </div>

        {/* Replies section */}
        <div className="mb-6">
          <h2 className="text-lg font-medium text-foreground mb-4">
            Replies ({replies?.length || 0})
          </h2>

          {repliesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          ) : replies && replies.length > 0 ? (
            <div className="space-y-3">
              {replies.map((reply) => (
                <ReplyCard key={reply.id} reply={reply} topicId={topicId || ''} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-4">No replies yet. Be the first to respond!</p>
          )}
        </div>

        {/* Reply form */}
        <form onSubmit={handleSubmitReply} className="rounded-xl border border-border bg-card p-4">
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            rows={4}
            className="mb-3"
          />
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={createReply.isPending || !replyContent.trim()}
              className="gap-2"
            >
              {createReply.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Reply
            </Button>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};

export default CommunityTopic;
