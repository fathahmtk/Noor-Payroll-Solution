import React, { useState, useRef, useEffect } from 'react';
import type { User } from '../../types';
import { getHRAssistantResponse } from '../../services/geminiService';
import Button from '../common/Button';
import SparklesIcon from '../icons/SparklesIcon';

interface AIAssistantProps {
    user: User;
}

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
}

const AIAssistant: React.FC<AIAssistantProps> = ({ user }) => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hello! I'm your AI HR Assistant. How can I help you today?", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const userMessage: Message = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const aiResponse = await getHRAssistantResponse(input);
            const aiMessage: Message = { id: Date.now() + 1, text: aiResponse, sender: 'ai' };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: Message = { id: Date.now() + 1, text: "Sorry, I'm having trouble connecting right now.", sender: 'ai' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="bg-brand-light p-4 rounded-lg shadow-md h-full flex flex-col">
            <div className="flex items-center border-b pb-2 mb-4">
                <SparklesIcon className="w-5 h-5 mr-2 text-brand-primary" />
                <h3 className="text-lg font-semibold text-brand-dark">AI HR Assistant</h3>
            </div>
            <div className="flex-grow overflow-y-auto pr-2 mb-4 space-y-4 h-64">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-brand-primary"/></div>}
                        <div className={`px-4 py-2 rounded-xl max-w-xs ${msg.sender === 'user' ? 'bg-brand-primary text-white rounded-br-none' : 'bg-slate-100 text-brand-dark rounded-bl-none'}`}>
                            <p className="text-sm">{msg.text}</p>
                        </div>
                         {msg.sender === 'user' && <img src={user.avatarUrl} alt="user" className="w-8 h-8 rounded-full"/>}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-end gap-2 justify-start">
                        <div className="w-8 h-8 rounded-full bg-brand-primary/20 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-brand-primary"/></div>
                        <div className="px-4 py-2 rounded-xl bg-slate-100 text-brand-dark rounded-bl-none">
                            <div className="flex items-center space-x-1">
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-0"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300"></span>
                            </div>
                        </div>
                    </div>
                 )}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex items-center border-t pt-2">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSend()}
                    placeholder="Ask a question..."
                    className="flex-grow border border-slate-300 rounded-lg p-2 text-sm focus:ring-brand-primary focus:border-brand-primary"
                    disabled={isLoading}
                />
                <Button onClick={handleSend} isLoading={isLoading} className="ml-2">
                    Send
                </Button>
            </div>
        </div>
    );
};

export default AIAssistant;
