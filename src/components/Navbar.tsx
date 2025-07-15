
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Menu, X, Settings, Workflow } from "lucide-react";
import UserMenu from "./UserMenu";
import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

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

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-elegant' : 'bg-transparent'
    }`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-pulse-500 to-pulse-600 rounded-lg flex items-center justify-center text-white font-bold text-sm lg:text-base">
              P
            </div>
            <span className="text-lg lg:text-xl font-display font-bold text-gray-900">
              Pulse Robot
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {user ? (
              <>
                <Link
                  to="/workflows"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors duration-200 font-medium ${
                    location.pathname === '/workflows'
                      ? 'bg-pulse-100 text-pulse-700'
                      : 'text-gray-700 hover:text-pulse-600 hover:bg-pulse-50'
                  }`}
                >
                  <Workflow className="h-4 w-4" />
                  <span>Workflows</span>
                </Link>
                <Link
                  to="/settings"
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors duration-200 font-medium ${
                    location.pathname === '/settings'
                      ? 'bg-pulse-100 text-pulse-700'
                      : 'text-gray-700 hover:text-pulse-600 hover:bg-pulse-50'
                  }`}
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </>
            ) : (
              <>
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:text-pulse-600 transition-colors duration-200 font-medium"
                  >
                    {item.name}
                  </a>
                ))}
              </>
            )}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <UserMenu />
            ) : (
              <Button 
                className="bg-pulse-500 hover:bg-pulse-600 text-white"
                onClick={() => window.location.href = '/login'}
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
              onClick={() => setIsOpen(!isOpen)}
              className="p-2"
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 py-4 space-y-2 animate-fade-in">
            {user ? (
              <>
                <Link
                  to="/workflows"
                  className={`flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-pulse-600 hover:bg-pulse-50 rounded-lg transition-colors duration-200 ${
                    location.pathname === '/workflows' ? 'bg-pulse-100 text-pulse-700' : ''
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Workflow className="h-4 w-4" />
                  <span>Workflows</span>
                </Link>
                <Link
                  to="/settings"
                  className={`flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-pulse-600 hover:bg-pulse-50 rounded-lg transition-colors duration-200 ${
                    location.pathname === '/settings' ? 'bg-pulse-100 text-pulse-700' : ''
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </>
            ) : (
              <>
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="block px-4 py-2 text-gray-700 hover:text-pulse-600 hover:bg-pulse-50 rounded-lg transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                <div className="px-4 pt-2">
                  <Button 
                    className="w-full bg-pulse-500 hover:bg-pulse-600 text-white"
                    onClick={() => window.location.href = '/login'}
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
