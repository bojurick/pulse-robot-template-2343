import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface N8nInstance {
  id: string;
  user_id: string;
  name: string;
  base_url: string;
  api_key: string;
  created_at: string;
  updated_at: string;
}

export interface N8nWorkflow {
  id: string;
  instance_id: string;
  user_id: string;
  name: string;
  webhook_url: string;
  type: 'chat' | 'form' | 'click';
  description?: string;
  http_method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  created_at: string;
  updated_at: string;
}

export interface N8nWorkflowWithInstance extends N8nWorkflow {
  n8n_instances: N8nInstance;
}

// N8n Instance CRUD operations
export const n8nInstanceUtils = {
  async getAll(): Promise<N8nInstance[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('n8n_instances')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getById(id: string): Promise<N8nInstance | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('n8n_instances')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async create(instance: Omit<N8nInstance, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<N8nInstance> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('n8n_instances')
      .insert({
        ...instance,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    
    toast({
      title: "Success! 🎉",
      description: `N8n instance "${instance.name}" created successfully.`,
    });

    return data;
  },

  async update(id: string, updates: Partial<Omit<N8nInstance, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<N8nInstance> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('n8n_instances')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    
    toast({
      title: "Updated! ✨",
      description: "N8n instance updated successfully.",
    });

    return data;
  },

  async delete(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from('n8n_instances')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    
    toast({
      title: "Deleted! 🗑️",
      description: "N8n instance deleted successfully.",
    });
  }
};

// N8n Workflow CRUD operations
export const n8nWorkflowUtils = {
  async getAll(): Promise<N8nWorkflowWithInstance[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('n8n_workflows')
      .select(`
        *,
        n8n_instances (*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as N8nWorkflowWithInstance[];
  },

  async getById(id: string): Promise<N8nWorkflowWithInstance | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('n8n_workflows')
      .select(`
        *,
        n8n_instances (*)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as N8nWorkflowWithInstance;
  },

  async getByType(type: 'chat' | 'form' | 'click'): Promise<N8nWorkflowWithInstance[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('n8n_workflows')
      .select(`
        *,
        n8n_instances (*)
      `)
      .eq('user_id', user.id)
      .eq('type', type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as N8nWorkflowWithInstance[];
  },

  async create(workflow: Omit<N8nWorkflow, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<N8nWorkflow> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('n8n_workflows')
      .insert({
        ...workflow,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    
    toast({
      title: "Success! 🚀",
      description: `Workflow "${workflow.name}" created successfully.`,
    });

    return data as N8nWorkflow;
  },

  async update(id: string, updates: Partial<Omit<N8nWorkflow, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<N8nWorkflow> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('n8n_workflows')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    
    toast({
      title: "Updated! ✨",
      description: "Workflow updated successfully.",
    });

    return data as N8nWorkflow;
  },

  async delete(id: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from('n8n_workflows')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    
    toast({
      title: "Deleted! 🗑️",
      description: "Workflow deleted successfully.",
    });
  }
};