
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/hooks/use-toast";
import ChatHeader from "@/components/chat/ChatHeader";
import MessageBubble from "@/components/chat/MessageBubble";
import ChatInput from "@/components/chat/ChatInput";
import TypingIndicator from "@/components/chat/TypingIndicator";
import ChatWelcome from "@/components/chat/ChatWelcome";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const ChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { chatSessions, createChatSession, fetchChatSessions } = useAppStore();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchChatSessions();
  }, [fetchChatSessions]);

  const handleSendMessage = async (messageContent?: string) => {
    const content = messageContent || inputValue.trim();
    if (!content || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Create chat session if this is the first message
      if (messages.length === 0) {
        await createChatSession({
          title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
          agent_type: selectedAgent,
          messages: [userMessage],
          metadata: { agent: selectedAgent }
        });
      }

      // Simulate AI response (replace with actual API call)
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: generateAIResponse(content, selectedAgent),
          role: 'assistant',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1500);
    } catch (error) {
      toast({
        title: "Error sending message",
        description: "Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const generateAIResponse = (userMessage: string, agent: string) => {
    const responses = {
      general: `I understand you're asking about: "${userMessage}". As your general AI assistant, I'm here to help with any questions or tasks you might have. How can I assist you further?`,
      productivity: `Great question about productivity! Regarding "${userMessage}", I can help you optimize your workflow, create automation sequences, and improve your task management. Let me analyze this and provide specific recommendations.`,
      data: `Analyzing your request: "${userMessage}". As your data specialist, I can help you process information, create visualizations, and generate insights. What specific data would you like me to work with?`,
      code: `Looking at your coding request: "${userMessage}". I can help you write code, debug issues, review implementations, and suggest best practices. What programming language or framework are you working with?`
    };
    
    return responses[agent as keyof typeof responses] || responses.general;
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputValue('');
    setIsLoading(false);
  };

  const handleExportChat = () => {
    if (messages.length === 0) {
      toast({
        title: "No messages to export",
        description: "Start a conversation first.",
        variant: "destructive",
      });
      return;
    }

    const chatData = {
      agent: selectedAgent,
      timestamp: new Date().toISOString(),
      messages: messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString()
      }))
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Chat exported successfully",
      description: "Your conversation has been saved as a JSON file.",
    });
  };

  const handleReply = (content: string) => {
    setInputValue(`Reply to: "${content.slice(0, 50)}..."\n\n`);
  };

  const handleBranch = (messageId: string) => {
    toast({
      title: "Feature coming soon",
      description: "Conversation branching will be available in the next update.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container-professional h-screen flex flex-col">
        <ChatHeader
          onNewChat={handleNewChat}
          onExportChat={handleExportChat}
          isVoiceEnabled={isVoiceEnabled}
          onToggleVoice={() => setIsVoiceEnabled(!isVoiceEnabled)}
          selectedAgent={selectedAgent}
          onSelectAgent={setSelectedAgent}
        />

        <div className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1 px-4">
            <div className="max-w-4xl mx-auto py-6">
              {messages.length === 0 ? (
                <ChatWelcome onSuggestionClick={handleSendMessage} />
              ) : (
                <>
                  <AnimatePresence>
                    {messages.map((message) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        onReply={handleReply}
                        onBranch={handleBranch}
                      />
                    ))}
                  </AnimatePresence>
                  
                  <AnimatePresence>
                    {isLoading && <TypingIndicator />}
                  </AnimatePresence>
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="border-t border-border/50 bg-background/80 backdrop-blur-sm p-4">
            <div className="max-w-4xl mx-auto">
              <ChatInput
                value={inputValue}
                onChange={setInputValue}
                onSubmit={() => handleSendMessage()}
                isLoading={isLoading}
                isVoiceEnabled={isVoiceEnabled}
                onToggleVoice={() => setIsVoiceEnabled(!isVoiceEnabled)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
