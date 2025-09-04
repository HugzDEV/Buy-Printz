import React, { useState, useRef, useEffect } from 'react';
import { GlassCard, GlassButton, GlassPanel } from './ui/index';
import { Sparkles, Bot, Send, Loader2, Wand2, Palette, Edit3, Plus } from 'lucide-react';
import authService from '../services/auth';

const AIAgent = ({ onDesignGenerated, onDesignModified, currentDesignId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiCapabilities, setAiCapabilities] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Initialize with welcome message
      setMessages([{
        id: 1,
        type: 'ai',
        content: "Hello! I'm your AI design assistant. I can help you create banners, modify designs, and provide design recommendations. What would you like to create today?",
        timestamp: new Date()
      }]);
    }
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await authService.authenticatedRequest('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: inputMessage,
          context: {
            current_design_id: currentDesignId,
            user_preferences: {}
          }
        })
      });

      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.response || response.message || 'I understand your request. Let me help you with that.',
        timestamp: new Date(),
        actions: response.actions || []
      };

      setMessages(prev => [...prev, aiResponse]);

      // Handle design generation/modification
      if (response.design_created && onDesignGenerated) {
        onDesignGenerated(response.design_data);
      }
      if (response.design_modified && onDesignModified) {
        onDesignModified(response.design_data);
      }

    } catch (error) {
      console.error('AI Agent error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm sorry, I encountered an error. Please try again or contact support if the issue persists.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action) => {
    setInputMessage(action.prompt);
    await handleSendMessage();
  };

  const quickActions = [
    {
      icon: <Wand2 className="w-4 h-4" />,
      label: "Generate Banner",
      prompt: "Create a modern banner for my business",
      description: "AI will create a custom banner design"
    },
    {
      icon: <Palette className="w-4 h-4" />,
      label: "Modify Design",
      prompt: "Make this design more colorful and modern",
      description: "AI will enhance your current design"
    },
    {
      icon: <Edit3 className="w-4 h-4" />,
      label: "Add Text",
      prompt: "Add professional text to my banner",
      description: "AI will add appropriate text elements"
    },
    {
      icon: <Plus className="w-4 h-4" />,
      label: "Add Elements",
      prompt: "Add some decorative elements to my banner",
      description: "AI will add shapes and icons"
    }
  ];

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <GlassButton
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 p-4 rounded-full"
        >
          <Bot className="w-6 h-6" />
          <span className="ml-2 font-semibold">AI Assistant</span>
        </GlassButton>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 max-h-[600px]">
      <GlassCard className="bg-white/95 backdrop-blur-md border border-white/50 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/20">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">AI Design Assistant</h3>
              <p className="text-xs text-gray-600">Powered by OpenAI</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                {message.actions && message.actions.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickAction(action)}
                        className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-t border-white/20">
          <div className="grid grid-cols-2 gap-2 mb-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action)}
                className="flex items-center space-x-2 p-2 bg-white/50 hover:bg-white/70 rounded-lg transition-colors text-left"
                title={action.description}
              >
                {action.icon}
                <span className="text-xs font-medium text-gray-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-white/20">
          <div className="flex space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me to create or modify a banner..."
              className="flex-1 px-3 py-2 bg-white/50 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              disabled={isLoading}
            />
            <GlassButton
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default AIAgent;
