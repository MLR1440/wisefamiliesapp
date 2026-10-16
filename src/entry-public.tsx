import { renderToString } from 'react-dom/server';
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { TooltipProvider } from '@/components/ui/tooltip';
import Index from '@/pages/Index';

// Build only the public offer. Account, admin and course routes are never rendered here.
// Effects and query functions do not run during this render, so no user data is fetched.
export function renderPublicPage() {
  const helmetContext = {} as { helmet: HelmetServerState };
  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={new QueryClient()}>
        <AuthProvider>
          <TooltipProvider>
            <MemoryRouter initialEntries={['/']}>
              <Index />
            </MemoryRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>,
  );
  const { helmet } = helmetContext;
  return {
    html,
    head: [helmet.title, helmet.meta, helmet.link, helmet.script].map(part => part.toString()).join('\n'),
  };
}
