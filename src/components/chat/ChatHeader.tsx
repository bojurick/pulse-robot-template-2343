
import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Settings, 
  Plus, 
  MessageSquare, 
  Download, 
  Mic, 
  MicOff,
  ChevronDown,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/useAppStore";

interface ChatHeaderProps {
  onNewChat: () => void;
  onExportChat: () => void;
  isVoiceEnabled: boolean;
  onToggleVoice: () => void;
  selectedAgent: string;
  onSelectAgent: (agent: string) => void;
}

const agents = [
  { id: "general", name: "General Assistant", description: "Helpful AI assistant for general tasks" },
  { id: "productivity", name: "Productivity Expert", description: "Specialized in task management and workflows" },
  { id: "data", name: "Data Analyst", description: "Expert in data analysis and visualization" },
  { id: "code", name: "Code Assistant", description: "Programming and development support" }
];

const ChatHeader: React.FC<ChatHeaderProps> = ({
  onNewChat,
  onExportChat,
  isVoiceEnabled,
  onToggleVoice,
  selectedAgent,
  onSelectAgent
}) => {
  const { chatSessions } = useAppStore();
  const hasConversations = chatSessions.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between py-6 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-heading-2 font-semibold">AI Chat Assistant</h1>
            <p className="text-sm text-muted-foreground">
              Powered by n8n workflows
            </p>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              {agents.find(a => a.id === selectedAgent)?.name || "Select Agent"}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {agents.map((agent) => (
              <DropdownMenuItem
                key={agent.id}
                onClick={() => onSelectAgent(agent.id)}
                className="flex flex-col items-start gap-1 p-3"
              >
                <div className="flex items-center gap-2 w-full">
                  <span className="font-medium">{agent.name}</span>
                  {agent.id === selectedAgent && (
                    <Badge variant="secondary" className="ml-auto">Active</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{agent.description}</p>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleVoice}
          className={`transition-colors ${isVoiceEnabled ? 'bg-primary text-primary-foreground' : ''}`}
          aria-label={isVoiceEnabled ? "Disable voice input" : "Enable voice input"}
        >
          {isVoiceEnabled ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onExportChat}
          disabled={!hasConversations}
          className="gap-2"
          aria-label="Export chat history"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onNewChat}
          className="gap-2 btn-secondary"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="btn-ghost"
          aria-label="Chat settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
};

export default ChatHeader;
