
-- Create table for storing workflow configurations
CREATE TABLE public.workflow_configs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES public.n8n_workflows(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(workflow_id, user_id)
);

-- Add Row Level Security (RLS)
ALTER TABLE public.workflow_configs ENABLE ROW LEVEL SECURITY;

-- Create policies for workflow configurations
CREATE POLICY "Users can view their own workflow configs" 
  ON public.workflow_configs 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflow configs" 
  ON public.workflow_configs 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow configs" 
  ON public.workflow_configs 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflow configs" 
  ON public.workflow_configs 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_workflow_configs_user_workflow ON public.workflow_configs(user_id, workflow_id);
CREATE INDEX idx_workflow_configs_updated_at ON public.workflow_configs(updated_at DESC);

-- Create trigger to automatically update updated_at timestamp
CREATE TRIGGER update_workflow_configs_updated_at
  BEFORE UPDATE ON public.workflow_configs 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();
