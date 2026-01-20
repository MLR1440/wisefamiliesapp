import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useDeleteReply, type CommunityReply } from '@/hooks/useCommunity';
import DOMPurify from 'dompurify';

interface ReplyCardProps {
  reply: CommunityReply;
  topicId: string;
}

const ReplyCard = ({ reply, topicId }: ReplyCardProps) => {
  const { user, isAdmin } = useAuth();
  const deleteReply = useDeleteReply();
  const isOwner = user?.id === reply.user_id;
  const canDelete = isOwner || isAdmin;
  const timeAgo = formatDistanceToNow(new Date(reply.created_at), { addSuffix: true });

  const handleDelete = () => {
    if (confirm('Delete this reply?')) {
      deleteReply.mutate({ replyId: reply.id, topicId });
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-foreground">{reply.author_name || 'Member'}</span>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">{timeAgo}</span>
        </div>
        
        {canDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            onClick={handleDelete}
            disabled={deleteReply.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div 
        className="prose prose-sm max-w-none text-foreground"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(reply.content) }}
      />
    </div>
  );
};

export default ReplyCard;
