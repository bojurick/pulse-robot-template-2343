import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Menu, X, Settings, Workflow, AlertCircle, Home } from "lucide-react";
import UserMenu from "./UserMenu";
import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { useAccessibility } from "@/hooks/useAccessibility";
import { validateLink } from "@/utils/linkValidation";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const { announceToScreenReader, screenReader } = useAccessibility();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: "Features", href: "#features" },
    { name: "Specs", href: "#specs" },
    { name: "Gallery", href: "#gallery" },
    { name: "About", href: "#about" },
  ];

  const handleNavigation = (path: string, label: string) => {
    const validation = validateLink(path);
    if (!validation.isValid) {
      announceToScreenReader(`${label} is not available yet`);
      return false;
    }
    announceToScreenReader(`Navigating to ${label}`);
    return true;
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/95 backdrop-blur-md shadow-elegant border-b border-primary/10' : 'bg-transparent'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Enhanced Logo with Home Link */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 group focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg p-1"
            aria-label="Pulse Robot homepage"
            onFocus={() => screenReader && announceToScreenReader("Pulse Robot logo, link to homepage")}
          >
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center text-white font-bold text-sm lg:text-base group-hover:scale-105 transition-transform">
              P
            </div>
            <span className="text-lg lg:text-xl font-display font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Pulse Robot
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8" role="menubar">
            {user ? (
              <>
                <Link
                  to="/"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 font-medium interactive-element ${
                    location.pathname === '/'
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-foreground hover:text-primary hover:bg-primary/5'
                  }`}
                  role="menuitem"
                  aria-current={location.pathname === '/' ? 'page' : undefined}
                >
                  <Home className="h-4 w-4" aria-hidden="true" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/workflows"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 font-medium interactive-element ${
                    location.pathname === '/workflows'
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-foreground hover:text-primary hover:bg-primary/5'
                  }`}
                  role="menuitem"
                  aria-current={location.pathname === '/workflows' ? 'page' : undefined}
                  onClick={(e) => !handleNavigation('/workflows', 'Workflows') && e.preventDefault()}
                >
                  <Workflow className="h-4 w-4" aria-hidden="true" />
                  <span>Workflows</span>
                </Link>
                <Link
                  to="/settings"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 font-medium interactive-element ${
                    location.pathname === '/settings'
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-foreground hover:text-primary hover:bg-primary/5'
                  }`}
                  role="menuitem"
                  aria-current={location.pathname === '/settings' ? 'page' : undefined}
                  onClick={(e) => !handleNavigation('/settings', 'Settings') && e.preventDefault()}
                >
                  <Settings className="h-4 w-4" aria-hidden="true" />
                  <span>Settings</span>
                </Link>
              </>
            ) : (
              <>
                {navItems.map((item) => {
                  const validation = validateLink(item.href);
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        if (validation.isValid) {
                          const element = document.querySelector(item.href);
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                          }
                        } else {
                          announceToScreenReader(`${item.name} section is not available yet`);
                        }
                      }}
                      className={`text-foreground hover:text-primary transition-colors duration-200 font-medium interactive-element px-3 py-2 rounded-lg ${
                        !validation.isValid ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary/5'
                      }`}
                      role="menuitem"
                      onFocus={() => screenReader && announceToScreenReader(`${item.name} navigation link`)}
                      disabled={!validation.isValid}
                      title={!validation.isValid ? 'Coming soon' : undefined}
                    >
                      {item.name}
                      {!validation.isValid && (
                        <AlertCircle className="inline ml-1 h-3 w-3" aria-label="Coming soon" />
                      )}
                    </button>
                  );
                })}
              </>
            )}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <UserMenu />
            ) : (
              <Button 
                className="bg-primary hover:bg-primary/90 text-primary-foreground interactive-element"
                onClick={() => {
                  if (handleNavigation('/login', 'Sign in')) {
                    window.location.href = '/login';
                  }
                }}
                aria-label="Sign in to your account"
              >
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            {user && <UserMenu />}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsOpen(!isOpen);
                announceToScreenReader(`Mobile menu ${!isOpen ? 'opened' : 'closed'}`);
              }}
              className="p-2 interactive-element"
              aria-label={`${isOpen ? 'Close' : 'Open'} mobile menu`}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              {isOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div 
            id="mobile-menu"
            className="md:hidden bg-white/95 backdrop-blur-md border-t border-primary/10 py-4 space-y-2 animate-fade-in"
            role="menu"
            aria-label="Mobile navigation menu"
          >
            {user ? (
              <>
                <Link
                  to="/workflows"
                  className={`flex items-center space-x-2 px-4 py-2 text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 interactive-element ${
                    location.pathname === '/workflows' ? 'bg-primary/10 text-primary' : ''
                  }`}
                  role="menuitem"
                  onClick={(e) => {
                    if (handleNavigation('/workflows', 'Workflows')) {
                      setIsOpen(false);
                    } else {
                      e.preventDefault();
                    }
                  }}
                >
                  <Workflow className="h-4 w-4" aria-hidden="true" />
                  <span>Workflows</span>
                </Link>
                <Link
                  to="/settings"
                  className={`flex items-center space-x-2 px-4 py-2 text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 interactive-element ${
                    location.pathname === '/settings' ? 'bg-primary/10 text-primary' : ''
                  }`}
                  role="menuitem"
                  onClick={(e) => {
                    if (handleNavigation('/settings', 'Settings')) {
                      setIsOpen(false);
                    } else {
                      e.preventDefault();
                    }
                  }}
                >
                  <Settings className="h-4 w-4" aria-hidden="true" />
                  <span>Settings</span>
                </Link>
              </>
            ) : (
              <>
                {navItems.map((item) => {
                  const validation = validateLink(item.href);
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className={`block px-4 py-2 text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all duration-200 interactive-element ${
                        !validation.isValid ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      role="menuitem"
                      onClick={(e) => {
                        if (!validation.isValid) {
                          e.preventDefault();
                          announceToScreenReader(`${item.name} section is not available yet`);
                        } else {
                          setIsOpen(false);
                        }
                      }}
                    >
                      {item.name}
                      {!validation.isValid && (
                        <AlertCircle className="inline ml-1 h-3 w-3" aria-label="Not available" />
                      )}
                    </a>
                  );
                })}
                <div className="px-4 pt-2">
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground interactive-element"
                    onClick={() => {
                      if (handleNavigation('/login', 'Sign in')) {
                        window.location.href = '/login';
                      }
                    }}
                    aria-label="Sign in to your account"
                  >
                    Sign In
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
