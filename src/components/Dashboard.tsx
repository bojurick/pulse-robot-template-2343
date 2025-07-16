import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Brain, 
  CheckSquare, 
  BarChart3, 
  Zap, 
  Calendar,
  TrendingUp,
  Clock,
  Target,
  MessageSquare,
  Activity
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAppStore } from "@/store/useAppStore";
import { Link } from "react-router-dom";

const QuickStatsWidget = () => {
  const { tasks } = useAppStore();
  
  const stats = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(t => t.status === 'completed').length,
    inProgressTasks: tasks.filter(t => t.status === 'in_progress').length,
    highPriorityTasks: tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length,
  };
  
  const completionRate = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  return (
    <Card className="glass-widget">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Productivity Overview
        </CardTitle>
        <CardDescription>Your daily progress at a glance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.completedTasks}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-warning">{stats.inProgressTasks}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Daily Goal</span>
            <span>{completionRate}%</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>
        
        {stats.highPriorityTasks > 0 && (
          <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
            <Target className="h-4 w-4" />
            {stats.highPriorityTasks} high priority tasks
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const AIAssistantWidget = () => {
  return (
    <Card className="glass-widget">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Assistant
        </CardTitle>
        <CardDescription>Your personal productivity AI</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <div className="status-dot status-active"></div>
            <span className="text-sm">AI Agent Online</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Ready to help with tasks, scheduling, and automation
          </p>
        </div>
        
        <div className="space-y-2">
          <Button size="sm" className="w-full button-ai" asChild>
            <Link to="/chat">
              <MessageSquare className="h-4 w-4 mr-2" />
              Start AI Chat
            </Link>
          </Button>
          <Button size="sm" variant="outline" className="w-full">
            <Zap className="h-4 w-4 mr-2" />
            Quick Automation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const RecentActivityWidget = () => {
  const { tasks } = useAppStore();
  
  const recentTasks = tasks
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5);

  return (
    <Card className="glass-widget">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest updates and completions</CardDescription>
      </CardHeader>
      <CardContent>
        {recentTasks.length > 0 ? (
          <div className="space-y-3">
            {recentTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 text-sm">
                <div className={`status-dot ${
                  task.status === 'completed' ? 'status-active' : 
                  task.status === 'in_progress' ? 'status-pending' : 'status-inactive'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{task.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {new Date(task.updated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activity
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const UpcomingTasksWidget = () => {
  const { tasks } = useAppStore();
  
  const upcomingTasks = tasks
    .filter(task => task.due_date && task.status !== 'completed')
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 3);

  return (
    <Card className="glass-widget">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Upcoming Deadlines
        </CardTitle>
        <CardDescription>Tasks requiring attention</CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingTasks.length > 0 ? (
          <div className="space-y-3">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium">{task.title}</p>
                  <p className="text-muted-foreground text-xs">
                    Due: {new Date(task.due_date!).toLocaleDateString()}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.priority === 'urgent' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                  task.priority === 'high' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {task.priority}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No upcoming deadlines
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export const Dashboard = () => {
  const { fetchTasks, fetchWidgets, fetchChatSessions, fetchUserPreferences } = useAppStore();

  useEffect(() => {
    // Load all dashboard data
    fetchTasks();
    fetchWidgets();
    fetchChatSessions();
    fetchUserPreferences();
  }, [fetchTasks, fetchWidgets, fetchChatSessions, fetchUserPreferences]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Command Center</h1>
            <p className="text-muted-foreground">
              Your personalized productivity powerhouse
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button className="button-ai">
              <Brain className="h-4 w-4 mr-2" />
              AI Insights
            </Button>
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              View Analytics
            </Button>
          </div>
        </motion.div>

        {/* Dashboard Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="dashboard-grid"
        >
          <motion.div variants={itemVariants}>
            <QuickStatsWidget />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <AIAssistantWidget />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <RecentActivityWidget />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <UpcomingTasksWidget />
          </motion.div>
        </motion.div>

        {/* Quick Actions Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Button className="button-primary h-12" asChild>
              <Link to="/tasks">
                <CheckSquare className="h-4 w-4 mr-2" />
                New Task
              </Link>
            </Button>
            <Button className="button-productivity h-12" asChild>
              <Link to="/chat">
                <MessageSquare className="h-4 w-4 mr-2" />
                AI Chat
              </Link>
            </Button>
            <Button variant="outline" className="h-12" asChild>
              <Link to="/workflows">
                <Zap className="h-4 w-4 mr-2" />
                Automate
              </Link>
            </Button>
            <Button variant="outline" className="h-12" asChild>
              <Link to="/analytics">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Link>
            </Button>
            <Button variant="outline" className="h-12" asChild>
              <Link to="/settings">
                <Target className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};