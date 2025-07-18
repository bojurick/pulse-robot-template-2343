
import React from "react";
import { motion } from "framer-motion";
import { 
  CheckSquare,
  Square,
  Calendar,
  AlertCircle,
  MoreVertical,
  Edit,
  Trash2,
  Tag
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/hooks/use-toast";

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

interface TaskCardProps {
  task: any;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
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
