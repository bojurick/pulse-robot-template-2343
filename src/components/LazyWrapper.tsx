
import React, { Suspense, lazy, ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyWrapperProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

const DefaultFallback = () => (
  <div className="flex items-center justify-center min-h-[200px] w-full">
    <div className="flex flex-col items-center gap-2">
      <Loader2 className="h-6 w-6 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

export const LazyWrapper: React.FC<LazyWrapperProps> = ({ 
  children, 
  fallback = <DefaultFallback />,
  className = "" 
}) => {
  return (
    <div className={className}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </div>
  );
};

// Higher-order component for lazy loading
export const withLazyLoading = <P extends object>(
  Component: ComponentType<P>,
  fallback?: React.ReactNode
) => {
  const LazyComponent = lazy(() => Promise.resolve({ default: Component }));
  
  return (props: P) => (
    <LazyWrapper fallback={fallback}>
      <LazyComponent {...props} />
    </LazyWrapper>
  );
};

// Utility for creating lazy-loaded route components
export const createLazyRoute = (importFn: () => Promise<{ default: ComponentType<any> }>) => {
  return lazy(importFn);
};
