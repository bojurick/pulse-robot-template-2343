
-- Create table for workflow executions history
CREATE TABLE public.workflow_executions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES public.n8n_workflows(id) NOT NULL,
  user_id UUID NOT NULL,
  request_data JSONB,
  response_data JSONB,
  status TEXT NOT NULL DEFAULT 'success',
  error_message TEXT,
  execution_time_ms INTEGER,
  file_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;

-- Create policies for workflow executions
CREATE POLICY "Users can view their own workflow executions" 
  ON public.workflow_executions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflow executions" 
  ON public.workflow_executions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_workflow_executions_user_workflow ON public.workflow_executions(user_id, workflow_id);
CREATE INDEX idx_workflow_executions_created_at ON public.workflow_executions(created_at DESC);
