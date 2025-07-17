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

const TaskSkeleton = () => (
  <div className="space-y-4">
    {[...Array(4)].map((_, i) => (
      <Card key={i} className="glass-widget">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="skeleton w-5 h-5 rounded" />
            <div className="flex-1">
              <div className="skeleton h-4 w-3/4 mb-2" />
              <div className="skeleton h-3 w-1/2" />
            </div>
            <div className="skeleton w-16 h-6 rounded-full" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  urgent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
};

const statusColors = {
  todo: 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200',
  in_progress: 'bg-primary/10 text-primary dark:bg-primary/20',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
};

const TaskCard = ({ task }: { task: any }) => {
  const { updateTask, deleteTask } = useAppStore();
  const { toast } = useToast();

  const handleToggleComplete = async () => {
    try {
      await updateTask(task.id, {
        status: task.status === 'completed' ? 'todo' : 'completed'
      });
      toast({
        title: `Task ${task.status === 'completed' ? 'reopened' : 'completed'}`,
        description: task.title,
      });
    } catch (error) {
      toast({
        title: "Error updating task",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTask(task.id);
      toast({
        title: "Task deleted",
        description: task.title,
      });
    } catch (error) {
      toast({
        title: "Error deleting task",
        variant: "destructive",
      });
    }
  };

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group"
    >
      <Card className={`glass-widget hover-lift cursor-pointer ${
        task.status === 'completed' ? 'opacity-60' : ''
      } ${isOverdue ? 'border-red-200 dark:border-red-800' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleComplete}
              className="h-5 w-5 p-0 mt-0.5 hover:bg-primary/10"
              aria-label={task.status === 'completed' ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {task.status === 'completed' ? (
                <CheckSquare className="h-5 w-5 text-primary" />
              ) : (
                <Square className="h-5 w-5 text-muted-foreground hover:text-primary" />
              )}
            </Button>

            <div className="flex-1 min-w-0">
              <h3 className={`font-medium text-body mb-1 ${
                task.status === 'completed' ? 'line-through text-muted-foreground' : ''
              }`}>
                {task.title}
              </h3>
              
              {task.description && (
                <p className="text-body-small text-muted-foreground mb-2 line-clamp-2">
                  {task.description}
                </p>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={priorityColors[task.priority as keyof typeof priorityColors]}>
                  {task.priority}
                </Badge>
                
                <Badge className={statusColors[task.status as keyof typeof statusColors]}>
                  {task.status.replace('_', ' ')}
                </Badge>

                {task.due_date && (
                  <Badge variant="outline" className={`flex items-center gap-1 ${
                    isOverdue ? 'border-red-300 text-red-600 dark:border-red-700 dark:text-red-400' : ''
                  }`}>
                    {isOverdue ? <AlertCircle className="h-3 w-3" /> : <Calendar className="h-3 w-3" />}
                    {new Date(task.due_date).toLocaleDateString()}
                  </Badge>
                )}

                {task.tags && task.tags.length > 0 && (
                  <div className="flex items-center gap-1">
                    {task.tags.slice(0, 2).map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {tag}
                      </Badge>
                    ))}
                    {task.tags.length > 2 && (
                      <Badge variant="outline">+{task.tags.length - 2}</Badge>
                    )}
                  </div>
                )}
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Task options"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="flex items-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2 text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

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
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6"
        >
          {[
            { label: 'Total Tasks', value: taskStats.total, icon: CheckSquare, color: 'text-primary' },
            { label: 'Active', value: taskStats.active, icon: Clock, color: 'text-yellow-600' },
            { label: 'Completed', value: taskStats.completed, icon: CheckSquare, color: 'text-green-600' },
            { label: 'Overdue', value: taskStats.overdue, icon: AlertCircle, color: 'text-red-600' },
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
