
import { useEffect, useState } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkStatus: 'online' | 'offline';
}

export const usePerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkStatus: navigator.onLine ? 'online' : 'offline'
  });

  useEffect(() => {
    // Measure load time
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const loadTime = navigation.loadEventEnd - navigation.loadEventStart;

    // Measure render time
    const renderStart = performance.now();
    requestAnimationFrame(() => {
      const renderTime = performance.now() - renderStart;
      
      // Get memory usage if available
      const memoryUsage = (performance as any).memory?.usedJSHeapSize || 0;

      setMetrics({
        loadTime,
        renderTime,
        memoryUsage,
        networkStatus: navigator.onLine ? 'online' : 'offline'
      });
    });

    // Listen for network status changes
    const handleOnline = () => setMetrics(prev => ({ ...prev, networkStatus: 'online' }));
    const handleOffline = () => setMetrics(prev => ({ ...prev, networkStatus: 'offline' }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const measureComponentRender = (componentName: string) => {
    const startTime = performance.now();
    return () => {
      const endTime = performance.now();
      console.log(`${componentName} render time: ${endTime - startTime}ms`);
    };
  };

  return {
    metrics,
    measureComponentRender
  };
};
