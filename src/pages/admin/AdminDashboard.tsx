import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { mockAdminUser, mockStats, mockModules } from '@/data/mockData';
import { Users, Activity, Award, BookOpen, Settings, FileText, ArrowRight } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar isLoggedIn isAdmin hasPurchased userName={mockAdminUser.firstName} />

      <main className="container py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 font-heading text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your course content and view analytics
            </p>
          </div>
        </div>

        {/* Stats grid */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{mockStats.totalStudents}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Today</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{mockStats.activeToday}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
                <Activity className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Course Completions</p>
                <p className="mt-1 text-3xl font-bold text-foreground">{mockStats.courseCompletions}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Award className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="mb-8">
          <h2 className="mb-4 font-heading text-xl font-semibold text-foreground">
            Quick Actions
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/admin/modules">
              <Button variant="outline" className="h-auto w-full flex-col gap-2 p-6">
                <BookOpen className="h-8 w-8 text-primary" />
                <span className="font-semibold">Manage Modules</span>
                <span className="text-xs text-muted-foreground">{mockModules.length} modules</span>
              </Button>
            </Link>

            <Link to="/admin/prompts">
              <Button variant="outline" className="h-auto w-full flex-col gap-2 p-6">
                <FileText className="h-8 w-8 text-secondary" />
                <span className="font-semibold">Prompt Library</span>
                <span className="text-xs text-muted-foreground">Manage templates</span>
              </Button>
            </Link>

            <Link to="/admin/settings">
              <Button variant="outline" className="h-auto w-full flex-col gap-2 p-6">
                <Settings className="h-8 w-8 text-accent" />
                <span className="font-semibold">Settings</span>
                <span className="text-xs text-muted-foreground">LLM & Site config</span>
              </Button>
            </Link>

            <Link to="/admin/modules/new">
              <Button variant="cta" className="h-auto w-full flex-col gap-2 p-6">
                <BookOpen className="h-8 w-8" />
                <span className="font-semibold">Add New Module</span>
                <span className="text-xs opacity-80">Create content</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Recent signups */}
        <div>
          <h2 className="mb-4 font-heading text-xl font-semibold text-foreground">
            Recent Signups
          </h2>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="divide-y divide-border">
              {mockStats.recentSignups.map((signup, index) => (
                <div key={index} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {signup.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{signup.name}</p>
                      <p className="text-sm text-muted-foreground">{signup.email}</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {signup.date.toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
