import React, { useState } from 'react';
import type { Candidate, CandidateStatus } from '../../types';
import PencilIcon from '../icons/PencilIcon';

interface CandidateCardProps {
    candidate: Candidate;
    onStatusChange: (candidateId: string, newStatus: CandidateStatus) => void;
    onViewDetails: (candidate: Candidate) => void;
}

const STAGES: CandidateStatus[] = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onStatusChange, onViewDetails }) => {
    const [isEditing, setIsEditing] = useState(false);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onStatusChange(candidate.id, e.target.value as CandidateStatus);
        setIsEditing(false);
    };

    return (
        <div 
            className="bg-card p-3 rounded-md shadow-sm border border-border cursor-pointer hover:bg-muted/50"
            onClick={() => onViewDetails(candidate)}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                    <img src={candidate.avatarUrl} alt={candidate.name} className="w-10 h-10 rounded-full" />
                    <div>
                        <p className="text-sm font-bold text-foreground">{candidate.name}</p>
                        <p className="text-xs text-muted-foreground">{candidate.jobTitle}</p>
                    </div>
                </div>
                <div onClick={e => e.stopPropagation()}>
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="p-1 text-muted-foreground hover:text-primary">
                            <PencilIcon className="w-3 h-3"/>
                        </button>
                    ) : (
                        <select
                            value={candidate.status}
                            onChange={handleSelectChange}
                            onBlur={() => setIsEditing(false)}
                            className="text-xs border-border bg-secondary rounded p-1"
                            autoFocus
                        >
                            {STAGES.map(stage => (
                                <option key={stage} value={stage}>{stage}</option>
                            ))}
                        </select>
                    )}
                </div>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
                Applied: {new Date(candidate.appliedDate).toLocaleDateString()}
            </div>
        </div>
    );
};

export default CandidateCard;