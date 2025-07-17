import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  due_date?: string | null;
  tags: string[] | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface DashboardWidget {
  id: string;
  user_id: string;
  widget_type: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  config: any;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  agent_type: string;
  messages: any;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: string;
  dashboard_layout: any;
  notification_settings: any;
  ai_preferences: any;
  created_at: string;
  updated_at: string;
}

interface AppState {
  // Data
  tasks: Task[];
  widgets: DashboardWidget[];
  chatSessions: ChatSession[];
  userPreferences: UserPreferences | null;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // UI state
  selectedTask: Task | null;
  activeChatSession: ChatSession | null;
  sidebarCollapsed: boolean;
  
  // Actions
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  fetchWidgets: () => Promise<void>;
  updateWidget: (id: string, updates: Partial<DashboardWidget>) => Promise<void>;
  
  fetchChatSessions: () => Promise<void>;
  createChatSession: (session: Omit<ChatSession, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateChatSession: (id: string, updates: Partial<ChatSession>) => Promise<void>;
  
  fetchUserPreferences: () => Promise<void>;
  updateUserPreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  
  setSelectedTask: (task: Task | null) => void;
  setActiveChatSession: (session: ChatSession | null) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  tasks: [],
  widgets: [],
  chatSessions: [],
  userPreferences: null,
  isLoading: false,
  error: null,
  selectedTask: null,
  activeChatSession: null,
  sidebarCollapsed: false,

  // Task actions
  fetchTasks: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      set({ tasks: data || [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  addTask: async (taskData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...taskData, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      
      const currentTasks = get().tasks;
      set({ tasks: [data, ...currentTasks] });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateTask: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const currentTasks = get().tasks;
      const updatedTasks = currentTasks.map(task => 
        task.id === id ? { ...task, ...data } : task
      );
      set({ tasks: updatedTasks });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteTask: async (id) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      const currentTasks = get().tasks;
      const filteredTasks = currentTasks.filter(task => task.id !== id);
      set({ tasks: filteredTasks });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // Widget actions
  fetchWidgets: async () => {
    try {
      const { data, error } = await supabase
        .from('dashboard_widgets')
        .select('*')
        .eq('is_visible', true)
        .order('position_y', { ascending: true });
      
      if (error) throw error;
      set({ widgets: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateWidget: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('dashboard_widgets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const currentWidgets = get().widgets;
      const updatedWidgets = currentWidgets.map(widget => 
        widget.id === id ? { ...widget, ...data } : widget
      );
      set({ widgets: updatedWidgets });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // Chat session actions
  fetchChatSessions: async () => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      set({ chatSessions: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  createChatSession: async (sessionData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('chat_sessions')
        .insert({ ...sessionData, user_id: user.id })
        .select()
        .single();
      
      if (error) throw error;
      
      const currentSessions = get().chatSessions;
      set({ chatSessions: [data, ...currentSessions] });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateChatSession: async (id, updates) => {
    try {
      const { data, error } = await supabase
        .from('chat_sessions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      const currentSessions = get().chatSessions;
      const updatedSessions = currentSessions.map(session => 
        session.id === id ? { ...session, ...data } : session
      );
      set({ chatSessions: updatedSessions });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // User preferences actions
  fetchUserPreferences: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      set({ userPreferences: data });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  updateUserPreferences: async (updates) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_preferences')
        .upsert({ 
          user_id: user.id,
          ...updates 
        })
        .select()
        .single();
      
      if (error) throw error;
      set({ userPreferences: data });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // UI state actions
  setSelectedTask: (task) => set({ selectedTask: task }),
  setActiveChatSession: (session) => set({ activeChatSession: session }),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setError: (error) => set({ error }),
}));
