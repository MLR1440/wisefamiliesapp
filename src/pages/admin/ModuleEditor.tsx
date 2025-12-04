import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { mockAdminUser, mockModules, mockModulePrompts, mockSettings } from '@/data/mockData';
import { ArrowLeft, Plus, Trash2, Save, GripVertical, ExternalLink, Play, HelpCircle, ChevronUp, ChevronDown } from 'lucide-react';
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

interface PromptField {
  id: string;
  label: string;
  promptText: string;
}

interface SortablePromptProps {
  prompt: PromptField;
  index: number;
  totalCount: number;
  onChange: (id: string, field: 'label' | 'promptText', value: string) => void;
  onRemove: (id: string) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

const SortablePrompt = ({ prompt, index, totalCount, onChange, onRemove, onMoveUp, onMoveDown }: SortablePromptProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: prompt.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex gap-3 rounded-lg border border-border bg-muted/30 p-4"
    >
      <div className="flex flex-col items-center gap-1">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground focus:outline-none active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5" />
        </button>
        <div className="flex flex-col">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onMoveUp(prompt.id)}
            disabled={index === 0}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => onMoveDown(prompt.id)}
            disabled={index === totalCount - 1}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 space-y-3">
        <div className="space-y-2">
          <Label>Button Label</Label>
          <Input
            value={prompt.label}
            onChange={(e) => onChange(prompt.id, 'label', e.target.value)}
            placeholder="What students see on the button"
          />
        </div>
        <div className="space-y-2">
          <Label>Prompt Text</Label>
          <Textarea
            value={prompt.promptText}
            onChange={(e) => onChange(prompt.id, 'promptText', e.target.value)}
            placeholder="The full prompt sent to the LLM"
            rows={2}
          />
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(prompt.id)}
        disabled={totalCount <= 1}
        className="text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

const getYouTubeId = (url: string): string | null => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
};

const getVimeoId = (url: string): string | null => {
  const regExp = /vimeo\.com\/(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

const ModuleEditor = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const isNew = moduleId === 'new';
  
  const existingModule = mockModules.find((m) => m.id === moduleId);
  const existingPrompts = mockModulePrompts.filter((p) => p.moduleId === moduleId);

  const [formData, setFormData] = useState({
    title: existingModule?.title || 'New Module',
    orderNumber: existingModule?.orderNumber || mockModules.length + 1,
    description: existingModule?.description || '',
    videoUrl: existingModule?.videoUrl || '',
    videoType: existingModule?.videoType || 'none',
    systemPrompt: existingModule?.systemPrompt || mockSettings.defaultSystemPrompt,
    status: existingModule?.status || 'draft',
    nextModuleId: existingModule?.nextModuleId || 'auto',
  });

  const [prompts, setPrompts] = useState<PromptField[]>(
    existingPrompts.length > 0
      ? existingPrompts.map((p) => ({
          id: p.id,
          label: p.label,
          promptText: p.promptText,
        }))
      : [{ id: '1', label: '', promptText: '' }]
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(existingModule ? existingModule.updatedAt : null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        handleSubmit(new Event('submit') as any);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formData, prompts]);

  const handleAddPrompt = () => {
    if (prompts.length >= 4) {
      toast.error('Maximum 4 prompts allowed');
      return;
    }
    setPrompts([
      ...prompts,
      { id: Date.now().toString(), label: '', promptText: '' },
    ]);
  };

  const handleRemovePrompt = (id: string) => {
    if (prompts.length <= 1) {
      toast.error('At least one prompt is required');
      return;
    }
    setPrompts(prompts.filter((p) => p.id !== id));
  };

  const handlePromptChange = (id: string, field: 'label' | 'promptText', value: string) => {
    setPrompts(
      prompts.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const handleMovePromptUp = (id: string) => {
    const index = prompts.findIndex(p => p.id === id);
    if (index > 0) {
      const newPrompts = arrayMove(prompts, index, index - 1);
      setPrompts(newPrompts);
    }
  };

  const handleMovePromptDown = (id: string) => {
    const index = prompts.findIndex(p => p.id === id);
    if (index < prompts.length - 1) {
      const newPrompts = arrayMove(prompts, index, index + 1);
      setPrompts(newPrompts);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPrompts((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }
    
    if (formData.status === 'published') {
      if (!formData.systemPrompt.trim()) {
        errors.systemPrompt = 'System prompt is required before publishing';
      }
      const validPrompts = prompts.filter(p => p.label.trim() && p.promptText.trim());
      if (validPrompts.length < 1) {
        errors.prompts = 'At least 1 complete prompt is required before publishing';
      }
    }

    if (formData.videoType !== 'none' && formData.videoUrl) {
      if (formData.videoType === 'youtube' && !getYouTubeId(formData.videoUrl)) {
        errors.videoUrl = 'Invalid YouTube URL';
      }
      if (formData.videoType === 'vimeo' && !getVimeoId(formData.videoUrl)) {
        errors.videoUrl = 'Invalid Vimeo URL';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, prompts]);

  const MODULES_STORAGE_KEY = 'wisefamilies_modules';

  const getStoredModules = (): Module[] => {
    const stored = localStorage.getItem(MODULES_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
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

  const saveModulesToStorage = (modules: Module[]) => {
    localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(modules));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix validation errors before saving');
      return;
    }

    setIsSaving(true);
    
    // Get current modules from storage
    const storedModules = getStoredModules();
    
    const newModule: Module = {
      id: isNew ? `module-${Date.now()}` : moduleId!,
      title: formData.title,
      orderNumber: formData.orderNumber,
      description: formData.description,
      videoUrl: formData.videoUrl || undefined,
      videoType: formData.videoType as 'youtube' | 'vimeo' | 'none',
      systemPrompt: formData.systemPrompt,
      status: formData.status as 'draft' | 'published',
      nextModuleId: formData.nextModuleId === 'auto' ? undefined : formData.nextModuleId,
      createdAt: isNew ? new Date() : (existingModule?.createdAt || new Date()),
      updatedAt: new Date(),
    };

    let updatedModules: Module[];
    if (isNew) {
      updatedModules = [...storedModules, newModule];
    } else {
      updatedModules = storedModules.map(m => m.id === moduleId ? newModule : m);
    }

    // Sort by order number
    updatedModules.sort((a, b) => a.orderNumber - b.orderNumber);
    saveModulesToStorage(updatedModules);

    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
      toast.success(isNew ? 'Module created!' : 'Module saved!');
      if (isNew) {
        navigate('/admin/modules?filter=draft');
      }
    }, 500);
  };

  const handleDelete = () => {
    const storedModules = getStoredModules();
    const updatedModules = storedModules.filter(m => m.id !== moduleId);
    saveModulesToStorage(updatedModules);
    toast.success('Module deleted');
    navigate('/admin/modules');
  };

  const handleTestVideo = () => {
    setVideoError(false);
    if (!formData.videoUrl) {
      toast.error('Please enter a video URL first');
      return;
    }
    toast.success('Video appears to be valid!');
  };

  const handleUseDefaultPrompt = () => {
    setFormData({ ...formData, systemPrompt: mockSettings.defaultSystemPrompt });
    toast.success('Default system prompt loaded');
  };

  const getVideoPreview = () => {
    if (!formData.videoUrl || formData.videoType === 'none') return null;

    if (formData.videoType === 'youtube') {
      const videoId = getYouTubeId(formData.videoUrl);
      if (videoId) {
        return (
          <div className="aspect-video overflow-hidden rounded-lg bg-muted">
            <img
              src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
              alt="Video thumbnail"
              className="h-full w-full object-cover"
              onError={() => setVideoError(true)}
            />
          </div>
        );
      }
    }

    if (formData.videoType === 'vimeo') {
      const videoId = getVimeoId(formData.videoUrl);
      if (videoId) {
        return (
          <div className="aspect-video overflow-hidden rounded-lg bg-muted flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Play className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">Vimeo video: {videoId}</p>
            </div>
          </div>
        );
      }
    }

    return null;
  };

  // Get next module for preview
  const nextModule = formData.nextModuleId === 'auto'
    ? mockModules.find(m => m.orderNumber === formData.orderNumber + 1)
    : mockModules.find(m => m.id === formData.nextModuleId);

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn isAdmin hasPurchased userName={mockAdminUser.firstName} />

      <main className="container max-w-4xl py-8 md:py-12">
        {/* Top bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Link
            to="/admin/modules"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Modules
          </Link>
          <div className="flex items-center gap-2">
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value as 'draft' | 'published' })
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
            {!isNew && (
              <Link to={`/course/${moduleId}`} target="_blank">
                <Button variant="outline" size="sm" className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Preview
                </Button>
              </Link>
            )}
            <Button 
              variant="cta" 
              size="sm" 
              onClick={handleSubmit}
              disabled={isSaving}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 font-heading text-3xl font-bold text-foreground">
            {isNew ? 'Create New Module' : formData.title || 'Edit Module'}
          </h1>
          {lastSaved && (
            <p className="text-sm text-muted-foreground">
              Last saved: {lastSaved.toLocaleString()}
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Basic info */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 font-heading font-semibold text-foreground">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="sm:col-span-3 space-y-2">
                  <Label htmlFor="title">Module Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Building Critical Thinking"
                    className={validationErrors.title ? 'border-destructive' : ''}
                  />
                  {validationErrors.title && (
                    <p className="text-sm text-destructive">{validationErrors.title}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Order</Label>
                  <Input
                    id="orderNumber"
                    type="number"
                    min={1}
                    value={formData.orderNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        orderNumber: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of what students will learn in this module..."
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Video settings */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 font-heading font-semibold text-foreground">
              Video Content
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="videoType">Video Platform</Label>
                <Select
                  value={formData.videoType}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      videoType: value as 'youtube' | 'vimeo' | 'direct' | 'none',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (no video)</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="vimeo">Vimeo</SelectItem>
                    <SelectItem value="direct">Direct URL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.videoType !== 'none' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="videoUrl">Video URL</Label>
                    <div className="flex gap-2">
                      <Input
                        id="videoUrl"
                        value={formData.videoUrl}
                        onChange={(e) =>
                          setFormData({ ...formData, videoUrl: e.target.value })
                        }
                        placeholder={
                          formData.videoType === 'youtube' 
                            ? 'https://www.youtube.com/watch?v=...'
                            : formData.videoType === 'vimeo'
                            ? 'https://vimeo.com/...'
                            : 'https://example.com/video.mp4'
                        }
                        className={validationErrors.videoUrl ? 'border-destructive' : ''}
                      />
                      <Button type="button" variant="outline" onClick={handleTestVideo}>
                        <Play className="mr-2 h-4 w-4" />
                        Test
                      </Button>
                    </div>
                    {validationErrors.videoUrl && (
                      <p className="text-sm text-destructive">{validationErrors.videoUrl}</p>
                    )}
                  </div>

                  {getVideoPreview()}
                </>
              )}
            </div>
          </div>

          {/* Section 3: System prompt */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-semibold text-foreground">
                  AI System Prompt
                </h2>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>The system prompt sets the context and personality for the AI assistant in this module. It guides how the AI responds to students.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleUseDefaultPrompt}>
                Use Default
              </Button>
            </div>
            <div className="space-y-2">
              <Textarea
                id="systemPrompt"
                value={formData.systemPrompt}
                onChange={(e) =>
                  setFormData({ ...formData, systemPrompt: e.target.value })
                }
                placeholder="You are a helpful parenting coach..."
                rows={5}
                className={validationErrors.systemPrompt ? 'border-destructive' : ''}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{formData.systemPrompt.length} characters</span>
                {validationErrors.systemPrompt && (
                  <span className="text-destructive">{validationErrors.systemPrompt}</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Starter prompts */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-heading font-semibold text-foreground">
                  Starter Prompts
                </h2>
                <p className="text-sm text-muted-foreground">
                  Add 1-4 prompts that students can click to start conversations
                </p>
                {validationErrors.prompts && (
                  <p className="text-sm text-destructive mt-1">{validationErrors.prompts}</p>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddPrompt}
                disabled={prompts.length >= 4}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Prompt
              </Button>
            </div>

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={prompts.map(p => p.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {prompts.map((prompt, index) => (
                    <SortablePrompt
                      key={prompt.id}
                      prompt={prompt}
                      index={index}
                      totalCount={prompts.length}
                      onChange={handlePromptChange}
                      onRemove={handleRemovePrompt}
                      onMoveUp={handleMovePromptUp}
                      onMoveDown={handleMovePromptDown}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Section 5: Next Module */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 font-heading font-semibold text-foreground">
              Next Module
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>After this module, go to:</Label>
                <Select
                  value={formData.nextModuleId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, nextModuleId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Auto (next by order)</SelectItem>
                    {mockModules
                      .filter(m => m.id !== moduleId)
                      .map(module => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.orderNumber}. {module.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              {nextModule && (
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-sm font-medium text-foreground">{nextModule.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{nextModule.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-border pt-6">
            {!isNew && (
              <Button 
                type="button" 
                variant="outline" 
                className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Module
              </Button>
            )}
            <div className="ml-auto flex items-center gap-3">
              <Link to="/admin/modules">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" variant="cta" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : isNew ? 'Create Module' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </form>
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Module</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{formData.title}"? This action cannot be undone.
              All associated prompts and student progress will also be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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

export default ModuleEditor;
