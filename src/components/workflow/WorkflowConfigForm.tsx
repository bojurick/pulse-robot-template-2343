import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Plus, X, Settings, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface WorkflowConfigFormProps {
  workflow: any;
  onTrigger: (config: any) => void;
  isLoading: boolean;
}

interface ConfigFormData {
  body: string;
  headers: { key: string; value: string }[];
  queryParams: { key: string; value: string }[];
  method: string;
}

export const WorkflowConfigForm: React.FC<WorkflowConfigFormProps> = ({
  workflow,
  onTrigger,
  isLoading
}) => {
  const [configMode, setConfigMode] = useState<'simple' | 'advanced'>('simple');
  const [savedConfig, setSavedConfig] = useState<ConfigFormData | null>(null);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<ConfigFormData>({
    defaultValues: {
      body: '{}',
      headers: [{ key: 'Content-Type', value: 'application/json' }],
      queryParams: [],
      method: workflow?.http_method || 'POST'
    }
  });

  const { fields: headerFields, append: appendHeader, remove: removeHeader } = useFieldArray({
    control,
    name: 'headers'
  });

  const { fields: queryFields, append: appendQuery, remove: removeQuery } = useFieldArray({
    control,
    name: 'queryParams'
  });

  // Load saved configuration
  useEffect(() => {
    const loadSavedConfig = async () => {
      if (!workflow?.id) return;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Query the workflow_configs table with proper type handling
        const { data, error } = await supabase
          .from('workflow_configs' as any)
          .select('*')
          .eq('workflow_id', workflow.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (data && !error && typeof data === 'object' && 'config' in data) {
          const config = (data as any).config;
          setSavedConfig(config);
          
          // Pre-fill form with saved config
          setValue('body', config.body || '{}');
          setValue('method', config.method || workflow.http_method);
          setValue('headers', config.headers || [{ key: 'Content-Type', value: 'application/json' }]);
          setValue('queryParams', config.queryParams || []);
        }
      } catch (error) {
        console.error('Error loading saved config:', error);
      }
    };

    loadSavedConfig();
  }, [workflow?.id, setValue]);

  // Save configuration
  const saveConfiguration = async (config: ConfigFormData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('workflow_configs' as any)
        .upsert({
          workflow_id: workflow.id,
          user_id: user.id,
          config: config,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Configuration Save Failed",
        description: "Could not save workflow configuration.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: ConfigFormData) => {
    // Save configuration for future use
    await saveConfiguration(data);

    // Prepare trigger data
    const triggerData: any = {};
    
    // Parse JSON body if provided
    if (data.body && data.body.trim()) {
      try {
        triggerData.body = JSON.parse(data.body);
      } catch (error) {
        toast({
          title: "Invalid JSON",
          description: "Please check your JSON body format.",
          variant: "destructive",
        });
        return;
      }
    }

    // Convert headers array to object
    const headers: Record<string, string> = {};
    data.headers.forEach(header => {
      if (header.key && header.value) {
        headers[header.key] = header.value;
      }
    });

    // Convert query params array to object
    const queryParams: Record<string, string> = {};
    data.queryParams.forEach(param => {
      if (param.key && param.value) {
        queryParams[param.key] = param.value;
      }
    });

    onTrigger({
      ...triggerData,
      headers,
      queryParams,
      method: data.method
    });
  };

  const handleSimpleTrigger = () => {
    onTrigger({});
  };

  const validateJSON = (value: string) => {
    if (!value || value.trim() === '') return true;
    try {
      JSON.parse(value);
      return true;
    } catch {
      return 'Invalid JSON format';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="h-5 w-5 text-[#E20074]" />
            Workflow Trigger
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={configMode === 'simple' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setConfigMode('simple')}
              className={configMode === 'simple' ? 'bg-[#E20074] hover:bg-[#E20074]/90 text-white' : ''}
            >
              Simple
            </Button>
            <Button
              type="button"
              variant={configMode === 'advanced' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setConfigMode('advanced')}
              className={configMode === 'advanced' ? 'bg-[#E20074] hover:bg-[#E20074]/90 text-white' : ''}
            >
              Configure
            </Button>
          </div>
        </div>
        {savedConfig && (
          <Badge variant="secondary" className="w-fit">
            Saved configuration available
          </Badge>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        <AnimatePresence mode="wait">
          {configMode === 'simple' ? (
            <motion.div
              key="simple"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-sm text-muted-foreground mb-4">
                Trigger the workflow with default settings.
              </p>
              <Button
                onClick={handleSimpleTrigger}
                disabled={isLoading}
                className="w-full bg-[#E20074] hover:bg-[#E20074]/90 text-white"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Triggering...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Trigger Workflow
                  </>
                )}
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="advanced"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Accordion type="multiple" defaultValue={['method', 'body']} className="w-full">
                  
                  {/* HTTP Method */}
                  <AccordionItem value="method">
                    <AccordionTrigger className="text-sm font-medium">
                      HTTP Method
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <Label htmlFor="method">Request Method</Label>
                      <Select value={watch('method')} onValueChange={(value) => setValue('method', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                        </SelectContent>
                      </Select>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Request Body */}
                  <AccordionItem value="body">
                    <AccordionTrigger className="text-sm font-medium">
                      Request Body (JSON)
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      <Label htmlFor="body">JSON Payload</Label>
                      <Textarea
                        {...register('body', { validate: validateJSON })}
                        placeholder="Enter JSON body..."
                        className="font-mono text-sm min-h-[120px]"
                        aria-describedby="body-error"
                      />
                      {errors.body && (
                        <p id="body-error" className="text-sm text-destructive">
                          {errors.body.message}
                        </p>
                      )}
                    </AccordionContent>
                  </AccordionItem>

                  {/* Headers */}
                  <AccordionItem value="headers">
                    <AccordionTrigger className="text-sm font-medium">
                      Headers ({headerFields.length})
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      {headerFields.map((field, index) => (
                        <div key={field.id} className="flex gap-2 items-end">
                          <div className="flex-1">
                            <Label htmlFor={`headers.${index}.key`}>Key</Label>
                            <Input
                              {...register(`headers.${index}.key`)}
                              placeholder="Header name"
                            />
                          </div>
                          <div className="flex-1">
                            <Label htmlFor={`headers.${index}.value`}>Value</Label>
                            <Input
                              {...register(`headers.${index}.value`)}
                              placeholder="Header value"
                            />
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeHeader(index)}
                            disabled={headerFields.length === 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendHeader({ key: '', value: '' })}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Header
                      </Button>
                    </AccordionContent>
                  </AccordionItem>

                  {/* Query Parameters */}
                  <AccordionItem value="params">
                    <AccordionTrigger className="text-sm font-medium">
                      Query Parameters ({queryFields.length})
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      {queryFields.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No query parameters configured</p>
                      ) : (
                        queryFields.map((field, index) => (
                          <div key={field.id} className="flex gap-2 items-end">
                            <div className="flex-1">
                              <Label htmlFor={`queryParams.${index}.key`}>Parameter</Label>
                              <Input
                                {...register(`queryParams.${index}.key`)}
                                placeholder="Parameter name"
                              />
                            </div>
                            <div className="flex-1">
                              <Label htmlFor={`queryParams.${index}.value`}>Value</Label>
                              <Input
                                {...register(`queryParams.${index}.value`)}
                                placeholder="Parameter value"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeQuery(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => appendQuery({ key: '', value: '' })}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Parameter
                      </Button>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <Separator />

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#E20074] hover:bg-[#E20074]/90 text-white"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                      Configuring & Triggering...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Configure & Trigger
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
