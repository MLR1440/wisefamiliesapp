import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Instagram, Facebook, Youtube } from 'lucide-react';
import wiseFamiliesLogo from '@/assets/wise-families-logo.jpg';

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z" />
  </svg>
);

const socialLinks = [
  { icon: TikTokIcon, href: 'https://www.tiktok.com/@wisefamilies', label: 'TikTok' },
  { icon: Instagram, href: 'https://www.instagram.com/wisefamilies.co/', label: 'Instagram' },
  { icon: Facebook, href: 'https://www.facebook.com/wisefamilies.co', label: 'Facebook' },
  { icon: Youtube, href: 'https://www.youtube.com/@WiseFamilies-ai', label: 'YouTube' },
];

const Footer = () => {
  const { user } = useAuth();
  const isLoggedIn = !!user;

  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="container py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
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

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-semibold text-foreground">Quick Links</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {isLoggedIn ? (
                <>
                  <li><Link to="/dashboard" className="transition-colors hover:text-primary">Dashboard</Link></li>
                  <li><Link to="/progress" className="transition-colors hover:text-primary">Progress</Link></li>
                  <li><Link to="/profile" className="transition-colors hover:text-primary">Settings</Link></li>
                </>
              ) : (
                <>
                  <li><Link to="/" className="transition-colors hover:text-primary">Home</Link></li>
                  <li><Link to="/login" className="transition-colors hover:text-primary">Login</Link></li>
                  <li><Link to="/#pricing" className="transition-colors hover:text-primary">Get Started</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-heading font-semibold text-foreground">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="https://wisefamilies.co/privacy-policy/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="https://wisefamilies.co/terms-of-use/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="https://wisefamilies.co/contact/" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-primary">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h4 className="font-heading font-semibold text-foreground">Follow Us</h4>
            <div className="mt-4 flex gap-3">
              {socialLinks.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-background border border-border text-muted-foreground transition-colors hover:text-primary hover:border-primary/30"
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
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
