-- Create n8n_instances table
CREATE TABLE public.n8n_instances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create n8n_workflows table
CREATE TABLE public.n8n_workflows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instance_id UUID NOT NULL REFERENCES public.n8n_instances(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  webhook_url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('chat', 'form', 'click')),
  description TEXT,
  http_method TEXT NOT NULL DEFAULT 'POST' CHECK (http_method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.n8n_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.n8n_workflows ENABLE ROW LEVEL SECURITY;

-- Create policies for n8n_instances
CREATE POLICY "Users can view their own instances" 
  ON public.n8n_instances 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own instances" 
  ON public.n8n_instances 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own instances" 
  ON public.n8n_instances 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own instances" 
  ON public.n8n_instances 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create policies for n8n_workflows
CREATE POLICY "Users can view their own workflows" 
  ON public.n8n_workflows 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflows" 
  ON public.n8n_workflows 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflows" 
  ON public.n8n_workflows 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workflows" 
  ON public.n8n_workflows 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_n8n_instances_updated_at
  BEFORE UPDATE ON public.n8n_instances
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_n8n_workflows_updated_at
  BEFORE UPDATE ON public.n8n_workflows
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for both tables
ALTER TABLE public.n8n_instances REPLICA IDENTITY FULL;
ALTER TABLE public.n8n_workflows REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.n8n_instances;
ALTER PUBLICATION supabase_realtime ADD TABLE public.n8n_workflows;