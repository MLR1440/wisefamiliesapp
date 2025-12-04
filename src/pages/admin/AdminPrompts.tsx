import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { mockAdminUser } from '@/data/mockData';
import { ArrowLeft, Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface PromptTemplate {
  id: string;
  label: string;
  promptText: string;
  category: string;
}

const mockPromptLibrary: PromptTemplate[] = [
  { id: '1', label: 'Age-appropriate explanation', promptText: 'Explain this concept in a way suitable for a {age}-year-old child...', category: 'Explanation' },
  { id: '2', label: 'Activity suggestion', promptText: 'Suggest a hands-on activity that helps teach {concept} to my child...', category: 'Activities' },
  { id: '3', label: 'Conversation starter', promptText: 'How can I start a conversation with my child about {topic}?', category: 'Communication' },
  { id: '4', label: 'Boundary setting', promptText: 'Help me create age-appropriate boundaries for {situation}...', category: 'Boundaries' },
  { id: '5', label: 'Critical thinking exercise', promptText: 'Design a critical thinking exercise about {topic} for my {age}-year-old...', category: 'Activities' },
];

const AdminPrompts = () => {
  const [prompts, setPrompts] = useState(mockPromptLibrary);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptTemplate | null>(null);
  const [formData, setFormData] = useState({
    label: '',
    promptText: '',
    category: '',
  });

  const filteredPrompts = prompts.filter(
    (p) =>
      p.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = [...new Set(prompts.map((p) => p.category))];

  const handleOpenDialog = (prompt?: PromptTemplate) => {
    if (prompt) {
      setEditingPrompt(prompt);
      setFormData({
        label: prompt.label,
        promptText: prompt.promptText,
        category: prompt.category,
      });
    } else {
      setEditingPrompt(null);
      setFormData({ label: '', promptText: '', category: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.label || !formData.promptText || !formData.category) {
      toast.error('Please fill in all fields');
      return;
    }

    if (editingPrompt) {
      setPrompts(
        prompts.map((p) =>
          p.id === editingPrompt.id ? { ...p, ...formData } : p
        )
      );
      toast.success('Prompt updated!');
    } else {
      setPrompts([
        ...prompts,
        { id: Date.now().toString(), ...formData },
      ]);
      toast.success('Prompt created!');
    }
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setPrompts(prompts.filter((p) => p.id !== id));
    toast.success('Prompt deleted!');
  };

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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 font-heading text-3xl font-bold text-foreground">
              Prompt Library
            </h1>
            <p className="text-muted-foreground">
              Reusable prompt templates you can use across modules
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="cta" className="gap-2" onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4" />
                Add Prompt
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingPrompt ? 'Edit Prompt' : 'Create New Prompt'}
                </DialogTitle>
                <DialogDescription>
                  Create a reusable prompt template for your modules.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) =>
                      setFormData({ ...formData, label: e.target.value })
                    }
                    placeholder="e.g., Age-appropriate explanation"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    placeholder="e.g., Explanation, Activities, Communication"
                    list="categories"
                  />
                  <datalist id="categories">
                    {categories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="promptText">Prompt Text</Label>
                  <Textarea
                    id="promptText"
                    value={formData.promptText}
                    onChange={(e) =>
                      setFormData({ ...formData, promptText: e.target.value })
                    }
                    placeholder="Use {placeholders} for dynamic values..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="cta" onClick={handleSave}>
                  {editingPrompt ? 'Save Changes' : 'Create Prompt'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search prompts..."
            className="pl-10"
          />
        </div>

        {/* Prompts grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="group rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-soft"
            >
              <div className="mb-3 flex items-start justify-between">
                <Badge variant="secondary">{prompt.category}</Badge>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenDialog(prompt)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(prompt.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <h3 className="mb-2 font-heading font-semibold text-foreground">
                {prompt.label}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-3">
                {prompt.promptText}
              </p>
            </div>
          ))}
        </div>

        {filteredPrompts.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <p className="text-muted-foreground">
              {searchQuery ? 'No prompts match your search' : 'No prompts yet'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPrompts;
