import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockAdminUser, mockSettings } from '@/data/mockData';
import { ArrowLeft, Save, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

const AdminSettings = () => {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [llmSettings, setLlmSettings] = useState({
    provider: mockSettings.llmProvider,
    apiKey: '',
    model: mockSettings.llmModel,
    temperature: mockSettings.llmTemperature,
    maxTokens: mockSettings.llmMaxTokens,
  });

  const [defaultPrompt, setDefaultPrompt] = useState(mockSettings.defaultSystemPrompt);

  const [courseSettings, setCourseSettings] = useState({
    title: mockSettings.courseTitle,
    description: mockSettings.courseDescription,
    price: mockSettings.coursePrice,
  });

  const [brandingSettings, setBrandingSettings] = useState({
    primaryColor: '#0d9488',
    secondaryColor: '#f97316',
    logo: null as string | null,
  });

  const modelOptions = {
    anthropic: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    openrouter: ['anthropic/claude-sonnet-4-20250514', 'openai/gpt-4o', 'meta-llama/llama-3.1-70b-instruct'],
  };

  const handleTestConnection = async () => {
    if (!llmSettings.apiKey) {
      toast.error('Please enter an API key first');
      return;
    }
    
    setIsTestingConnection(true);
    setConnectionStatus('idle');
    
    // Simulate API test
    setTimeout(() => {
      setIsTestingConnection(false);
      // For demo, randomly succeed/fail
      const success = Math.random() > 0.3;
      if (success) {
        setConnectionStatus('success');
        toast.success('Connection successful!');
      } else {
        setConnectionStatus('error');
        toast.error('Connection failed. Please check your API key.');
      }
    }, 2000);
  };

  const handleSaveLLM = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('LLM settings saved!');
    }, 1000);
  };

  const handleSavePrompt = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Default prompt saved!');
    }, 1000);
  };

  const handleSaveCourse = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Course settings saved!');
    }, 1000);
  };

  const handleSaveBranding = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Branding settings saved!');
    }, 1000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBrandingSettings({ ...brandingSettings, logo: event.target?.result as string });
        toast.success('Logo uploaded!');
      };
      reader.readAsDataURL(file);
    }
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
            Configure your LLM provider, default prompts, and site settings
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
                    <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                    <SelectItem value="openai">OpenAI (GPT)</SelectItem>
                    <SelectItem value="openrouter">OpenRouter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="apiKey"
                      type={showApiKey ? 'text' : 'password'}
                      value={llmSettings.apiKey}
                      onChange={(e) =>
                        setLlmSettings({ ...llmSettings, apiKey: e.target.value })
                      }
                      placeholder={llmSettings.provider === 'anthropic' ? 'sk-ant-...' : 'sk-...'}
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
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleTestConnection}
                    disabled={isTestingConnection || !llmSettings.apiKey}
                    className="gap-2"
                  >
                    {isTestingConnection ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : connectionStatus === 'success' ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : connectionStatus === 'error' ? (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    ) : null}
                    Test
                  </Button>
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
                    {llmSettings.temperature.toFixed(1)}
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

              <div className="space-y-2">
                <Label htmlFor="maxTokens">Max Tokens</Label>
                <Input
                  id="maxTokens"
                  type="number"
                  min={256}
                  max={4096}
                  value={llmSettings.maxTokens}
                  onChange={(e) =>
                    setLlmSettings({ ...llmSettings, maxTokens: parseInt(e.target.value) || 1024 })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Maximum length of AI responses (256-4096)
                </p>
              </div>

              <Button onClick={handleSaveLLM} disabled={isLoading} className="gap-2">
                <Save className="h-4 w-4" />
                Save LLM Settings
              </Button>
            </div>
          </div>

          {/* Default System Prompt */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 font-heading text-xl font-semibold text-foreground">
              Default System Prompt
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="defaultPrompt">Default prompt for new modules</Label>
                <Textarea
                  id="defaultPrompt"
                  value={defaultPrompt}
                  onChange={(e) => setDefaultPrompt(e.target.value)}
                  placeholder="You are a helpful parenting coach..."
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  This prompt will be used as the starting point when creating new modules
                </p>
              </div>

              <Button onClick={handleSavePrompt} disabled={isLoading} className="gap-2">
                <Save className="h-4 w-4" />
                Save Default Prompt
              </Button>
            </div>
          </div>

          {/* Course Settings */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 font-heading text-xl font-semibold text-foreground">
              Course Settings
            </h2>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="courseTitle">Course Title</Label>
                <Input
                  id="courseTitle"
                  value={courseSettings.title}
                  onChange={(e) =>
                    setCourseSettings({ ...courseSettings, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseDescription">Course Description</Label>
                <Textarea
                  id="courseDescription"
                  value={courseSettings.description}
                  onChange={(e) =>
                    setCourseSettings({ ...courseSettings, description: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coursePrice">Course Price ($)</Label>
                <Input
                  id="coursePrice"
                  type="number"
                  min={0}
                  value={courseSettings.price}
                  onChange={(e) =>
                    setCourseSettings({
                      ...courseSettings,
                      price: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <Button onClick={handleSaveCourse} disabled={isLoading} className="gap-2">
                <Save className="h-4 w-4" />
                Save Course Settings
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
                <p className="font-medium text-foreground">Stripe Ready</p>
                <p className="text-sm text-muted-foreground">
                  Connect Supabase to enable payments
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Stripe integration will be configured when you connect Supabase. Payments will automatically 
              grant course access upon successful checkout.
            </p>
          </div>

          {/* Branding */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 font-heading text-xl font-semibold text-foreground">
              Branding
            </h2>
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  {brandingSettings.logo ? (
                    <img 
                      src={brandingSettings.logo} 
                      alt="Logo preview" 
                      className="h-16 w-16 rounded-lg object-contain bg-muted"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <Upload className="h-6 w-6" />
                    </div>
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="max-w-xs"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Recommended: 512x512px PNG or SVG
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={brandingSettings.primaryColor}
                      onChange={(e) =>
                        setBrandingSettings({ ...brandingSettings, primaryColor: e.target.value })
                      }
                      className="h-10 w-16 cursor-pointer p-1"
                    />
                    <Input
                      value={brandingSettings.primaryColor}
                      onChange={(e) =>
                        setBrandingSettings({ ...brandingSettings, primaryColor: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="secondaryColor"
                      type="color"
                      value={brandingSettings.secondaryColor}
                      onChange={(e) =>
                        setBrandingSettings({ ...brandingSettings, secondaryColor: e.target.value })
                      }
                      className="h-10 w-16 cursor-pointer p-1"
                    />
                    <Input
                      value={brandingSettings.secondaryColor}
                      onChange={(e) =>
                        setBrandingSettings({ ...brandingSettings, secondaryColor: e.target.value })
                      }
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={handleSaveBranding} disabled={isLoading} className="gap-2">
                <Save className="h-4 w-4" />
                Save Branding
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminSettings;
