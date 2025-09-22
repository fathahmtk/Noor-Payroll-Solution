
import React, { useState } from 'react';
import { generateHRPolicy } from '../../services/geminiService';
import Button from '../common/Button';
import SparklesIcon from '../icons/SparklesIcon';
import CopyIcon from '../icons/CopyIcon';
import { useToasts } from '../../hooks/useToasts';

const AIPolicyWriter: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [policy, setPolicy] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copyButtonText, setCopyButtonText] = useState('Copy');
    const [liveRegionText, setLiveRegionText] = useState('');
    const { addToast } = useToasts();


    const handleGenerate = async () => {
        if (!topic) return;
        setIsLoading(true);
        setPolicy('');
        setLiveRegionText(`Generating policy for ${topic}. Please wait.`);
        const result = await generateHRPolicy(topic);
        setPolicy(result);
        setIsLoading(false);
        setLiveRegionText(`Policy for ${topic} has been generated.`);
    };

    const handleCopy = () => {
        if (!policy) return;
        navigator.clipboard.writeText(policy).then(() => {
            addToast('Policy copied to clipboard!', 'success');
            setCopyButtonText('Copied!');
            setTimeout(() => setCopyButtonText('Copy'), 2000);
        }).catch(err => {
            addToast('Failed to copy policy.', 'error');
            console.error('Failed to copy text: ', err);
        });
    };

    return (
        <div className="bg-card p-6 rounded-lg shadow-md max-w-4xl mx-auto space-y-6 border border-border">
            <div>
                <h3 className="text-xl font-bold text-foreground mb-2">AI-Powered HR Policy Writer</h3>
                <p className="text-sm text-muted-foreground">Enter a topic (e.g., "Remote Work Policy", "Employee Code of Conduct") and let our AI assistant generate a professional policy draft for your company.</p>
            </div>
            <div className="flex items-center space-x-2">
                <input 
                    type="text"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    placeholder="Enter policy topic..."
                    className="flex-grow bg-secondary border border-border rounded-lg p-2 text-sm focus:ring-primary focus:border-primary text-foreground"
                    aria-label="Policy Topic"
                />
                <Button onClick={handleGenerate} isLoading={isLoading} icon={<SparklesIcon />}>
                    Generate Policy
                </Button>
            </div>
            
            <div className="sr-only" aria-live="polite" role="status">
                {liveRegionText}
            </div>

            {(isLoading || policy) && (
                <div className="mt-6 p-4 border border-border rounded-lg bg-secondary relative">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold text-foreground">Generated Policy Draft</h4>
                        {policy && !isLoading && (
                            <Button variant="secondary" size="sm" onClick={handleCopy} icon={<CopyIcon className="w-4 h-4"/>}>
                                {copyButtonText}
                            </Button>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="space-y-2" aria-hidden="true">
                           <div className="w-full h-4 bg-muted rounded animate-pulse"></div>
                           <div className="w-3/4 h-4 bg-muted rounded animate-pulse"></div>
                           <div className="w-full h-4 bg-muted rounded animate-pulse"></div>
                           <div className="w-1/2 h-4 bg-muted rounded animate-pulse"></div>
                        </div>
                    ) : (
                        <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">{policy}</pre>
                    )}
                </div>
            )}
        </div>
    );
};

export default AIPolicyWriter;