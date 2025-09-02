import React from 'react';
import { useDataFetching } from '../../hooks/useDataFetching';
import { getJobOpenings } from '../../services/api';
import type { JobOpening } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';
import PlusIcon from '../icons/PlusIcon';
import { useAppContext } from '../../AppContext';

const JobOpenings: React.FC = () => {
    const { currentUser, openModal } = useAppContext();
    const { data: jobOpenings, loading, refresh } = useDataFetching(() => getJobOpenings(currentUser!.tenantId));

    const handleAddCandidate = (job: JobOpening) => {
        openModal('addCandidate', { jobOpening: job, onUpdate: refresh });
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="bg-brand-light p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-brand-dark mb-4">Current Job Openings</h3>
            {(jobOpenings || []).length === 0 ? (
                <EmptyState 
                    message="No Job Openings"
                    description="Get started by posting a new job."
                />
            ) : (
                <div className="space-y-4">
                    {(jobOpenings || []).map(job => (
                        <div key={job.id} className="p-4 border rounded-lg flex justify-between items-center hover:bg-slate-50">
                            <div>
                                <h4 className="font-bold text-brand-dark">{job.title}</h4>
                                <p className="text-sm text-slate-500">{job.department} &middot; {job.location}</p>
                                <p className="text-xs text-slate-400 mt-1">Posted on: {new Date(job.datePosted).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    job.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
                                }`}>
                                    {job.status}
                                </span>
                                {job.status === 'Open' && (
                                    <Button size="sm" variant="secondary" icon={<PlusIcon />} onClick={() => handleAddCandidate(job)}>
                                        Add Candidate
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default JobOpenings;
