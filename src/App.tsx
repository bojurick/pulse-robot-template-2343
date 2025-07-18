
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
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppLayout } from "@/components/layout/AppLayout";
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
            <SidebarProvider>
              {/* Skip to main content link for accessibility */}
              <a 
                href="#main-content" 
                className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md"
                onFocus={(e) => announceToScreenReader("Skip to main content link focused")}
              >
                Skip to main content
              </a>

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

              <div className="flex min-h-screen w-full">
                <Routes>
                  <Route path="/login" element={
                    <div className="w-full">
                      <LazyWrapper>
                        <LoginPage />
                      </LazyWrapper>
                    </div>
                  } />
                  <Route path="/*" element={
                    <ProtectedRoute>
                      <AppLayout>
                        <Routes>
                          <Route path="/" element={<Index />} />
                          <Route path="/chat" element={
                            <LazyWrapper>
                              <ChatPage />
                            </LazyWrapper>
                          } />
                          <Route path="/tasks" element={
                            <LazyWrapper>
                              <TasksPage />
                            </LazyWrapper>
                          } />
                          <Route path="/analytics" element={
                            <LazyWrapper>
                              <AnalyticsPage />
                            </LazyWrapper>
                          } />
                          <Route path="/workflows" element={
                            <LazyWrapper>
                              <WorkflowHub />
                            </LazyWrapper>
                          } />
                          <Route path="/settings" element={
                            <LazyWrapper>
                              <SettingsPage />
                            </LazyWrapper>
                          } />
                          <Route path="*" element={
                            <LazyWrapper>
                              <NotFound />
                            </LazyWrapper>
                          } />
                        </Routes>
                      </AppLayout>
                    </ProtectedRoute>
                  } />
                </Routes>
              </div>
              
              {/* Mobile Bottom Navigation */}
              <MobileBottomNav />
            
              <Toaster />
              <Sonner />
            </SidebarProvider>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
