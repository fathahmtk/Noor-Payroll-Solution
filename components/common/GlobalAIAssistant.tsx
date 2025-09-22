import React, { useState, useRef, useEffect } from 'react';
import { getAdminAssistantResponse } from '../../services/geminiService';
import Button from './Button';
import SparklesIcon from '../icons/SparklesIcon';
import CloseIcon from '../icons/CloseIcon';
import { useFocusTrap } from '../../hooks/useFocusTrap';

interface GlobalAIAssistantProps {
    isOpen: boolean;
    onClose: () => void;
    dataContext: string;
}

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
}

const GlobalAIAssistant: React.FC<GlobalAIAssistantProps> = ({ isOpen, onClose, dataContext }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hello! I'm your AI HR Analyst. Ask me anything about your current company data.", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    useFocusTrap(panelRef, isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);
    
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
          onClose();
        }
      };
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen, onClose]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: Message = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const aiResponse = await getAdminAssistantResponse(currentInput, dataContext);
            const aiMessage: Message = { id: Date.now() + 1, text: aiResponse, sender: 'ai' };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: Message = { id: Date.now() + 1, text: "Sorry, I'm having trouble connecting right now.", sender: 'ai' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 z-[99] flex justify-end animate-fade-in" onClick={onClose}>
            <div 
              ref={panelRef}
              className={`w-full max-w-md h-full bg-card shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
              onClick={e => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="ai-assistant-title"
            >
                <div className="flex items-center justify-between border-b border-border p-4">
                    <div className="flex items-center">
                        <SparklesIcon className="w-5 h-5 mr-2 text-primary" />
                        <h3 id="ai-assistant-title" className="text-lg font-semibold text-foreground">AI HR Analyst</h3>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full text-muted-foreground hover:bg-secondary">
                        <CloseIcon />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-primary"/></div>}
                            <div className={`px-4 py-2 rounded-xl max-w-sm text-sm ${msg.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary text-secondary-foreground rounded-bl-none'}`}>
                                <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3 justify-start">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-primary"/></div>
                            <div className="px-4 py-3 rounded-xl bg-secondary text-foreground rounded-bl-none">
                                <div className="flex items-center space-x-1">
                                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-0"></span>
                                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-150"></span>
                                    <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-300"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-border">
                    <div className="flex items-center bg-secondary rounded-lg">
                        <input
                            type="text"
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyPress={e => e.key === 'Enter' && handleSend()}
                            placeholder="e.g., How many employees in Engineering?"
                            className="flex-grow bg-transparent border-none p-3 text-sm focus:ring-0 text-foreground placeholder-muted-foreground"
                            disabled={isLoading}
                        />
                        <Button onClick={handleSend} isLoading={isLoading} className="m-1" disabled={!input.trim()}>
                            Send
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalAIAssistant;