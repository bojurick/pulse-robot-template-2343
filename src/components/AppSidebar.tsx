
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
  SidebarHeader,
  SidebarFooter,
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
    description: "Create a new task",
    href: "/tasks"
  },
  { 
    title: "AI Assistant", 
    icon: Brain,
    action: "open-ai",
    description: "Chat with AI",
    href: "/chat"
  },
  { 
    title: "Quick Automation", 
    icon: Zap,
    action: "quick-workflow",
    description: "Trigger workflow",
    href: "/workflows"
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
    <Sidebar className="border-r border-border bg-sidebar" collapsible="icon">
      <SidebarHeader className="p-4 border-b border-border">
        {!collapsed && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 mb-4"
          >
            <Link 
              to="/" 
              className="flex items-center gap-2 group transition-all duration-200 hover:scale-105"
              aria-label="Navigate to home"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[#E20074] to-[#E20074]/80 rounded-lg flex items-center justify-center group-hover:shadow-lg transition-shadow">
                <Target className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-sidebar-foreground group-hover:text-[#E20074] transition-colors">AI Command</h2>
                <p className="text-xs text-sidebar-foreground/60">Productivity Hub</p>
              </div>
            </Link>
          </motion.div>
        )}
        
        {collapsed && (
          <div className="flex justify-center">
            <Link 
              to="/" 
              className="flex items-center justify-center w-full p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
              aria-label="Navigate to home"
            >
              <Target className="h-4 w-4 text-[#E20074]" />
            </Link>
          </div>
        )}

        {!collapsed && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-sidebar-foreground/60" />
            <Input 
              placeholder="Search or command..." 
              className="pl-10 bg-sidebar-accent border-sidebar-border text-sidebar-foreground placeholder:text-sidebar-foreground/60 focus:border-[#E20074] focus:ring-2 focus:ring-[#E20074]/20"
              aria-label="Search or command"
            />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="p-2">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/80">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item, index) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link 
                      to={item.url} 
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group ${
                        isActive(item.url)
                          ? 'bg-[#E20074]/10 text-[#E20074] border border-[#E20074]/20 shadow-sm'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`}
                      aria-label={`Navigate to ${item.title}`}
                    >
                      <item.icon className={`h-4 w-4 ${
                        isActive(item.url) 
                          ? 'text-[#E20074]' 
                          : 'text-sidebar-foreground/70 group-hover:text-[#E20074]'
                      }`} />
                      {!collapsed && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{item.title}</span>
                            {item.title === "Tasks" && pendingTasks > 0 && (
                              <span className="bg-[#E20074] text-white text-xs px-2 py-0.5 rounded-full">
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
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                  >
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-3 h-auto py-3 px-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm transition-all duration-200"
                    >
                      <Link to={action.href} aria-label={action.description}>
                        <action.icon className="h-4 w-4 text-sidebar-foreground/70" />
                        <div className="text-left">
                          <div className="text-sm font-medium">{action.title}</div>
                          <div className="text-xs text-sidebar-foreground/60">{action.description}</div>
                        </div>
                      </Link>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Settings */}
      <SidebarFooter className="p-4 border-t border-border">
        <SidebarMenuButton asChild>
          <Link 
            to="/settings" 
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive('/settings')
                ? 'bg-[#E20074]/10 text-[#E20074] border border-[#E20074]/20'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            }`}
            aria-label="Navigate to Settings"
          >
            <Settings className="h-4 w-4" />
            {!collapsed && <span className="font-medium">Settings</span>}
          </Link>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
