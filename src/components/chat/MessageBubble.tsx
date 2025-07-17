
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Bot, User, Copy, ThumbsUp, ThumbsDown, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isTyping?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  onReply?: (content: string) => void;
  onBranch?: (messageId: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onReply, onBranch }) => {
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

  const handleFeedback = (type: 'positive' | 'negative') => {
    toast({
      title: `${type === 'positive' ? 'Positive' : 'Negative'} feedback recorded`,
      description: "Thank you for your feedback!",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 group ${message.role === 'user' ? 'justify-end' : ''} mb-6`}
    >
      {message.role === 'assistant' && (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Bot className="h-5 w-5 text-primary" />
        </div>
      )}
      
      <div className={`max-w-[85%] ${message.role === 'user' ? 'order-1' : ''}`}>
        <Card className={`${message.role === 'user' 
          ? 'bg-primary text-primary-foreground shadow-lg' 
          : 'glass-widget hover:shadow-md'
        } transition-shadow duration-200`}>
          <CardContent className="p-4">
            <div className="prose prose-sm max-w-none">
              {message.role === 'user' ? (
                <p className="text-primary-foreground leading-relaxed whitespace-pre-wrap">
                  {message.content}
                </p>
              ) : (
                <ReactMarkdown
                  className="text-foreground leading-relaxed"
                  components={{
                    code({ node, inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      return !inline && match ? (
                        <SyntaxHighlighter
                          style={vscDarkPlus}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-md"
                          {...props}
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-muted px-1 py-0.5 rounded text-sm" {...props}>
                          {children}
                        </code>
                      );
                    }
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
            </div>
            
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/20">
              <span className="text-xs opacity-70">
                {message.timestamp.toLocaleTimeString()}
              </span>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyToClipboard}
                  className="h-7 w-7 p-0"
                  aria-label="Copy message"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                
                {message.role === 'assistant' && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback('positive')}
                      className="h-7 w-7 p-0"
                      aria-label="Like message"
                    >
                      <ThumbsUp className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleFeedback('negative')}
                      className="h-7 w-7 p-0"
                      aria-label="Dislike message"
                    >
                      <ThumbsDown className="h-3 w-3" />
                    </Button>
                  </>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0"
                      aria-label="More options"
                    >
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onReply?.(message.content)}>
                      Reply to this
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onBranch?.(message.id)}>
                      Branch conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {message.role === 'user' && (
        <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center flex-shrink-0 shadow-sm">
          <User className="h-5 w-5 text-accent-foreground" />
        </div>
      )}
    </motion.div>
  );
};

export default MessageBubble;
