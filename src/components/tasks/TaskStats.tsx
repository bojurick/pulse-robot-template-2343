
import React from "react";
import { motion } from "framer-motion";
import { CheckSquare, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TaskStatsProps {
  stats: {
    total: number;
    active: number;
    completed: number;
    overdue: number;
  };
}

export const TaskStats: React.FC<TaskStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[
        { label: 'Total Tasks', value: stats.total, icon: CheckSquare, color: 'text-primary' },
        { label: 'Active', value: stats.active, icon: Clock, color: 'text-yellow-600' },
        { label: 'Completed', value: stats.completed, icon: CheckSquare, color: 'text-green-600' },
        { label: 'Overdue', value: stats.overdue, icon: AlertCircle, color: 'text-red-600' },
      ].map((stat, index) => (
        <Card key={index} className="glass-widget">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-small text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
