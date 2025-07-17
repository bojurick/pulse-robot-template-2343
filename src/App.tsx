
import React, { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { MobileBottomNav } from "@/components/navigation/MobileBottomNav";
import { useAccessibility } from "@/hooks/useAccessibility";
import { usePerformance } from "@/hooks/usePerformance";
import { preventEmptyLinkNavigation } from "@/utils/linkValidation";
import { LazyWrapper, createLazyRoute } from "@/components/LazyWrapper";
import Index from "./pages/Index";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy load heavy components
const ChatPage = createLazyRoute(() => import("./pages/ChatPage"));
const TasksPage = createLazyRoute(() => import("./pages/TasksPage"));
const AnalyticsPage = createLazyRoute(() => import("./pages/AnalyticsPage"));
const LoginPage = createLazyRoute(() => import("./pages/LoginPage"));
const SettingsPage = createLazyRoute(() => import("./pages/SettingsPage"));
const WorkflowHub = createLazyRoute(() => import("./pages/WorkflowHub"));
const NotFound = createLazyRoute(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        if (error instanceof Error && error.message.includes('offline')) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

const App = () => {
  const { announceToScreenReader } = useAccessibility();
  const { metrics } = usePerformance();

  useEffect(() => {
    // Initialize accessibility features
    preventEmptyLinkNavigation();
    
    // Announce app load to screen readers
    announceToScreenReader("Pulse Robot application loaded successfully");

    // Performance monitoring
    if (metrics.loadTime > 3000) {
      console.warn('Slow page load detected:', metrics.loadTime, 'ms');
    }

    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }

    // Check for high contrast preference
    if (window.matchMedia('(prefers-contrast: high)').matches) {
      document.documentElement.classList.add('high-contrast');
    }
  }, [announceToScreenReader, metrics.loadTime]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            {/* Skip to main content link for accessibility */}
            <a 
              href="#main-content" 
              className="skip-link"
              onFocus={(e) => announceToScreenReader("Skip to main content link focused")}
            >
              Skip to main content
            </a>

            {/* Global theme switcher */}
            <div className="fixed top-4 right-4 z-50 no-print">
              <ThemeSwitcher />
            </div>

            {/* Offline indicator */}
            {metrics.networkStatus === 'offline' && (
              <div 
                className="fixed top-0 left-0 right-0 bg-warning text-warning-foreground text-center py-2 z-40"
                role="alert"
                aria-live="assertive"
              >
                You are currently offline. Some features may be limited.
              </div>
            )}

            <main id="main-content" className="min-h-screen">
              <Routes>
                <Route path="/login" element={
                  <LazyWrapper>
                    <LoginPage />
                  </LazyWrapper>
                } />
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Index />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/chat" 
                  element={
                    <ProtectedRoute>
                      <LazyWrapper>
                        <ChatPage />
                      </LazyWrapper>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/tasks" 
                  element={
                    <ProtectedRoute>
                      <LazyWrapper>
                        <TasksPage />
                      </LazyWrapper>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/analytics" 
                  element={
                    <ProtectedRoute>
                      <LazyWrapper>
                        <AnalyticsPage />
                      </LazyWrapper>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/workflows" 
                  element={
                    <ProtectedRoute>
                      <LazyWrapper>
                        <WorkflowHub />
                      </LazyWrapper>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/settings" 
                  element={
                    <ProtectedRoute>
                      <LazyWrapper>
                        <SettingsPage />
                      </LazyWrapper>
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={
                  <LazyWrapper>
                    <NotFound />
                  </LazyWrapper>
                } />
              </Routes>
              
              {/* Mobile Bottom Navigation */}
              <MobileBottomNav />
            </main>
            
            <Toaster />
            <Sonner />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
