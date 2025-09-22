import React, { useState, useRef, useEffect } from 'react';
import { getAppSupportResponse } from '../../services/geminiService';
import Button from '../common/Button';
import SparklesIcon from '../icons/SparklesIcon';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'ai';
}

const AISupportTab: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, text: "Hello! I'm your AI support assistant. Ask me how to use any feature in Noor HR.", sender: 'ai' }
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
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const aiResponse = await getAppSupportResponse(currentInput);
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
        <div className="bg-card p-4 rounded-lg shadow-md h-full flex flex-col border border-border">
            <div className="flex-grow overflow-y-auto p-4 space-y-4 h-[60vh]">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0"><SparklesIcon className="w-5 h-5 text-primary"/></div>}
                        <div className={`px-4 py-2 rounded-xl max-w-md text-sm ${msg.sender === 'user' ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-secondary text-secondary-foreground rounded-bl-none'}`}>
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
                        placeholder="e.g., How do I run payroll?"
                        className="flex-grow bg-transparent border-none p-3 text-sm focus:ring-0 text-foreground placeholder-muted-foreground"
                        disabled={isLoading}
                    />
                    <Button onClick={handleSend} isLoading={isLoading} className="m-1" disabled={!input.trim()}>
                        Send
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default AISupportTab;