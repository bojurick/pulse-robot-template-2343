
import React from "react";
import { motion } from "framer-motion";
import { MessageSquare, Zap, Brain, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChatWelcomeProps {
  onSuggestionClick: (suggestion: string) => void;
}

const suggestions = [
  { text: "Analyze my productivity patterns", icon: BarChart3 },
  { text: "Create a task automation workflow", icon: Zap },
  { text: "Help me prioritize my tasks", icon: Brain },
  { text: "Generate a productivity report", icon: BarChart3 }
];

const ChatWelcome: React.FC<ChatWelcomeProps> = ({ onSuggestionClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full text-center p-8"
    >
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center mb-6 shadow-lg">
        <MessageSquare className="h-10 w-10 text-primary" />
      </div>
      
      <h3 className="text-heading-3 mb-3 font-semibold">Start a conversation</h3>
      <p className="text-body text-muted-foreground mb-8 max-w-md">
        Ask me anything about productivity, task management, or how I can help streamline your workflow with n8n automation.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
        {suggestions.map((suggestion, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Badge
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all duration-200 p-3 h-auto flex items-center gap-2 text-sm hover:scale-105"
              onClick={() => onSuggestionClick(suggestion.text)}
            >
              <suggestion.icon className="h-4 w-4" />
              {suggestion.text}
            </Badge>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ChatWelcome;
