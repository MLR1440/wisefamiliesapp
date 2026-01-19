import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/ui/rich-text-editor';
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
import { useAuth } from '@/contexts/AuthContext';
import { mockSettings } from '@/data/mockData';
import { ArrowLeft, Plus, Trash2, Save, GripVertical, ExternalLink, Play, HelpCircle, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
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
import { useModule, useModules } from '@/hooks/useModules';
import { useChapters } from '@/hooks/useChapters';
import { supabase } from '@/integrations/supabase/client';

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

// Character limits
const CHAR_LIMITS = {
  systemPrompt: 6000,
  promptText: 800,
  buttonLabel: 50,
};

const CharacterCounter = ({ current, limit }: { current: number; limit: number }) => {
  const isOverLimit = current > limit;
  return (
    <span className={`text-xs ${isOverLimit ? 'text-orange-500 font-medium' : 'text-muted-foreground'}`}>
      {current}{isOverLimit && ` / ${limit} recommended`}
    </span>
  );
};

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
          <div className="flex items-center justify-between">
            <Label>Button Label</Label>
            <CharacterCounter current={prompt.label.length} limit={CHAR_LIMITS.buttonLabel} />
          </div>
          <Input
            value={prompt.label}
            onChange={(e) => onChange(prompt.id, 'label', e.target.value)}
            placeholder="What students see on the button"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Prompt Text</Label>
            <CharacterCounter current={prompt.promptText.length} limit={CHAR_LIMITS.promptText} />
          </div>
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const isNew = moduleId === 'new';
  
  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Admin';
  
  const { module: existingModule, prompts: existingPrompts, loading: moduleLoading } = useModule(moduleId);
  const { modules: allModules, createModule, updateModule, deleteModule } = useModules();
  const { chapters } = useChapters();
  
  // Get chapter from URL params for new modules
  const initialChapterId = searchParams.get('chapter') || '';

  const [formData, setFormData] = useState({
    title: 'New Module',
    orderNumber: 1,
    description: '',
    videoUrl: '',
    videoType: 'none',
    systemPrompt: mockSettings.defaultSystemPrompt,
    status: 'draft',
    nextModuleId: 'auto',
    chapterId: initialChapterId,
    transcript: '',
  });

  const [prompts, setPrompts] = useState<PromptField[]>([
    { id: '1', label: '', promptText: '' }
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [videoError, setVideoError] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Track original data for dirty state detection
  const [originalData, setOriginalData] = useState<string>('');
  
  // Compute dirty state by comparing current form to original
  const isDirty = useMemo(() => {
    if (!originalData) return false;
    const currentSnapshot = JSON.stringify({ formData, prompts });
    return currentSnapshot !== originalData;
  }, [formData, prompts, originalData]);

  // Calculate chapter.module position indicator (e.g., "4.1")
  const positionIndicator = useMemo(() => {
    if (!formData.chapterId || isNew) return null;
    
    // Find the chapter's order number
    const chapter = chapters.find(c => c.id === formData.chapterId);
    if (!chapter) return null;
    
    // Get all modules in this chapter, sorted by order
    const modulesInChapter = allModules
      .filter(m => m.chapter_id === formData.chapterId)
      .sort((a, b) => a.order_number - b.order_number);
    
    // Find this module's position within the chapter
    const moduleIndex = modulesInChapter.findIndex(m => m.id === moduleId);
    if (moduleIndex === -1) return null;
    
    return `${chapter.order_number}.${moduleIndex + 1}`;
  }, [formData.chapterId, chapters, allModules, moduleId, isNew]);

  // Load existing module data
  useEffect(() => {
    if (existingModule) {
      const loadedFormData = {
        title: existingModule.title,
        orderNumber: existingModule.order_number,
        description: existingModule.description,
        videoUrl: existingModule.video_url,
        videoType: existingModule.video_type,
        systemPrompt: existingModule.system_prompt,
        status: existingModule.status,
        nextModuleId: existingModule.next_module_id || 'auto',
        chapterId: existingModule.chapter_id || '',
        transcript: existingModule.transcript || '',
      };
      setFormData(loadedFormData);
      setLastSaved(new Date(existingModule.updated_at));
      
      const loadedPrompts = existingPrompts.length > 0 
        ? existingPrompts.map(p => ({
            id: p.id,
            label: p.label,
            promptText: p.prompt_text,
          }))
        : [{ id: '1', label: '', promptText: '' }];
      
      setPrompts(loadedPrompts);
      
      // Set original snapshot after data loads
      setTimeout(() => {
        setOriginalData(JSON.stringify({ formData: loadedFormData, prompts: loadedPrompts }));
      }, 0);
    } else if (isNew) {
      // For new modules, set original data after initial render
      setTimeout(() => {
        setOriginalData(JSON.stringify({ formData, prompts }));
      }, 100);
    }
  }, [existingModule, existingPrompts]);
  
  // Warn on browser navigation (close tab, refresh)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);
  
  // Handle navigation with unsaved changes check
  const handleNavigateAway = (path: string) => {
    if (isDirty) {
      setPendingNavigation(path);
      setShowUnsavedDialog(true);
    } else {
      navigate(path);
    }
  };

  const confirmNavigation = () => {
    if (pendingNavigation) {
      navigate(pendingNavigation);
    }
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  };

  const cancelNavigation = () => {
    setShowUnsavedDialog(false);
    setPendingNavigation(null);
  };

  // Set default order number for new modules
  useEffect(() => {
    if (isNew && allModules.length > 0) {
      setFormData(prev => ({
        ...prev,
        orderNumber: allModules.length + 1
      }));
    }
  }, [isNew, allModules.length]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix validation errors before saving');
      return;
    }

    setIsSaving(true);

    try {
      const moduleData = {
        title: formData.title,
        order_number: formData.orderNumber,
        description: formData.description,
        video_url: formData.videoUrl,
        video_type: formData.videoType,
        system_prompt: formData.systemPrompt,
        status: formData.status,
        next_module_id: formData.nextModuleId === 'auto' ? null : formData.nextModuleId,
        chapter_id: formData.chapterId || null,
        transcript: formData.transcript,
      };

      let savedModuleId: string;

      if (isNew) {
        const newModule = await createModule(moduleData);
        savedModuleId = newModule.id;
      } else {
        await updateModule(moduleId!, moduleData);
        savedModuleId = moduleId!;
      }

      // Save prompts - delete existing and insert new
      await supabase.from('module_prompts').delete().eq('module_id', savedModuleId);
      
      const validPrompts = prompts.filter(p => p.label.trim() || p.promptText.trim());
      if (validPrompts.length > 0) {
        const inserts = validPrompts.map((p, idx) => ({
          module_id: savedModuleId,
          label: p.label,
          prompt_text: p.promptText,
          order_number: idx + 1,
        }));
        await supabase.from('module_prompts').insert(inserts);
      }

      setLastSaved(new Date());
      
      // Reset dirty state after successful save
      const newSnapshot = JSON.stringify({ formData, prompts });
      setOriginalData(newSnapshot);
      
      toast.success(isNew ? 'Module created!' : 'Module saved!');
      
      if (isNew) {
        navigate('/admin/modules?filter=draft');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to save module');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteModule(moduleId!);
      toast.success('Module deleted');
      navigate('/admin/modules');
    } catch (error) {
      toast.error('Failed to delete module');
    }
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
    ? allModules.find(m => m.order_number === formData.orderNumber + 1)
    : allModules.find(m => m.id === formData.nextModuleId);

  if (moduleLoading && !isNew) {
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

      <main className="container max-w-4xl py-8 md:py-12">
        {/* Top bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {isDirty ? (
            <button
              onClick={() => handleNavigateAway('/admin/modules')}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Modules
            </button>
          ) : (
            <Link
              to="/admin/modules"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Modules
            </Link>
          )}
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
          <div className="flex items-center gap-2 mb-2">
            {positionIndicator && (
              <span className="text-sm font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                {positionIndicator}
              </span>
            )}
            <h1 className="font-heading text-3xl font-bold text-foreground">
              {isNew ? 'Create New Module' : formData.title || 'Edit Module'}
            </h1>
            {isDirty && (
              <span className="text-xs text-orange-500 font-medium px-2 py-0.5 rounded-full bg-orange-500/10">
                Unsaved changes
              </span>
            )}
          </div>
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

              <div className="space-y-2">
                <Label htmlFor="chapter">Chapter</Label>
                <Select
                  value={formData.chapterId || 'none'}
                  onValueChange={(value) =>
                    setFormData({ ...formData, chapterId: value === 'none' ? '' : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a chapter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No chapter (unassigned)</SelectItem>
                    {chapters.map((chapter) => (
                      <SelectItem key={chapter.id} value={chapter.id}>
                        {chapter.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

              {/* Read Along Content */}
              <div className="space-y-2 pt-4 border-t border-border">
                <div>
                  <Label htmlFor="transcript">Read Along Content (Optional)</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Add text for users to read alongside the video. Paste from Google Docs to preserve formatting.
                  </p>
                </div>
                <RichTextEditor
                  content={formData.transcript}
                  onChange={(html) => setFormData({ ...formData, transcript: html })}
                  placeholder="Enter read-along text, transcript, or notes for this module..."
                />
              </div>
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
              <div className="flex justify-between text-xs">
                <CharacterCounter current={formData.systemPrompt.length} limit={CHAR_LIMITS.systemPrompt} />
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
                    {allModules
                      .filter(m => m.id !== moduleId)
                      .map(module => (
                        <SelectItem key={module.id} value={module.id}>
                          {module.order_number}. {module.title}
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
              {isDirty ? (
                <Button type="button" variant="outline" onClick={() => handleNavigateAway('/admin/modules')}>
                  Cancel
                </Button>
              ) : (
                <Link to="/admin/modules">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              )}
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

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to leave? 
              Your changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelNavigation}>
              Stay
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmNavigation}>
              Leave Without Saving
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ModuleEditor;
