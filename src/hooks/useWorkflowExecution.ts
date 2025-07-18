
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { triggerWebhook, WebhookResponse } from '@/lib/webhookUtils';
import { toast } from '@/hooks/use-toast';

export const useWorkflowExecution = (workflowId?: string) => {
  const [currentResult, setCurrentResult] = useState<WebhookResponse | null>(null);

  // Fetch execution history
  const { data: executionHistory = [], refetch: refetchHistory } = useQuery({
    queryKey: ['workflow-executions', workflowId],
    queryFn: async () => {
      if (!workflowId) return [];
      
      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    },
    enabled: !!workflowId,
  });

  // Execute workflow mutation
  const executeWorkflow = useMutation({
    mutationFn: async ({ 
      workflowId, 
      data = {}, 
      options = {} 
    }: { 
      workflowId: string; 
      data?: any; 
      options?: any;
    }) => {
      const startTime = Date.now();
      
      try {
        const result = await triggerWebhook(workflowId, {
          body: data,
          ...options
        });
        
        const executionTime = Date.now() - startTime;
        
        // Store execution in database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('workflow_executions').insert({
            workflow_id: workflowId,
            user_id: user.id,
            request_data: data,
            response_data: result.data,
            status: result.success ? 'success' : 'error',
            execution_time_ms: executionTime,
            file_urls: result.data?.fileUrls || null
          });
        }
        
        return result;
      } catch (error) {
        const executionTime = Date.now() - startTime;
        
        // Store failed execution
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('workflow_executions').insert({
            workflow_id: workflowId,
            user_id: user.id,
            request_data: data,
            response_data: null,
            status: 'error',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            execution_time_ms: executionTime
          });
        }
        
        throw error;
      }
    },
    onSuccess: (result) => {
      setCurrentResult(result);
      refetchHistory();
    },
    onError: (error) => {
      console.error('Workflow execution failed:', error);
      toast({
        title: "Execution Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  });

  return {
    currentResult,
    executionHistory,
    executeWorkflow,
    isExecuting: executeWorkflow.isPending,
    clearResult: () => setCurrentResult(null)
  };
};
