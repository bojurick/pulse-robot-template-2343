
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { DateRange } from 'react-day-picker';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';

interface AnalyticsMetrics {
  totalTasks: number;
  completedTasks: number;
  chatSessions: number;
  formSubmissions: number;
  productivityScore: number;
  averageFocusTime: string;
  automations: number;
}

interface ProductivityData {
  date: string;
  tasks_completed: number;
  chat_interactions: number;
  form_submissions: number;
  efficiency: number;
}

interface InteractionData {
  hour: string;
  interactions: number;
  peak?: boolean;
}

interface Insight {
  id: string;
  type: 'performance' | 'improvement' | 'achievement' | 'warning';
  title: string;
  description: string;
  value?: string;
}

export const useAnalyticsData = (dateRange?: DateRange) => {
  const [insights] = useState<Insight[]>([
    {
      id: '1',
      type: 'performance',
      title: 'Peak Performance Hours',
      description: 'Your most productive hours are between 10-11 AM and 3-4 PM. Consider scheduling important tasks during these times.',
      value: '+15%'
    },
    {
      id: '2',
      type: 'improvement',
      title: 'Task Completion Optimization',
      description: 'Task completion rate drops on Fridays. Try batch processing smaller tasks to maintain momentum.',
      value: '-8%'
    },
    {
      id: '3',
      type: 'achievement',
      title: 'Automation Success',
      description: 'Your workflows have saved an estimated 2.5 hours this week through automation.',
      value: '2.5h'
    }
  ]);

  // Default date range to last 7 days
  const effectiveDateRange = dateRange || {
    from: startOfDay(subDays(new Date(), 6)),
    to: endOfDay(new Date())
  };

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['analytics-tasks', effectiveDateRange.from, effectiveDateRange.to],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .gte('created_at', effectiveDateRange.from?.toISOString())
        .lte('created_at', effectiveDateRange.to?.toISOString());
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: chatSessions = [], isLoading: chatLoading } = useQuery({
    queryKey: ['analytics-chats', effectiveDateRange.from, effectiveDateRange.to],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .gte('created_at', effectiveDateRange.from?.toISOString())
        .lte('created_at', effectiveDateRange.to?.toISOString());
      
      if (error) throw error;
      return data || [];
    }
  });

  const { data: workflows = [], isLoading: workflowsLoading } = useQuery({
    queryKey: ['analytics-workflows', effectiveDateRange.from, effectiveDateRange.to],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('n8n_workflows')
        .select('*')
        .gte('created_at', effectiveDateRange.from?.toISOString())
        .lte('created_at', effectiveDateRange.to?.toISOString());
      
      if (error) throw error;
      return data || [];
    }
  });

  // Calculate metrics
  const metrics: AnalyticsMetrics = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter(task => task.status === 'completed').length,
    chatSessions: chatSessions.length,
    formSubmissions: workflows.filter(w => w.type === 'form').length,
    productivityScore: tasks.length > 0 ? Math.round((tasks.filter(task => task.status === 'completed').length / tasks.length) * 100) : 0,
    averageFocusTime: '2.3h', // Mock data for now
    automations: workflows.length
  };

  // Generate productivity trend data
  const productivityData: ProductivityData[] = [];
  const days = 7;
  
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'MM/dd');
    
    const dayTasks = tasks.filter(task => {
      const taskDate = new Date(task.created_at);
      return format(taskDate, 'MM/dd') === dateStr;
    });
    
    const dayChats = chatSessions.filter(session => {
      const sessionDate = new Date(session.created_at);
      return format(sessionDate, 'MM/dd') === dateStr;
    });
    
    productivityData.push({
      date: dateStr,
      tasks_completed: dayTasks.filter(task => task.status === 'completed').length,
      chat_interactions: dayChats.length,
      form_submissions: Math.floor(Math.random() * 5), // Mock data
      efficiency: dayTasks.length > 0 ? Math.round((dayTasks.filter(task => task.status === 'completed').length / dayTasks.length) * 100) : 0
    });
  }

  // Generate interaction data (mock for now)
  const interactionData: InteractionData[] = [
    { hour: '9', interactions: 3 },
    { hour: '10', interactions: 8, peak: true },
    { hour: '11', interactions: 6 },
    { hour: '12', interactions: 4 },
    { hour: '13', interactions: 2 },
    { hour: '14', interactions: 5 },
    { hour: '15', interactions: 9, peak: true },
    { hour: '16', interactions: 7 },
    { hour: '17', interactions: 3 }
  ];

  const isLoading = tasksLoading || chatLoading || workflowsLoading;

  return {
    metrics,
    productivityData,
    interactionData,
    insights,
    isLoading,
    dateRange: effectiveDateRange
  };
};
