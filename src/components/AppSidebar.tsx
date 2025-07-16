import React from "react";
import { 
  Home, 
  Brain, 
  MessageSquare, 
  CheckSquare, 
  BarChart3, 
  Settings, 
  Workflow,
  Search,
  Plus,
  Zap,
  Target,
  Calendar
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/useAppStore";

const navigationItems = [
  { 
    title: "Dashboard", 
    url: "/", 
    icon: Home,
    description: "AI productivity hub"
  },
  { 
    title: "AI Chat", 
    url: "/chat", 
    icon: MessageSquare,
    description: "Multi-agent conversations"
  },
  { 
    title: "Tasks", 
    url: "/tasks", 
    icon: CheckSquare,
    description: "Smart task management"
  },
  { 
    title: "Workflows", 
    url: "/workflows", 
    icon: Workflow,
    description: "n8n automations"
  },
  { 
    title: "Analytics", 
    url: "/analytics", 
    icon: BarChart3,
    description: "Productivity insights"
  },
];

const quickActions = [
  { 
    title: "New Task", 
    icon: Plus,
    action: "create-task",
    description: "Create a new task"
  },
  { 
    title: "AI Assistant", 
    icon: Brain,
    action: "open-ai",
    description: "Chat with AI"
  },
  { 
    title: "Quick Automation", 
    icon: Zap,
    action: "quick-workflow",
    description: "Trigger workflow"
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { tasks } = useAppStore();
  
  const currentPath = location.pathname;
  const isActive = (path: string) => currentPath === path;
  const collapsed = state === "collapsed";
  
  const pendingTasks = tasks.filter(task => task.status !== 'completed').length;

  return (
    <Sidebar className={collapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-sidebar border-r border-sidebar-border">
        {/* Header with search */}
        {!collapsed && (
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-sidebar-foreground">AI Command</h2>
                <p className="text-xs text-sidebar-foreground/60">Productivity Hub</p>
              </div>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sidebar-foreground/60" />
              <Input 
                placeholder="Search or command..." 
                className="pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/60"
              />
            </div>
          </div>
        )}

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url} 
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                        isActive(item.url)
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      <item.icon className={`h-4 w-4 ${isActive(item.url) ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/70'}`} />
                      {!collapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{item.title}</span>
                            {item.title === "Tasks" && pendingTasks > 0 && (
                              <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                                {pendingTasks}
                              </span>
                            )}
                          </div>
                          {!isActive(item.url) && (
                            <p className="text-xs text-sidebar-foreground/60 group-hover:text-sidebar-accent-foreground/80">
                              {item.description}
                            </p>
                          )}
                        </motion.div>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions */}
        {!collapsed && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/80">
              Quick Actions
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <Button
                    key={action.title}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-3 h-auto py-3 px-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <action.icon className="h-4 w-4 text-sidebar-foreground/70" />
                    <div className="text-left">
                      <div className="text-sm font-medium">{action.title}</div>
                      <div className="text-xs text-sidebar-foreground/60">{action.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Settings */}
        <div className="mt-auto p-4 border-t border-sidebar-border">
          <SidebarMenuButton asChild>
            <Link 
              to="/settings" 
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                isActive('/settings')
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <Settings className="h-4 w-4" />
              {!collapsed && <span className="font-medium">Settings</span>}
            </Link>
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}