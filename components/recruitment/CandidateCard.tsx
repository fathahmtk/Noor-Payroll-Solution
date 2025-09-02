import React, { useState } from 'react';
import type { Candidate, CandidateStatus } from '../../types';
import PencilIcon from '../icons/PencilIcon';

interface CandidateCardProps {
    candidate: Candidate;
    onStatusChange: (candidateId: string, newStatus: CandidateStatus) => void;
}

const STAGES: CandidateStatus[] = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onStatusChange }) => {
    const [isEditing, setIsEditing] = useState(false);

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onStatusChange(candidate.id, e.target.value as CandidateStatus);
        setIsEditing(false);
    };

    return (
        <div className="bg-white p-3 rounded-md shadow-sm border border-slate-200">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                    <img src={candidate.avatarUrl} alt={candidate.name} className="w-10 h-10 rounded-full" />
                    <div>
                        <p className="text-sm font-bold text-slate-800">{candidate.name}</p>
                        <p className="text-xs text-slate-500">{candidate.jobTitle}</p>
                    </div>
                </div>
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="p-1 text-slate-400 hover:text-brand-primary">
                        <PencilIcon className="w-3 h-3"/>
                    </button>
                ) : (
                    <select
                        value={candidate.status}
                        onChange={handleSelectChange}
                        onBlur={() => setIsEditing(false)}
                        className="text-xs border-slate-300 rounded p-1"
                        autoFocus
                    >
                        {STAGES.map(stage => (
                            <option key={stage} value={stage}>{stage}</option>
                        ))}
                    </select>
                )}
            </div>
            <div className="text-xs text-slate-400 mt-2">
                Applied: {new Date(candidate.appliedDate).toLocaleDateString()}
            </div>
        </div>
    );
};

export default CandidateCard;
