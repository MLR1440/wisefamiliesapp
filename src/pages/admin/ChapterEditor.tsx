import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Save, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useChapters, useChapter } from '@/hooks/useChapters';

const ChapterEditor = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { chapters, createChapter, updateChapter, deleteChapter } = useChapters();
  const { chapter, loading: loadingChapter } = useChapter(chapterId);

  const isNew = chapterId === 'new';
  const userName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Admin';

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'draft' as 'draft' | 'published',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (chapter && !isNew) {
      setFormData({
        title: chapter.title,
        description: chapter.description || '',
        status: chapter.status as 'draft' | 'published',
      });
    }
  }, [chapter, isNew]);

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a chapter title');
      return;
    }

    setSaving(true);
    try {
      if (isNew) {
        const maxOrder = chapters.length > 0 
          ? Math.max(...chapters.map(c => c.order_number)) 
          : 0;
        
        await createChapter({
          title: formData.title,
          description: formData.description,
          status: formData.status,
          order_number: maxOrder + 1,
        });
        toast.success('Chapter created');
      } else {
        await updateChapter(chapterId!, {
          title: formData.title,
          description: formData.description,
          status: formData.status,
        });
        toast.success('Chapter updated');
      }
      navigate('/admin/modules');
    } catch (error) {
      toast.error('Failed to save chapter');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteChapter(chapterId!);
      toast.success('Chapter deleted');
      navigate('/admin/modules');
    } catch (error) {
      toast.error('Failed to delete chapter');
    }
  };

  if (loadingChapter && !isNew) {
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
          to="/admin/modules"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Modules
        </Link>

        <div className="mb-6 flex items-center justify-between">
          <h1 className="font-heading text-3xl font-bold text-foreground">
            {isNew ? 'New Chapter' : 'Edit Chapter'}
          </h1>
          <div className="flex items-center gap-2">
            {!isNew && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Chapter</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this chapter? Modules in this chapter will become unassigned.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Chapter
            </Button>
          </div>
        </div>

        <div className="max-w-2xl space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Chapter Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter chapter title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this chapter"
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <Label htmlFor="status">Published</Label>
              <p className="text-sm text-muted-foreground">
                Make this chapter visible to students
              </p>
            </div>
            <Switch
              id="status"
              checked={formData.status === 'published'}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, status: checked ? 'published' : 'draft' })
              }
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChapterEditor;
