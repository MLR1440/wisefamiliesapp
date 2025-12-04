import { useState, useCallback, useEffect } from 'react';
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
import { mockAdminUser, mockModules, mockModulePrompts } from '@/data/mockData';
import { Plus, Edit, GripVertical, Eye, ArrowLeft, Trash2, Video, MessageSquare } from 'lucide-react';
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
import { Module } from '@/types';

const MODULES_STORAGE_KEY = 'wisefamilies_modules';

// Utility to get modules from localStorage or mock data
const getStoredModules = (): Module[] => {
  const stored = localStorage.getItem(MODULES_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      return parsed.map((m: any) => ({
        ...m,
        createdAt: new Date(m.createdAt),
        updatedAt: new Date(m.updatedAt),
      }));
    } catch {
      return [...mockModules];
    }
  }
  return [...mockModules];
};

// Utility to save modules to localStorage
const saveModulesToStorage = (modules: Module[]) => {
  localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(modules));
};

interface SortableModuleItemProps {
  module: Module;
  index: number;
  promptsCount: number;
  onDelete: (id: string) => void;
}

const SortableModuleItem = ({ module, index, promptsCount, onDelete }: SortableModuleItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasVideo = module.videoUrl && module.videoType !== 'none';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-soft"
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground focus:outline-none active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Order number */}
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 font-heading font-semibold text-primary">
        {index + 1}
      </div>

      {/* Content */}
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

      {/* Indicators */}
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

      {/* Actions */}
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [modules, setModules] = useState<Module[]>([]);
  const [deleteModuleId, setDeleteModuleId] = useState<string | null>(null);
  const currentFilter = (searchParams.get('filter') as FilterTab) || 'all';

  // Load modules from storage on mount
  useEffect(() => {
    const storedModules = getStoredModules();
    setModules(storedModules.sort((a, b) => a.orderNumber - b.orderNumber));
  }, []);

  // Save modules whenever they change
  useEffect(() => {
    if (modules.length > 0) {
      saveModulesToStorage(modules);
    }
  }, [modules]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getPromptsCount = useCallback((moduleId: string) => {
    return mockModulePrompts.filter(p => p.moduleId === moduleId).length;
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setModules((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        const newItems = arrayMove(items, oldIndex, newIndex);
        // Update order numbers
        const reordered = newItems.map((item, idx) => ({
          ...item,
          orderNumber: idx + 1,
        }));
        
        toast.success('Module order updated');
        return reordered;
      });
    }
  };

  const handleDeleteModule = () => {
    if (deleteModuleId) {
      setModules(modules.filter(m => m.id !== deleteModuleId));
      toast.success('Module deleted');
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

  // Filter modules based on current tab
  const filteredModules = modules.filter(m => {
    if (currentFilter === 'published') return m.status === 'published';
    if (currentFilter === 'draft') return m.status === 'draft';
    return true;
  });

  const draftCount = modules.filter(m => m.status === 'draft').length;
  const publishedCount = modules.filter(m => m.status === 'published').length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn isAdmin hasPurchased userName={mockAdminUser.firstName} />

      <main className="container py-8 md:py-12">
        {/* Back link */}
        <Link
          to="/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </Link>

        {/* Header */}
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

        {/* Filter Tabs */}
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

        {/* Modules list */}
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
                    promptsCount={getPromptsCount(module.id)}
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

      {/* Delete Confirmation Dialog */}
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
