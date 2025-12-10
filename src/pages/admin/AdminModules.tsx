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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Edit, GripVertical, Eye, ArrowLeft, Trash2, Video, MessageSquare, Loader2, ChevronDown, FolderPlus } from 'lucide-react';
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
import { useChapters, DbChapter } from '@/hooks/useChapters';
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
      className="group flex items-center gap-4 rounded-lg border border-border bg-card p-3 transition-all duration-200 hover:border-primary/30"
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground focus:outline-none active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-medium text-primary">
        {index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-medium text-foreground truncate text-sm">
            {module.title}
          </h4>
          <Badge variant={module.status === 'published' ? 'default' : 'secondary'} className="text-xs">
            {module.status}
          </Badge>
        </div>
      </div>

      <div className="hidden items-center gap-2 sm:flex">
        {hasVideo ? (
          <Video className="h-4 w-4 text-primary" />
        ) : (
          <Video className="h-4 w-4 text-muted-foreground/50" />
        )}
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MessageSquare className="h-3 w-3" />
          <span>{promptsCount}</span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <Link to={`/course/${module.id}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Preview">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
        <Link to={`/admin/modules/${module.id}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit">
            <Edit className="h-4 w-4" />
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          title="Delete"
          onClick={() => onDelete(module.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

interface SortableChapterProps {
  chapter: DbChapter;
  modules: DbModule[];
  onDeleteChapter: (id: string) => void;
  onDeleteModule: (id: string) => void;
  onReorderModules: (chapterId: string, modules: DbModule[]) => void;
}

const SortableChapter = ({ chapter, modules, onDeleteChapter, onDeleteModule, onReorderModules }: SortableChapterProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `chapter-${chapter.id}` });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleModuleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = modules.findIndex((item) => item.id === active.id);
      const newIndex = modules.findIndex((item) => item.id === over.id);
      const reordered = arrayMove(modules, oldIndex, newIndex);
      onReorderModules(chapter.id, reordered);
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="rounded-xl border border-border bg-card overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center gap-3 p-4 bg-muted/30">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none text-muted-foreground hover:text-foreground focus:outline-none active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5" />
          </button>

          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-2 flex-1 text-left">
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? '' : '-rotate-90'}`} />
              <h3 className="font-heading font-semibold text-foreground">{chapter.title}</h3>
              <Badge variant={chapter.status === 'published' ? 'default' : 'secondary'}>
                {chapter.status}
              </Badge>
              <span className="text-sm text-muted-foreground ml-2">
                ({modules.length} module{modules.length !== 1 ? 's' : ''})
              </span>
            </button>
          </CollapsibleTrigger>

          <div className="flex items-center gap-1">
            <Link to={`/admin/chapters/${chapter.id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit Chapter">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              title="Delete Chapter"
              onClick={() => onDeleteChapter(chapter.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Link to={`/admin/modules/new?chapter=${chapter.id}`}>
              <Button variant="ghost" size="sm" className="gap-1 h-8">
                <Plus className="h-4 w-4" />
                Module
              </Button>
            </Link>
          </div>
        </div>

        <CollapsibleContent>
          <div className="p-4 pt-2 space-y-2">
            {modules.length > 0 ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleModuleDragEnd}
              >
                <SortableContext
                  items={modules.map(m => m.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {modules.map((module, index) => (
                    <SortableModuleItem
                      key={module.id}
                      module={module}
                      index={index}
                      onDelete={onDeleteModule}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No modules in this chapter yet.{' '}
                <Link to={`/admin/modules/new?chapter=${chapter.id}`} className="text-primary hover:underline">
                  Add one
                </Link>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

type FilterTab = 'all' | 'published' | 'draft';

const AdminModules = () => {
  const { user, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { modules, loading: modulesLoading, deleteModule, reorderModules, fetchModules } = useModules();
  const { chapters, loading: chaptersLoading, deleteChapter, reorderChapters } = useChapters();
  const [deleteModuleId, setDeleteModuleId] = useState<string | null>(null);
  const [deleteChapterId, setDeleteChapterId] = useState<string | null>(null);
  const currentFilter = (searchParams.get('filter') as FilterTab) || 'all';
  
  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Admin';

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleChapterDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const activeId = String(active.id).replace('chapter-', '');
      const overId = String(over.id).replace('chapter-', '');
      const oldIndex = chapters.findIndex((item) => item.id === activeId);
      const newIndex = chapters.findIndex((item) => item.id === overId);
      const reordered = arrayMove(chapters, oldIndex, newIndex);
      
      try {
        await reorderChapters(reordered);
        toast.success('Chapter order updated');
      } catch (error) {
        toast.error('Failed to update order');
      }
    }
  };

  const handleModuleReorder = async (chapterId: string, reorderedModules: DbModule[]) => {
    try {
      await reorderModules(reorderedModules);
      toast.success('Module order updated');
    } catch (error) {
      toast.error('Failed to update order');
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

  const handleDeleteChapter = async () => {
    if (deleteChapterId) {
      try {
        await deleteChapter(deleteChapterId);
        toast.success('Chapter deleted');
        await fetchModules(); // Refresh modules as they may have lost their chapter
      } catch (error) {
        toast.error('Failed to delete chapter');
      }
      setDeleteChapterId(null);
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

  // Get modules for a chapter with filter applied
  const getModulesForChapter = (chapterId: string) => {
    return modules
      .filter(m => m.chapter_id === chapterId)
      .filter(m => {
        if (currentFilter === 'published') return m.status === 'published';
        if (currentFilter === 'draft') return m.status === 'draft';
        return true;
      })
      .sort((a, b) => a.order_number - b.order_number);
  };

  // Filter chapters based on current filter
  // For 'draft' filter: show chapters that are drafts OR have draft modules
  // For 'published' filter: show chapters that are published AND have published modules
  const filteredChapters = chapters.filter(c => {
    if (currentFilter === 'published') {
      return c.status === 'published' && getModulesForChapter(c.id).length > 0;
    }
    if (currentFilter === 'draft') {
      // Show chapter if it's a draft OR if it has any draft modules
      const hasDraftModules = modules.some(m => m.chapter_id === c.id && m.status === 'draft');
      return c.status === 'draft' || hasDraftModules;
    }
    return true;
  });

  // Modules without a chapter
  const unassignedModules = modules
    .filter(m => !m.chapter_id)
    .filter(m => {
      if (currentFilter === 'published') return m.status === 'published';
      if (currentFilter === 'draft') return m.status === 'draft';
      return true;
    });

  const draftCount = chapters.filter(c => c.status === 'draft').length + modules.filter(m => m.status === 'draft').length;
  const publishedCount = chapters.filter(c => c.status === 'published').length + modules.filter(m => m.status === 'published').length;
  const totalCount = chapters.length + modules.length;

  const loading = modulesLoading || chaptersLoading;

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
              Course Content
            </h1>
            <p className="text-muted-foreground">
              Organize your course into chapters and modules
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/chapters/new">
              <Button variant="outline" className="gap-2">
                <FolderPlus className="h-4 w-4" />
                New Chapter
              </Button>
            </Link>
            <Link to="/admin/modules/new">
              <Button variant="cta" className="gap-2">
                <Plus className="h-4 w-4" />
                New Module
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={currentFilter} onValueChange={handleFilterChange} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">
              All ({totalCount})
            </TabsTrigger>
            <TabsTrigger value="published">
              Published ({publishedCount})
            </TabsTrigger>
            <TabsTrigger value="draft">
              Drafts ({draftCount})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {filteredChapters.length > 0 || unassignedModules.length > 0 ? (
          <div className="space-y-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleChapterDragEnd}
            >
              <SortableContext
                items={filteredChapters.map(c => `chapter-${c.id}`)}
                strategy={verticalListSortingStrategy}
              >
                {filteredChapters.map((chapter) => (
                  <SortableChapter
                    key={chapter.id}
                    chapter={chapter}
                    modules={getModulesForChapter(chapter.id)}
                    onDeleteChapter={setDeleteChapterId}
                    onDeleteModule={setDeleteModuleId}
                    onReorderModules={handleModuleReorder}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {unassignedModules.length > 0 && (
              <div className="rounded-xl border border-dashed border-border p-4">
                <h3 className="font-heading font-semibold text-muted-foreground mb-3">
                  Unassigned Modules
                </h3>
                <div className="space-y-2">
                  {unassignedModules.map((module, index) => (
                    <SortableModuleItem
                      key={module.id}
                      module={module}
                      index={index}
                      onDelete={setDeleteModuleId}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <p className="mb-4 text-muted-foreground">
              {currentFilter === 'draft' 
                ? 'No draft content' 
                : currentFilter === 'published' 
                  ? 'No published content' 
                  : 'No content yet'}
            </p>
            <div className="flex gap-2">
              <Link to="/admin/chapters/new">
                <Button variant="outline" className="gap-2">
                  <FolderPlus className="h-4 w-4" />
                  Create First Chapter
                </Button>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Delete Module Dialog */}
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

      {/* Delete Chapter Dialog */}
      <AlertDialog open={!!deleteChapterId} onOpenChange={() => setDeleteChapterId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chapter? Modules in this chapter will become unassigned but won't be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChapter}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Chapter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminModules;
