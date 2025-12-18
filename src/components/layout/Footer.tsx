import { Link } from 'react-router-dom';
import wiseFamiliesLogo from '@/assets/wise-families-logo.jpg';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
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

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-foreground">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
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
                <Link to="/signup" className="transition-colors hover:text-primary">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading font-semibold text-foreground">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/privacy" className="transition-colors hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="transition-colors hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/contact" className="transition-colors hover:text-primary">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} WiseFamilies. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
