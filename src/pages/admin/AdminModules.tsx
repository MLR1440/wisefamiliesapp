import { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockAdminUser, mockModules } from '@/data/mockData';
import { Plus, Edit, GripVertical, Eye, ArrowLeft } from 'lucide-react';

const AdminModules = () => {
  const [modules, setModules] = useState(mockModules);

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
              Manage Modules
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

        {/* Modules list */}
        <div className="space-y-3">
          {modules.map((module, index) => (
            <div
              key={module.id}
              className="group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-soft"
            >
              {/* Drag handle */}
              <div className="cursor-grab text-muted-foreground hover:text-foreground">
                <GripVertical className="h-5 w-5" />
              </div>

              {/* Order number */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 font-heading font-semibold text-primary">
                {index + 1}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
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

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <Link to={`/course/${module.id}`}>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to={`/admin/modules/${module.id}`}>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {modules.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16">
            <p className="mb-4 text-muted-foreground">No modules yet</p>
            <Link to="/admin/modules/new">
              <Button variant="cta" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Your First Module
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminModules;
