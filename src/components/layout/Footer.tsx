import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import wiseFamiliesLogo from '@/assets/wise-families-logo.jpg';

const Footer = () => {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to={isLoggedIn ? "/dashboard" : "/"} className="flex items-center gap-2">
              <img 
                src={wiseFamiliesLogo} 
                alt="WiseFamilies" 
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="font-heading text-xl font-semibold text-foreground">WiseFamilies</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Empowering parents to raise children who are wiser than the AI they use. 
              The A.I - Ready Family Framework for the modern family.
            </p>
          </div>

          {/* Quick Links - Dynamic based on login state */}
          <div>
            <h4 className="font-heading font-semibold text-foreground">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {isLoggedIn ? (
                <>
                  <li>
                    <Link to="/dashboard" className="transition-colors hover:text-primary">
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/progress" className="transition-colors hover:text-primary">
                      Progress
                    </Link>
                  </li>
                  <li>
                    <Link to="/profile" className="transition-colors hover:text-primary">
                      Settings
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/" className="transition-colors hover:text-primary">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link to="/login" className="transition-colors hover:text-primary">
                      Login
                    </Link>
                  </li>
                  <li>
                    <Link to="/#pricing" className="transition-colors hover:text-primary">
                      Get Started
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading font-semibold text-foreground">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <a 
                  href="https://wisefamilies.co/privacy-policy/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-primary"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a 
                  href="https://wisefamilies.co/terms-of-use/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-primary"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a 
                  href="https://wisefamilies.co/contact/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-primary"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} WiseFamilies. All rights reserved.</p>
          <p className="mt-1">Perth, Australia</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
