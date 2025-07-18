
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  CheckSquare,
  Square,
  Clock,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
  Tag
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { PageHeader } from "@/components/navigation/PageHeader";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/hooks/use-toast";
import { TaskSkeleton } from "@/components/tasks/TaskSkeleton";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskStats } from "@/components/tasks/TaskStats";

const TasksPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const { tasks, isLoading, fetchTasks } = useAppStore();

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    switch (selectedTab) {
      case 'active':
        return matchesSearch && task.status !== 'completed';
      case 'completed':
        return matchesSearch && task.status === 'completed';
      case 'overdue':
        return matchesSearch && task.due_date && 
               new Date(task.due_date) < new Date() && 
               task.status !== 'completed';
      default:
        return matchesSearch;
    }
  });

  const taskStats = {
    total: tasks.length,
    active: tasks.filter(t => t.status !== 'completed').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => 
      t.due_date && 
      new Date(t.due_date) < new Date() && 
      t.status !== 'completed'
    ).length,
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <div className="container-professional">
        {/* Enhanced Header with Navigation */}
        <PageHeader
          title="Task Management"
          description="Organize and track your productivity"
          className="py-6 border-b border-border"
        >
          <Button className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </PageHeader>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mt-6"
        >
          <TaskStats stats={taskStats} />
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mt-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="pl-10 form-control"
              aria-label="Search tasks"
            />
          </div>
          <Button variant="outline" className="btn-secondary">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </motion.div>

        {/* Tasks Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-6"
        >
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="overdue">Overdue</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-6">
              {isLoading ? (
                <TaskSkeleton />
              ) : filteredTasks.length > 0 ? (
                <div className="space-y-4">
                  {filteredTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TaskCard task={task} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-heading-3 mb-2">
                    {searchQuery ? 'No tasks found' : 'No tasks yet'}
                  </h3>
                  <p className="text-body text-muted-foreground mb-6">
                    {searchQuery 
                      ? 'Try adjusting your search criteria' 
                      : 'Create your first task to get started'
                    }
                  </p>
                  {!searchQuery && (
                    <Button className="btn-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Task
                    </Button>
                  )}
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default TasksPage;
