import { Link } from 'react-router-dom';
import { MessageSquare, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import type { CommunityTopic } from '@/hooks/useCommunity';
import { COMMUNITY_CATEGORIES } from '@/hooks/useCommunity';

interface TopicCardProps {
  topic: CommunityTopic;
}

const TopicCard = ({ topic }: TopicCardProps) => {
  const categoryLabel = COMMUNITY_CATEGORIES.find(c => c.value === topic.category)?.label || topic.category;
  const timeAgo = formatDistanceToNow(new Date(topic.updated_at), { addSuffix: true });

  return (
    <Link 
      to={`/community/${topic.id}`}
      className="block rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/30"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="secondary" className="text-xs">
              {categoryLabel}
            </Badge>
          </div>
          
          <h3 className="font-medium text-foreground mb-1 line-clamp-1">
            {topic.title}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {topic.content.replace(/<[^>]*>/g, '').substring(0, 150)}
            {topic.content.length > 150 ? '...' : ''}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{topic.author_name}</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {topic.reply_count} {topic.reply_count === 1 ? 'reply' : 'replies'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TopicCard;
