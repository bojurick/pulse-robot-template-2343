
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MessageSquare, 
  FileText, 
  MousePointer, 
  Plus,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { n8nWorkflowUtils } from '@/lib/n8nUtils';
import { WorkflowResults } from '@/components/workflow/WorkflowResults';
import { WorkflowConfigForm } from '@/components/workflow/WorkflowConfigForm';
import { useWorkflowExecution } from '@/hooks/useWorkflowExecution';

const WorkflowHub: React.FC = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string>('');
  
  const { 
    currentResult, 
    executionHistory, 
    executeWorkflow, 
    isExecuting 
  } = useWorkflowExecution(selectedWorkflow);

  const { data: workflows = [], isLoading } = useQuery({
    queryKey: ['n8n-workflows'],
    queryFn: () => n8nWorkflowUtils.getAll(),
  });

  const handleTriggerWorkflow = async (workflowId: string, config: any = {}) => {
    console.log('Triggering workflow with config:', config);
    setSelectedWorkflow(workflowId);
    executeWorkflow.mutate({ workflowId, data: config.body || {}, options: config });
  };

  const getWorkflowIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return MessageSquare;
      case 'form':
        return FileText;
      case 'click':
        return MousePointer;
      default:
        return Zap;
    }
  };

  const groupedWorkflows = workflows.reduce((acc, workflow) => {
    if (!acc[workflow.type]) {
      acc[workflow.type] = [];
    }
    acc[workflow.type].push(workflow);
    return acc;
  }, {} as Record<string, typeof workflows>);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#E20074] border-t-transparent" />
            <span>Loading workflows...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Workflow Hub</h1>
            <p className="text-muted-foreground mt-2">
              Configure and trigger your n8n workflows with advanced options
            </p>
          </div>
          <Button className="bg-[#E20074] hover:bg-[#E20074]/90 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Add Workflow
          </Button>
        </div>

        {Object.entries(groupedWorkflows).map(([type, typeWorkflows]) => {
          const Icon = getWorkflowIcon(type);
          
          return (
            <motion.div
              key={type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mb-8"
            >
              <div className="flex items-center gap-2 mb-4">
                <Icon className="h-5 w-5 text-[#E20074]" />
                <h2 className="text-xl font-semibold capitalize">{type} Workflows</h2>
                <Badge variant="secondary">{typeWorkflows.length}</Badge>
              </div>

              <div className="grid gap-6 lg:grid-cols-1">
                {typeWorkflows.map((workflow) => (
                  <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{workflow.name}</CardTitle>
                          {workflow.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {workflow.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {workflow.http_method}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                        <span>Instance: {workflow.n8n_instances?.name}</span>
                        <span className="truncate ml-2 max-w-[120px]">
                          {workflow.webhook_url.split('/').pop()}
                        </span>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0 space-y-4">
                      <WorkflowConfigForm
                        workflow={workflow}
                        onTrigger={(config) => handleTriggerWorkflow(workflow.id, config)}
                        isLoading={isExecuting && selectedWorkflow === workflow.id}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>

              {type !== Object.keys(groupedWorkflows)[Object.keys(groupedWorkflows).length - 1] && (
                <Separator className="mt-8" />
              )}
            </motion.div>
          );
        })}

        {workflows.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Zap className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              No workflows found
            </h3>
            <p className="text-sm text-muted-foreground">
              Create your first n8n workflow to get started.
            </p>
          </motion.div>
        )}

        <WorkflowResults
          result={currentResult}
          isLoading={isExecuting}
          executionHistory={executionHistory}
        />
      </motion.div>
    </div>
  );
};

export default WorkflowHub;
