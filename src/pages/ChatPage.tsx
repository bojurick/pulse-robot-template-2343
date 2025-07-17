
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Copy, 
  ThumbsUp, 
  ThumbsDown,
  Settings,
  Plus,
  MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const ChatSkeleton = () => (
  <div className="space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex gap-3">
        <div className="skeleton w-8 h-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-4 w-3/4" />
          <div className="skeleton h-4 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

const MessageBubble = ({ message }: { message: Message }) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        duration: 2000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 group ${message.role === 'user' ? 'justify-end' : ''}`}
    >
      {message.role === 'assistant' && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Bot className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
      
      <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
        <Card className={`${message.role === 'user' 
          ? 'bg-primary text-primary-foreground' 
          : 'glass-widget'
        }`}>
          <CardContent className="p-4">
            <p className="text-body leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/20">
              <span className="text-2xs opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="h-6 w-6 p-0"
                  aria-label="Copy message"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                {message.role === 'assistant' && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      aria-label="Like message"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      aria-label="Dislike message"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {message.role === 'user' && (
        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
          <User className="h-4 w-4 text-accent-foreground" />
        </div>
      )}
    </motion.div>
  );
};

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { chatSessions, createChatSession } = useAppStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I understand you're asking about: "${userMessage.content}". As your AI productivity assistant, I'm here to help you manage tasks, analyze data, and streamline your workflows. How can I assist you further with your productivity goals?`,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setInputValue('');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-professional">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between py-6 border-b border-border"
        >
          <div>
            <h1 className="text-heading-2">AI Chat Assistant</h1>
            <p className="text-body text-muted-foreground mt-1">
              Your intelligent productivity companion
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={startNewChat}
              className="btn-secondary"
            >
              <Plus className="h-4 w-4 mr-2" />
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

        {/* Chat Area */}
        <div className="flex flex-col h-[calc(100vh-200px)] mt-6">
          {/* Messages */}
          <Card className="flex-1 glass-card">
            <CardContent className="p-6 h-full flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                {messages.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center h-full text-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <MessageSquare className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-heading-3 mb-2">Start a conversation</h3>
                    <p className="text-body text-muted-foreground mb-6 max-w-md">
                      Ask me anything about productivity, task management, or how I can help streamline your workflow.
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[
                        "Analyze my productivity patterns",
                        "Create a task automation workflow",
                        "Summarize my recent activities",
                        "Help me prioritize tasks"
                      ].map((suggestion, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => setInputValue(suggestion)}
                        >
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <MessageBubble key={message.id} message={message} />
                    ))}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <Bot className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <Card className="glass-widget">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span className="text-body">AI is thinking...</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
          </Card>

          {/* Input Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-4"
          >
            <Card className="glass-card">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message... (Press Enter to send)"
                    className="flex-1 form-control"
                    disabled={isLoading}
                    aria-label="Chat message input"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
                    className="btn-primary px-4"
                    aria-label="Send message"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
