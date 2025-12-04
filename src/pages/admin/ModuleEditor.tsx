import { useState } from 'react';
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
import { mockAdminUser, mockModules, mockModulePrompts } from '@/data/mockData';
import { ArrowLeft, Plus, Trash2, Save, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

interface PromptField {
  id: string;
  label: string;
  promptText: string;
}

const ModuleEditor = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const isNew = moduleId === 'new';
  
  const existingModule = mockModules.find((m) => m.id === moduleId);
  const existingPrompts = mockModulePrompts.filter((p) => p.moduleId === moduleId);

  const [formData, setFormData] = useState({
    title: existingModule?.title || '',
    orderNumber: existingModule?.orderNumber || mockModules.length + 1,
    description: existingModule?.description || '',
    videoUrl: existingModule?.videoUrl || '',
    videoType: existingModule?.videoType || 'youtube',
    systemPrompt: existingModule?.systemPrompt || '',
    status: existingModule?.status || 'draft',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate save - in production this would save to Supabase
    setTimeout(() => {
      setIsLoading(false);
      toast.success(isNew ? 'Module created!' : 'Module updated!');
      navigate('/admin/modules');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn isAdmin hasPurchased userName={mockAdminUser.firstName} />

      <main className="container max-w-3xl py-8 md:py-12">
        {/* Back link */}
        <Link
          to="/admin/modules"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Modules
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 font-heading text-3xl font-bold text-foreground">
            {isNew ? 'Create New Module' : 'Edit Module'}
          </h1>
          <p className="text-muted-foreground">
            {isNew
              ? 'Add a new module to your course'
              : 'Update the module content and settings'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic info */}
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
                    required
                  />
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
                        orderNumber: parseInt(e.target.value),
                      })
                    }
                    required
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
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value as 'draft' | 'published' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Video settings */}
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
                      videoType: value as 'youtube' | 'vimeo' | 'direct',
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="vimeo">Vimeo</SelectItem>
                    <SelectItem value="direct">Direct URL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, videoUrl: e.target.value })
                  }
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
            </div>
          </div>

          {/* Starter prompts */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-heading font-semibold text-foreground">
                  Starter Prompts
                </h2>
                <p className="text-sm text-muted-foreground">
                  Add 1-4 prompts that students can click to start conversations
                </p>
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

            <div className="space-y-4">
              {prompts.map((prompt, index) => (
                <div
                  key={prompt.id}
                  className="flex gap-3 rounded-lg border border-border bg-muted/30 p-4"
                >
                  <div className="text-muted-foreground">
                    <GripVertical className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="space-y-2">
                      <Label>Button Label</Label>
                      <Input
                        value={prompt.label}
                        onChange={(e) =>
                          handlePromptChange(prompt.id, 'label', e.target.value)
                        }
                        placeholder="What students see on the button"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Prompt Text</Label>
                      <Textarea
                        value={prompt.promptText}
                        onChange={(e) =>
                          handlePromptChange(prompt.id, 'promptText', e.target.value)
                        }
                        placeholder="The full prompt sent to the LLM"
                        rows={2}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemovePrompt(prompt.id)}
                    disabled={prompts.length <= 1}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* System prompt */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 font-heading font-semibold text-foreground">
              AI System Prompt
            </h2>
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">Instructions for the AI</Label>
              <Textarea
                id="systemPrompt"
                value={formData.systemPrompt}
                onChange={(e) =>
                  setFormData({ ...formData, systemPrompt: e.target.value })
                }
                placeholder="Provide context and instructions for how the AI should respond in this module's chat..."
                rows={5}
              />
              <p className="text-xs text-muted-foreground">
                This prompt is sent to the LLM to set the context for conversations in this module.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Link to="/admin/modules">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" variant="cta" disabled={isLoading}>
              <Save className="mr-2 h-4 w-4" />
              {isLoading ? 'Saving...' : isNew ? 'Create Module' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default ModuleEditor;
