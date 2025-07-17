
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Loader2, Mic, MicOff, Paperclip, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  disabled?: boolean;
  placeholder?: string;
  isVoiceEnabled?: boolean;
  onToggleVoice?: () => void;
}

const quickReplies = [
  "Analyze this data",
  "Create a workflow",
  "Help me prioritize",
  "Generate a report",
  "Optimize this process"
];

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSubmit,
  isLoading,
  disabled = false,
  placeholder = "Type your message... (Press Enter to send, Shift+Enter for new line)",
  isVoiceEnabled = false,
  onToggleVoice
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSubmit();
      }
    }
  };

  const handleVoiceToggle = () => {
    if (isVoiceEnabled) {
      setIsRecording(!isRecording);
      if (!isRecording) {
        // Start recording
        toast({
          title: "Voice recording started",
          description: "Speak your message...",
        });
      } else {
        // Stop recording
        toast({
          title: "Voice recording stopped",
          description: "Processing your message...",
        });
      }
    }
    onToggleVoice?.();
  };

  const handleQuickReply = (reply: string) => {
    onChange(reply);
    setShowQuickReplies(false);
    textareaRef.current?.focus();
  };

  const canSubmit = value.trim() && !isLoading && !disabled;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-3"
    >
      {/* Quick Replies */}
      {showQuickReplies && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-wrap gap-2"
        >
          {quickReplies.map((reply, index) => (
            <Badge
              key={index}
              variant="outline"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => handleQuickReply(reply)}
            >
              {reply}
            </Badge>
          ))}
        </motion.div>
      )}

      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                className="min-h-[60px] max-h-[200px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                disabled={disabled || isLoading}
                rows={1}
                aria-label="Chat message input"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQuickReplies(!showQuickReplies)}
                    className="h-8 w-8 p-0"
                    aria-label="Toggle quick replies"
                  >
                    <Smile className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    aria-label="Attach file"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  
                  {isVoiceEnabled && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleVoiceToggle}
                      className={`h-8 w-8 p-0 ${isRecording ? 'bg-red-500 text-white' : ''}`}
                      aria-label={isRecording ? "Stop recording" : "Start voice recording"}
                    >
                      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
                
                <span className="text-xs text-muted-foreground">
                  {value.length}/2000
                </span>
              </div>
            </div>
            
            <Button
              onClick={onSubmit}
              disabled={!canSubmit}
              className="btn-primary h-12 w-12 p-0 flex-shrink-0"
              aria-label="Send message"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ChatInput;
