import React, { useState, useMemo, useCallback } from 'react';
import { useDataFetching } from '../../hooks/useDataFetching';
import { getCandidates, getJobOpenings, updateCandidateStatus } from '../../services/api';
import type { Candidate, CandidateStatus, JobOpening } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import KanbanColumn from './KanbanColumn';
import { useAppContext } from '../../AppContext';
import { useToasts } from '../../hooks/useToasts';

const STAGES: CandidateStatus[] = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

const CandidatePipeline: React.FC = () => {
    const { currentUser } = useAppContext();
    const { addToast } = useToasts();
    const { data: candidates, loading: loadingCandidates, refresh: refreshCandidates } = useDataFetching(() => getCandidates(currentUser!.tenantId));
    const { data: jobOpenings, loading: loadingJobs } = useDataFetching(() => getJobOpenings(currentUser!.tenantId));
    
    const [selectedJobId, setSelectedJobId] = useState<string>('all');

    const handleStatusChange = async (candidateId: string, newStatus: CandidateStatus) => {
        try {
            await updateCandidateStatus(currentUser!.tenantId, candidateId, newStatus);
            addToast('Candidate status updated.', 'success');
            refreshCandidates();
        } catch (error) {
            addToast('Failed to update status.', 'error');
        }
    };
    
    const filteredCandidates = useMemo(() => {
        if (selectedJobId === 'all') {
            return candidates || [];
        }
        return (candidates || []).filter(c => c.jobOpeningId === selectedJobId);
    }, [candidates, selectedJobId]);

    const groupedCandidates = useMemo(() => {
        const groups: Record<CandidateStatus, Candidate[]> = {
            Applied: [], Screening: [], Interview: [], Offer: [], Hired: [], Rejected: [],
        };
        filteredCandidates.forEach(candidate => {
            groups[candidate.status]?.push(candidate);
        });
        return groups;
    }, [filteredCandidates]);

    const loading = loadingCandidates || loadingJobs;

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-4">
                <label htmlFor="jobFilter" className="font-semibold">Filter by Job:</label>
                <select 
                    id="jobFilter"
                    value={selectedJobId}
                    onChange={e => setSelectedJobId(e.target.value)}
                    className="border border-slate-300 rounded-lg shadow-sm p-2 bg-white"
                >
                    <option value="all">All Open Jobs</option>
                    {(jobOpenings || []).filter(j => j.status === 'Open').map(job => (
                        <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                </select>
            </div>
            
            {loading ? <LoadingSpinner /> : (
                <div className="flex space-x-4 overflow-x-auto pb-4">
                    {STAGES.map(stage => (
                        <KanbanColumn 
                            key={stage}
                            title={stage}
                            candidates={groupedCandidates[stage]}
                            onStatusChange={handleStatusChange}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CandidatePipeline;
