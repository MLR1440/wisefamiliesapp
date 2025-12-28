import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, LogOut, Shield } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import wiseFamiliesLogo from '@/assets/wise-families-logo.jpg';

interface NavbarProps {
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  hasPurchased?: boolean;
  userName?: string;
}

const Navbar = ({ isLoggedIn = false, isAdmin = false, hasPurchased = false, userName }: NavbarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await signOut();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo */}
        <Link to={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2">
          <img 
            src={wiseFamiliesLogo} 
            alt="WiseFamilies" 
            className="h-8 w-8 rounded-full object-cover"
          />
          <span className="font-heading text-lg font-semibold text-foreground">WiseFamilies</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {isLoggedIn && hasPurchased && (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className={isActive('/dashboard') ? 'text-foreground' : 'text-muted-foreground'}>
                  Dashboard
                </Button>
              </Link>
              <Link to="/progress">
                <Button variant="ghost" size="sm" className={isActive('/progress') ? 'text-foreground' : 'text-muted-foreground'}>
                  Progress
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Right side */}
        <div className="hidden items-center gap-2 md:flex">
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    Admin
                  </Button>
                </Link>
              )}
              <span className="text-sm text-muted-foreground px-2">{userName}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-1.5 text-muted-foreground"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-border bg-background p-4 md:hidden">
          <div className="flex flex-col gap-1">
            {isLoggedIn && hasPurchased && (
              <>
                <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Dashboard
                  </Button>
                </Link>
                <Link to="/progress" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Progress
                  </Button>
                </Link>
              </>
            )}
            {isLoggedIn && isAdmin && (
              <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}
            <div className="my-2 border-t border-border" />
            {isLoggedIn ? (
              <>
                <p className="px-4 py-2 text-sm text-muted-foreground">{userName}</p>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-2 text-muted-foreground"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Login
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button className="w-full">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
