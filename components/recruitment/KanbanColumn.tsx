import React from 'react';
import type { Candidate, CandidateStatus } from '../../types';
import CandidateCard from './CandidateCard';

interface KanbanColumnProps {
  title: CandidateStatus;
  candidates: Candidate[];
  onStatusChange: (candidateId: string, newStatus: CandidateStatus) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, candidates, onStatusChange }) => {
  return (
    <div className="bg-slate-100 rounded-lg w-72 flex-shrink-0">
      <div className="p-3 border-b">
        <h3 className="font-semibold text-sm text-slate-700">{title} ({candidates.length})</h3>
      </div>
      <div className="p-2 space-y-2 h-full overflow-y-auto">
        {candidates.map(candidate => (
          <CandidateCard 
            key={candidate.id} 
            candidate={candidate}
            onStatusChange={onStatusChange}
          />
        ))}
        {candidates.length === 0 && <div className="p-4 text-center text-xs text-slate-400">No candidates in this stage.</div>}
      </div>
    </div>
  );
};

export default KanbanColumn;
