
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, AlertTriangle, Target } from "lucide-react";

interface Insight {
  id: string;
  type: 'performance' | 'improvement' | 'achievement' | 'warning';
  title: string;
  description: string;
  value?: string;
  trend?: 'up' | 'down' | 'stable';
}

interface InsightsPanelProps {
  insights: Insight[];
  loading?: boolean;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ 
  insights, 
  loading = false 
}) => {
  if (loading) {
    return (
      <Card className="glass-widget">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg bg-muted animate-pulse">
              <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted-foreground/20 rounded w-full"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const getInsightIcon = (type: Insight['type']) => {
    switch (type) {
      case 'performance':
        return TrendingUp;
      case 'achievement':
        return Target;
      case 'warning':
        return AlertTriangle;
      default:
        return Lightbulb;
    }
  };

  const getInsightStyle = (type: Insight['type']) => {
    switch (type) {
      case 'performance':
        return 'bg-primary/5 border-primary/20 text-primary';
      case 'improvement':
        return 'bg-info/5 border-info/20 text-info';
      case 'achievement':
        return 'bg-success/5 border-success/20 text-success';
      case 'warning':
        return 'bg-warning/5 border-warning/20 text-warning';
      default:
        return 'bg-muted border-border text-muted-foreground';
    }
  };

  if (!insights || insights.length === 0) {
    return (
      <Card className="glass-widget">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No insights available yet</p>
            <p className="text-sm text-muted-foreground">
              Continue using the app to generate personalized insights
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="glass-widget">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.map((insight, index) => {
            const Icon = getInsightIcon(insight.type);
            const style = getInsightStyle(insight.type);
            
            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${style}`}
              >
                <div className="flex items-start gap-3">
                  <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{insight.title}</h4>
                      {insight.value && (
                        <Badge variant="outline" className="text-xs">
                          {insight.value}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm opacity-80">{insight.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
};
