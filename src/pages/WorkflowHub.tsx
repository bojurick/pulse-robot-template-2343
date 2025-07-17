import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Workflow, MessageCircle, FileText, MousePointer, Play, Settings2, Plus, Trash2, History, Edit3, Download, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { n8nWorkflowUtils, N8nWorkflowWithInstance } from "@/lib/n8nUtils";
import { triggerWebhook } from "@/lib/webhookUtils";
import RobotSpinner from "@/components/RobotSpinner";
import FormRenderer from "@/components/workflow/FormRenderer";
import SubmissionHistory from "@/components/workflow/SubmissionHistory";
import { PageHeader } from "@/components/navigation/PageHeader";
import { useNavigate } from 'react-router-dom';

const configSchema = z.object({
  headers: z.string().optional(),
  body: z.string().optional(),
  queryParams: z.string().optional()
});

type ConfigFormData = z.infer<typeof configSchema>;

interface WorkflowResult {
  success: boolean;
  status: number;
  data: any;
  workflow: N8nWorkflowWithInstance;
  timestamp: string;
  contentType?: string;
  fileName?: string;
  downloadUrl?: string;
}

const WorkflowHub = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<N8nWorkflowWithInstance[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<N8nWorkflowWithInstance | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('interact');
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [lastResult, setLastResult] = useState<WorkflowResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const configForm = useForm<ConfigFormData>({
    resolver: zodResolver(configSchema),
    defaultValues: {
      headers: '{}',
      body: '{}',
      queryParams: '{}'
    }
  });

  useEffect(() => {
    loadWorkflows();
    setupRealtimeSubscription();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const data = await n8nWorkflowUtils.getAll();
      setWorkflows(data);
      if (data.length > 0 && !selectedWorkflow) {
        setSelectedWorkflow(data[0]);
      }
    } catch (error) {
      toast({
        title: "Error loading workflows",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('workflow_hub_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'n8n_workflows' }, () => {
        loadWorkflows();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const processWorkflowResult = async (result: any): Promise<WorkflowResult> => {
    const processedResult: WorkflowResult = {
      ...result,
      timestamp: new Date().toISOString()
    };

    // Check if result contains file data
    if (result.data && typeof result.data === 'string') {
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(result.data);
        processedResult.data = parsed;
      } catch {
        // If not JSON, check if it's binary data or a file
        if (result.data.includes('data:') || result.data.length > 1000) {
          // Looks like file data, upload to Supabase storage
          try {
            const fileName = `workflow-result-${Date.now()}.txt`;
            const { data: uploadData, error } = await supabase.storage
              .from('n8n')
              .upload(fileName, new Blob([result.data], { type: 'text/plain' }));

            if (!error && uploadData) {
              const { data: urlData } = supabase.storage
                .from('n8n')
                .getPublicUrl(uploadData.path);
              
              processedResult.downloadUrl = urlData.publicUrl;
              processedResult.fileName = fileName;
              processedResult.contentType = 'text/plain';
            }
          } catch (error) {
            console.error('Error uploading file:', error);
          }
        }
      }
    }

    return processedResult;
  };

  const handleConfiguredTrigger = async (data: ConfigFormData) => {
    if (!selectedWorkflow) return;

    try {
      setTriggering(true);
      
      const headers = data.headers ? JSON.parse(data.headers) : {};
      const body = data.body ? JSON.parse(data.body) : {};
      const queryParams = data.queryParams ? JSON.parse(data.queryParams) : {};

      const result = await triggerWebhook(selectedWorkflow.id, {
        headers,
        body,
        queryParams
      });

      const processedResult = await processWorkflowResult(result);
      setLastResult(processedResult);
      setShowResults(true);
      setConfigDialogOpen(false);
      configForm.reset();
    } catch (error) {
      toast({
        title: "Configuration error",
        description: error instanceof Error ? error.message : "Invalid JSON format",
        variant: "destructive",
      });
    } finally {
      setTriggering(false);
    }
  };

  const handleSimpleTrigger = async (payload?: any) => {
    if (!selectedWorkflow) return;

    try {
      setTriggering(true);
      const result = await triggerWebhook(selectedWorkflow.id, {
        body: payload || {}
      });

      const processedResult = await processWorkflowResult(result);
      setLastResult(processedResult);
      setShowResults(true);
    } catch (error) {
      // Error already handled in triggerWebhook
    } finally {
      setTriggering(false);
    }
  };

  const handleFormSubmit = async (data: any) => {
    if (!selectedWorkflow) return;
    
    await handleSimpleTrigger(data);
    
    toast({
      title: "Form submitted successfully! 🎉",
      description: "Your form data has been processed by the workflow.",
    });
  };

  const handleSaveDraft = (data: any) => {
    localStorage.setItem(`form-draft-${selectedWorkflow?.id}`, JSON.stringify(data));
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedWorkflow) return;

    const userMessage = { role: 'user' as const, content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    await handleSimpleTrigger({ message: chatInput, conversation: chatMessages });
  };

  const downloadFile = () => {
    if (lastResult?.downloadUrl) {
      window.open(lastResult.downloadUrl, '_blank');
    }
  };

  const renderResults = () => {
    if (!lastResult || !showResults) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mt-6"
      >
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between border-primary/20 hover:border-primary">
              <span className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${lastResult.success ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>Workflow Result ({lastResult.success ? 'Success' : 'Failed'})</span>
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4">
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-sm">Response Details</CardTitle>
                <CardDescription>
                  Status: {lastResult.status} | Time: {new Date(lastResult.timestamp).toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {lastResult.downloadUrl ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">File generated successfully</p>
                    <Button onClick={downloadFile} className="bg-primary hover:bg-primary/90">
                      <Download className="h-4 w-4 mr-2" />
                      Download {lastResult.fileName}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Response Data:</Label>
                    <div className="bg-muted/50 rounded-lg p-4 max-h-64 overflow-auto">
                      <pre className="text-xs whitespace-pre-wrap font-mono">
                        {typeof lastResult.data === 'object' 
                          ? JSON.stringify(lastResult.data, null, 2)
                          : lastResult.data
                        }
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>
      </motion.div>
    );
  };

  const renderWorkflowInterface = () => {
    if (!selectedWorkflow) return null;

    switch (selectedWorkflow.type) {
      case 'form':
        return (
          <FormRenderer
            workflow={selectedWorkflow}
            onSubmit={handleFormSubmit}
            onSaveDraft={handleSaveDraft}
            isSubmitting={triggering}
          />
        );

      case 'chat':
        return (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 min-h-[300px] max-h-[400px] overflow-y-auto">
              {chatMessages.length === 0 ? (
                <p className="text-muted-foreground text-center">Start a conversation...</p>
              ) : (
                chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-3 p-3 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground ml-auto max-w-[80%]' 
                        : 'bg-background border max-w-[80%]'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleChatSubmit} className="flex space-x-2">
              <Input
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Type your message..."
                disabled={triggering}
                className="focus:border-primary focus:ring-primary"
              />
              <Button type="submit" disabled={triggering || !chatInput.trim()} className="bg-primary hover:bg-primary/90">
                {triggering ? <RobotSpinner /> : <MessageCircle className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        );

      case 'click':
        return (
          <div className="space-y-4">
            <div className="text-center space-y-4">
              <div className="bg-muted/50 rounded-lg p-6">
                <MousePointer className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-lg font-semibold">Click Trigger</h3>
                <p className="text-muted-foreground">
                  Trigger this workflow with custom configuration
                </p>
              </div>
              <div className="flex space-x-2">
                <Button 
                  onClick={() => handleSimpleTrigger()}
                  disabled={triggering}
                  variant="outline"
                  className="flex-1"
                >
                  {triggering ? <RobotSpinner /> : <Play className="h-4 w-4 mr-2" />}
                  Simple Trigger
                </Button>
                <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 bg-primary hover:bg-primary/90">
                      <Settings2 className="h-4 w-4 mr-2" />
                      Configure & Trigger
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Configure Webhook Trigger</DialogTitle>
                      <DialogDescription>
                        Customize headers, body, and query parameters for the webhook
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...configForm}>
                      <form onSubmit={configForm.handleSubmit(handleConfiguredTrigger)} className="space-y-4">
                        <FormField
                          control={configForm.control}
                          name="headers"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Custom Headers (JSON)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder='{"Authorization": "Bearer token", "X-Custom": "value"}'
                                  {...field}
                                  className="form-control"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={configForm.control}
                          name="body"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Request Body (JSON)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder='{"action": "trigger", "data": {"key": "value"}}'
                                  rows={4}
                                  {...field}
                                  className="form-control"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={configForm.control}
                          name="queryParams"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Query Parameters (JSON)</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder='{"param1": "value1", "param2": "value2"}'
                                  {...field}
                                  className="form-control"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit" disabled={triggering} className="bg-primary hover:bg-primary/90">
                            {triggering ? <RobotSpinner /> : "Trigger Workflow"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        );

      default:
        return <p className="text-muted-foreground">Unknown workflow type</p>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'chat': return <MessageCircle className="h-4 w-4" />;
      case 'form': return <FileText className="h-4 w-4" />;
      case 'click': return <MousePointer className="h-4 w-4" />;
      default: return <Workflow className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <PageHeader 
          title="Workflow Hub" 
          description="Manage and execute your n8n workflows"
          showBackButton={true}
          showBreadcrumbs={true}
        />
        <div className="flex-1 flex items-center justify-center">
          <RobotSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader 
        title="Workflow Hub" 
        description="Manage and execute your n8n workflows"
        showBackButton={true}
        showBreadcrumbs={true}
      >
        <div className="flex items-center space-x-2">
          <Workflow className="h-6 w-6 text-primary" />
        </div>
      </PageHeader>

      <div className="flex-1 container mx-auto p-6 space-y-6">
        {workflows.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <Workflow className="h-16 w-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">No workflows found</h3>
                  <p className="text-muted-foreground">
                    Create your first workflow in the settings to get started.
                  </p>
                </div>
                <Button 
                  onClick={() => navigate('/settings')} 
                  className="bg-primary hover:bg-primary/90"
                >
                  Go to Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Workflow List */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Your Workflows</CardTitle>
                  <CardDescription>
                    Select a workflow to interact with
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {workflows.map((workflow) => (
                    <motion.div
                      key={workflow.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedWorkflow?.id === workflow.id
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'hover:bg-muted/50 hover:border-border'
                      }`}
                      onClick={() => {
                        setSelectedWorkflow(workflow);
                        setShowResults(false);
                        setLastResult(null);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(workflow.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{workflow.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {workflow.n8n_instances.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Badge variant="secondary" className="text-xs">
                            {workflow.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {workflow.http_method}
                          </Badge>
                        </div>
                      </div>
                      {workflow.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {workflow.description}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Workflow Interface */}
            <div className="lg:col-span-3">
              {selectedWorkflow ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          {getTypeIcon(selectedWorkflow.type)}
                          <span>{selectedWorkflow.name}</span>
                        </CardTitle>
                        <CardDescription>
                          {selectedWorkflow.description || `${selectedWorkflow.type} workflow`}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{selectedWorkflow.type}</Badge>
                        <Badge variant="outline">{selectedWorkflow.http_method}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="interact" className="flex items-center space-x-2">
                          <Play className="h-4 w-4" />
                          <span>Interact</span>
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center space-x-2">
                          <History className="h-4 w-4" />
                          <span>History</span>
                        </TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="interact" className="mt-6">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key="interact"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                          >
                            {renderWorkflowInterface()}
                          </motion.div>
                        </AnimatePresence>
                      </TabsContent>
                      
                      <TabsContent value="history" className="mt-6">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key="history"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                          >
                            <SubmissionHistory workflowId={selectedWorkflow.id} />
                          </motion.div>
                        </AnimatePresence>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <Workflow className="h-16 w-16 mx-auto text-muted-foreground" />
                      <div>
                        <h3 className="text-lg font-semibold">Select a workflow</h3>
                        <p className="text-muted-foreground">
                          Choose a workflow from the list to start interacting
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowHub;
