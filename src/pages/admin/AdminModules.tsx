import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, GripVertical, Eye, ArrowLeft, Trash2, Video, MessageSquare, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useModules, DbModule } from '@/hooks/useModules';
import { supabase } from '@/integrations/supabase/client';

interface SortableModuleItemProps {
  module: DbModule;
  index: number;
  onDelete: (id: string) => void;
}

const SortableModuleItem = ({ module, index, onDelete }: SortableModuleItemProps) => {
  const [promptsCount, setPromptsCount] = useState(0);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from('module_prompts')
        .select('*', { count: 'exact', head: true })
        .eq('module_id', module.id);
      setPromptsCount(count || 0);
    };
    fetchCount();
  }, [module.id]);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasVideo = module.video_url && module.video_type !== 'none';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-soft"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground focus:outline-none active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 font-heading font-semibold text-primary">
        {index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-heading font-semibold text-foreground truncate">
            {module.title}
          </h3>
          <Badge variant={module.status === 'published' ? 'default' : 'secondary'}>
            {module.status}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground truncate">
          {module.description}
        </p>
      </div>

      <div className="hidden items-center gap-3 sm:flex">
        {hasVideo ? (
          <div className="flex items-center gap-1.5 text-sm text-primary">
            <Video className="h-4 w-4" />
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground/50">
            <Video className="h-4 w-4" />
          </div>
        )}
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MessageSquare className="h-4 w-4" />
          <span>{promptsCount}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Link to={`/course/${module.id}`}>
          <Button variant="ghost" size="icon" title="Preview">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
        <Link to={`/admin/modules/${module.id}`}>
          <Button variant="ghost" size="icon" title="Edit">
            <Edit className="h-4 w-4" />
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          size="icon" 
          title="Delete"
          onClick={() => onDelete(module.id)}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

type FilterTab = 'all' | 'published' | 'draft';

const AdminModules = () => {
  const { user, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { modules, loading, deleteModule, reorderModules } = useModules();
  const [deleteModuleId, setDeleteModuleId] = useState<string | null>(null);
  const currentFilter = (searchParams.get('filter') as FilterTab) || 'all';
  
  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Admin';

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = modules.findIndex((item) => item.id === active.id);
      const newIndex = modules.findIndex((item) => item.id === over.id);
      const reordered = arrayMove(modules, oldIndex, newIndex);
      
      try {
        await reorderModules(reordered);
        toast.success('Module order updated');
      } catch (error) {
        toast.error('Failed to update order');
      }
    }
  };

  const handleDeleteModule = async () => {
    if (deleteModuleId) {
      try {
        await deleteModule(deleteModuleId);
        toast.success('Module deleted');
      } catch (error) {
        toast.error('Failed to delete module');
      }
      setDeleteModuleId(null);
    }
  };

  const handleFilterChange = (value: string) => {
    if (value === 'all') {
      searchParams.delete('filter');
    } else {
      searchParams.set('filter', value);
    }
    setSearchParams(searchParams);
  };

  const filteredModules = modules.filter(m => {
    if (currentFilter === 'published') return m.status === 'published';
    if (currentFilter === 'draft') return m.status === 'draft';
    return true;
  });

  const draftCount = modules.filter(m => m.status === 'draft').length;
  const publishedCount = modules.filter(m => m.status === 'published').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar isLoggedIn isAdmin={isAdmin} hasPurchased userName={userName} />
        <main className="container py-8 md:py-12 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn isAdmin={isAdmin} hasPurchased userName={userName} />

      <main className="container py-8 md:py-12">
        <Link
          to="/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </Link>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 font-heading text-3xl font-bold text-foreground">
              Course Modules
            </h1>
            <p className="text-muted-foreground">
              Create, edit, and reorder your course modules
            </p>
          </div>
          <Link to="/admin/modules/new">
            <Button variant="cta" className="gap-2">
              <Plus className="h-4 w-4" />
              Add New Module
            </Button>
          </Link>
        </div>

        <Tabs value={currentFilter} onValueChange={handleFilterChange} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">
              All ({modules.length})
            </TabsTrigger>
            <TabsTrigger value="published">
              Published ({publishedCount})
            </TabsTrigger>
            <TabsTrigger value="draft">
              Drafts ({draftCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredModules.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredModules.map(m => m.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {filteredModules.map((module, index) => (
                  <SortableModuleItem
                    key={module.id}
                    module={module}
                    index={index}
                    onDelete={setDeleteModuleId}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <p className="mb-4 text-muted-foreground">
              {currentFilter === 'draft' 
                ? 'No draft modules' 
                : currentFilter === 'published' 
                  ? 'No published modules' 
                  : 'No modules yet'}
            </p>
            <Link to="/admin/modules/new">
              <Button variant="cta" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Module
              </Button>
            </Link>
          </div>
        )}
      </main>

      <AlertDialog open={!!deleteModuleId} onOpenChange={() => setDeleteModuleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Module</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this module? This action cannot be undone.
              All associated prompts and student progress will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteModule}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Module
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminModules;
