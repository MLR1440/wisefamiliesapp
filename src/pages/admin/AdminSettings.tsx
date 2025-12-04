import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockAdminUser, mockSettings } from '@/data/mockData';
import { ArrowLeft, Save, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings = () => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [llmSettings, setLlmSettings] = useState({
    provider: mockSettings.llmProvider,
    apiKey: '',
    model: mockSettings.llmModel,
    temperature: mockSettings.llmTemperature,
  });

  const [siteSettings, setSiteSettings] = useState({
    courseTitle: mockSettings.courseTitle,
    coursePrice: mockSettings.coursePrice,
  });

  const modelOptions = {
    openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    openrouter: ['openai/gpt-4', 'anthropic/claude-3-opus', 'meta-llama/llama-3-70b'],
  };

  const handleSaveLLM = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('LLM settings saved!');
    }, 1000);
  };

  const handleSaveSite = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Site settings saved!');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn isAdmin hasPurchased userName={mockAdminUser.firstName} />

      <main className="container max-w-3xl py-8 md:py-12">
        {/* Back link */}
        <Link
          to="/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Admin
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 font-heading text-3xl font-bold text-foreground">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Configure your LLM provider and site settings
          </p>
        </div>

        <div className="space-y-8">
          {/* LLM Configuration */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 font-heading text-xl font-semibold text-foreground">
              LLM Configuration
            </h2>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="provider">Provider</Label>
                <Select
                  value={llmSettings.provider}
                  onValueChange={(value) =>
                    setLlmSettings({
                      ...llmSettings,
                      provider: value as 'openai' | 'anthropic' | 'openrouter',
                      model: modelOptions[value as keyof typeof modelOptions][0],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="anthropic">Anthropic</SelectItem>
                    <SelectItem value="openrouter">OpenRouter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? 'text' : 'password'}
                    value={llmSettings.apiKey}
                    onChange={(e) =>
                      setLlmSettings({ ...llmSettings, apiKey: e.target.value })
                    }
                    placeholder="sk-..."
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your API key is stored securely and never exposed to users
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Select
                  value={llmSettings.model}
                  onValueChange={(value) =>
                    setLlmSettings({ ...llmSettings, model: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {modelOptions[llmSettings.provider].map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Temperature</Label>
                  <span className="text-sm text-muted-foreground">
                    {llmSettings.temperature}
                  </span>
                </div>
                <Slider
                  value={[llmSettings.temperature]}
                  onValueChange={(value) =>
                    setLlmSettings({ ...llmSettings, temperature: value[0] })
                  }
                  min={0}
                  max={1}
                  step={0.1}
                />
                <p className="text-xs text-muted-foreground">
                  Lower values make responses more focused, higher values more creative
                </p>
              </div>

              <Button onClick={handleSaveLLM} disabled={isLoading} className="gap-2">
                <Save className="h-4 w-4" />
                Save LLM Settings
              </Button>
            </div>
          </div>

          {/* Site Settings */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 font-heading text-xl font-semibold text-foreground">
              Site Settings
            </h2>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="courseTitle">Course Title</Label>
                <Input
                  id="courseTitle"
                  value={siteSettings.courseTitle}
                  onChange={(e) =>
                    setSiteSettings({ ...siteSettings, courseTitle: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coursePrice">Course Price ($)</Label>
                <Input
                  id="coursePrice"
                  type="number"
                  min={0}
                  value={siteSettings.coursePrice}
                  onChange={(e) =>
                    setSiteSettings({
                      ...siteSettings,
                      coursePrice: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <Button onClick={handleSaveSite} disabled={isLoading} className="gap-2">
                <Save className="h-4 w-4" />
                Save Site Settings
              </Button>
            </div>
          </div>

          {/* Stripe Status */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 font-heading text-xl font-semibold text-foreground">
              Payment Integration
            </h2>
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">Stripe Connected</p>
                <p className="text-sm text-muted-foreground">
                  Ready to accept payments
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Stripe integration will be configured when you connect Supabase. Payments will automatically 
              grant course access upon successful checkout.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
