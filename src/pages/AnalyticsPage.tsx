
import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Target,
  TrendingUp,
  Clock,
  Zap,
  Download,
  RefreshCw,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { MetricsCard } from "@/components/analytics/MetricsCard";
import { ProductivityChart } from "@/components/analytics/ProductivityChart";
import { InteractionChart } from "@/components/analytics/InteractionChart";
import { InsightsPanel } from "@/components/analytics/InsightsPanel";
import { DateRangeFilter } from "@/components/analytics/DateRangeFilter";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";

const AnalyticsPage = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    metrics, 
    productivityData, 
    interactionData, 
    insights, 
    isLoading 
  } = useAnalyticsData(dateRange);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate data refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  const exportData = () => {
    const data = {
      metrics,
      productivity: productivityData,
      interactions: interactionData,
      insights,
      exportDate: new Date().toISOString(),
      dateRange
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-professional">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-6 border-b border-border"
        >
          <div className="mb-4 lg:mb-0">
            <h1 className="text-heading-2 bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-body text-muted-foreground mt-1">
              Track your productivity insights and workflow performance
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <DateRangeFilter 
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="btn-secondary"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportData}
                className="btn-secondary"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Key Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8"
        >
          <MetricsCard
            title="Tasks Completed"
            value={metrics.completedTasks}
            change={`${metrics.completedTasks > 0 ? '+' : ''}${metrics.completedTasks} completed`}
            changeType={metrics.completedTasks > 0 ? "increase" : "neutral"}
            icon={Target}
            loading={isLoading}
          />
          <MetricsCard
            title="Productivity Score"
            value={`${metrics.productivityScore}%`}
            change={metrics.productivityScore > 75 ? "Excellent performance" : "Room for improvement"}
            changeType={metrics.productivityScore > 75 ? "increase" : "neutral"}
            icon={TrendingUp}
            loading={isLoading}
          />
          <MetricsCard
            title="Chat Sessions"
            value={metrics.chatSessions}
            change={`${metrics.chatSessions > 0 ? '+' : ''}${metrics.chatSessions} sessions`}
            changeType={metrics.chatSessions > 0 ? "increase" : "neutral"}
            icon={MessageSquare}
            loading={isLoading}
          />
          <MetricsCard
            title="Workflow Automations"
            value={metrics.automations}
            change={`${metrics.automations > 0 ? '+' : ''}${metrics.automations} active`}
            changeType={metrics.automations > 0 ? "increase" : "neutral"}
            icon={Zap}
            loading={isLoading}
          />
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
          {/* Productivity Trend - Spans 2 columns */}
          <div className="xl:col-span-2">
            <ProductivityChart 
              data={productivityData}
              loading={isLoading}
            />
          </div>

          {/* AI Insights */}
          <div>
            <InsightsPanel 
              insights={insights}
              loading={isLoading}
            />
          </div>
        </div>

        {/* Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Peak Hours */}
          <InteractionChart 
            data={interactionData}
            loading={isLoading}
          />

          {/* Additional metrics or summary card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <MetricsCard
              title="Average Focus Time"
              value={metrics.averageFocusTime}
              change="Per session average"
              changeType="neutral"
              icon={Clock}
              loading={isLoading}
            />
            
            <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
              <h3 className="font-semibold text-primary mb-2">Quick Summary</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {metrics.completedTasks > 0 
                  ? `You've completed ${metrics.completedTasks} tasks with a ${metrics.productivityScore}% completion rate. ${metrics.chatSessions > 0 ? `Your ${metrics.chatSessions} AI interactions helped boost productivity.` : 'Consider using AI chat for assistance with complex tasks.'}`
                  : 'Start creating and completing tasks to see your productivity insights here.'
                }
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
