import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Pencil, Trash2, Plus, Settings, Workflow } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { n8nInstanceUtils, n8nWorkflowUtils, N8nInstance, N8nWorkflow } from "@/lib/n8nUtils";
import RobotSpinner from "@/components/RobotSpinner";

const instanceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  base_url: z.string().url("Must be a valid URL"),
  api_key: z.string().min(1, "API key is required")
});

const workflowSchema = z.object({
  name: z.string().min(1, "Name is required"),
  instance_id: z.string().min(1, "Instance is required"),
  webhook_url: z.string().url("Must be a valid URL"),
  type: z.enum(['chat', 'form', 'click']),
  description: z.string().optional(),
  http_method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH'])
});

type InstanceFormData = z.infer<typeof instanceSchema>;
type WorkflowFormData = z.infer<typeof workflowSchema>;

const SettingsPage = () => {
  const [instances, setInstances] = useState<N8nInstance[]>([]);
  const [workflows, setWorkflows] = useState<N8nWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingInstance, setEditingInstance] = useState<N8nInstance | null>(null);
  const [editingWorkflow, setEditingWorkflow] = useState<N8nWorkflow | null>(null);
  const [instanceDialogOpen, setInstanceDialogOpen] = useState(false);
  const [workflowDialogOpen, setWorkflowDialogOpen] = useState(false);

  const instanceForm = useForm<InstanceFormData>({
    resolver: zodResolver(instanceSchema),
    defaultValues: {
      name: '',
      base_url: '',
      api_key: ''
    }
  });

  const workflowForm = useForm<WorkflowFormData>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      name: '',
      instance_id: '',
      webhook_url: '',
      type: 'chat',
      description: '',
      http_method: 'POST'
    }
  });

  useEffect(() => {
    loadData();
    setupRealtimeSubscriptions();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [instancesData, workflowsData] = await Promise.all([
        n8nInstanceUtils.getAll(),
        n8nWorkflowUtils.getAll()
      ]);
      setInstances(instancesData);
      setWorkflows(workflowsData);
    } catch (error) {
      toast({
        title: "Error loading data",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    const instancesChannel = supabase
      .channel('n8n_instances_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'n8n_instances' }, () => {
        loadData();
      })
      .subscribe();

    const workflowsChannel = supabase
      .channel('n8n_workflows_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'n8n_workflows' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(instancesChannel);
      supabase.removeChannel(workflowsChannel);
    };
  };

  const handleInstanceSubmit = async (data: InstanceFormData) => {
    try {
      if (editingInstance) {
        await n8nInstanceUtils.update(editingInstance.id, data);
      } else {
        await n8nInstanceUtils.create(data as Required<InstanceFormData>);
      }
      setInstanceDialogOpen(false);
      setEditingInstance(null);
      instanceForm.reset();
      loadData();
    } catch (error) {
      toast({
        title: "Error saving instance",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleWorkflowSubmit = async (data: WorkflowFormData) => {
    try {
      if (editingWorkflow) {
        await n8nWorkflowUtils.update(editingWorkflow.id, data);
      } else {
        await n8nWorkflowUtils.create(data as Required<WorkflowFormData>);
      }
      setWorkflowDialogOpen(false);
      setEditingWorkflow(null);
      workflowForm.reset();
      loadData();
    } catch (error) {
      toast({
        title: "Error saving workflow",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInstance = async (id: string) => {
    try {
      await n8nInstanceUtils.delete(id);
      loadData();
    } catch (error) {
      toast({
        title: "Error deleting instance",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWorkflow = async (id: string) => {
    try {
      await n8nWorkflowUtils.delete(id);
      loadData();
    } catch (error) {
      toast({
        title: "Error deleting workflow",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const openInstanceDialog = (instance?: N8nInstance) => {
    if (instance) {
      setEditingInstance(instance);
      instanceForm.reset({
        name: instance.name,
        base_url: instance.base_url,
        api_key: instance.api_key
      });
    } else {
      setEditingInstance(null);
      instanceForm.reset();
    }
    setInstanceDialogOpen(true);
  };

  const openWorkflowDialog = (workflow?: N8nWorkflow) => {
    if (workflow) {
      setEditingWorkflow(workflow);
      workflowForm.reset({
        name: workflow.name,
        instance_id: workflow.instance_id,
        webhook_url: workflow.webhook_url,
        type: workflow.type,
        description: workflow.description || '',
        http_method: workflow.http_method
      });
    } else {
      setEditingWorkflow(null);
      workflowForm.reset();
    }
    setWorkflowDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RobotSpinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">N8n Settings</h1>
      </div>

      <Tabs defaultValue="instances" className="space-y-4">
        <TabsList>
          <TabsTrigger value="instances">Instances</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
        </TabsList>

        <TabsContent value="instances">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>N8n Instances</CardTitle>
                  <CardDescription>
                    Manage your N8n instance connections
                  </CardDescription>
                </div>
                <Dialog open={instanceDialogOpen} onOpenChange={setInstanceDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => openInstanceDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Instance
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingInstance ? 'Edit Instance' : 'Add New Instance'}
                      </DialogTitle>
                      <DialogDescription>
                        Configure your N8n instance connection details
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...instanceForm}>
                      <form onSubmit={instanceForm.handleSubmit(handleInstanceSubmit)} className="space-y-4">
                        <FormField
                          control={instanceForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="My N8n Instance" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={instanceForm.control}
                          name="base_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Base URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://n8n.example.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={instanceForm.control}
                          name="api_key"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>API Key</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Your API key" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit">
                            {editingInstance ? 'Update' : 'Create'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Base URL</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {instances.map((instance) => (
                    <TableRow key={instance.id}>
                      <TableCell className="font-medium">{instance.name}</TableCell>
                      <TableCell>{instance.base_url}</TableCell>
                      <TableCell>{new Date(instance.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openInstanceDialog(instance)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteInstance(instance.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Workflows</CardTitle>
                  <CardDescription>
                    Manage your N8n workflows and webhooks
                  </CardDescription>
                </div>
                <Dialog open={workflowDialogOpen} onOpenChange={setWorkflowDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => openWorkflowDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Workflow
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingWorkflow ? 'Edit Workflow' : 'Add New Workflow'}
                      </DialogTitle>
                      <DialogDescription>
                        Configure your workflow details and webhook settings
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...workflowForm}>
                      <form onSubmit={workflowForm.handleSubmit(handleWorkflowSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={workflowForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Chat Bot Workflow" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={workflowForm.control}
                            name="instance_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Instance</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select instance" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {instances.map((instance) => (
                                      <SelectItem key={instance.id} value={instance.id}>
                                        {instance.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={workflowForm.control}
                          name="webhook_url"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Webhook URL</FormLabel>
                              <FormControl>
                                <Input placeholder="https://n8n.example.com/webhook/..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={workflowForm.control}
                            name="type"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Type</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="chat">Chat</SelectItem>
                                    <SelectItem value="form">Form</SelectItem>
                                    <SelectItem value="click">Click</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={workflowForm.control}
                            name="http_method"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>HTTP Method</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select method" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="GET">GET</SelectItem>
                                    <SelectItem value="POST">POST</SelectItem>
                                    <SelectItem value="PUT">PUT</SelectItem>
                                    <SelectItem value="DELETE">DELETE</SelectItem>
                                    <SelectItem value="PATCH">PATCH</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <FormField
                          control={workflowForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Describe what this workflow does..."
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <DialogFooter>
                          <Button type="submit">
                            {editingWorkflow ? 'Update' : 'Create'}
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Instance</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workflows.map((workflow) => {
                    const instance = instances.find(i => i.id === workflow.instance_id);
                    return (
                      <TableRow key={workflow.id}>
                        <TableCell className="font-medium">{workflow.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{workflow.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{workflow.http_method}</Badge>
                        </TableCell>
                        <TableCell>{instance?.name || 'Unknown'}</TableCell>
                        <TableCell>{new Date(workflow.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openWorkflowDialog(workflow)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteWorkflow(workflow.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;