import React, { useState, useEffect, useCallback } from 'react';
import { getLeaveRequests, updateLeaveRequestStatus } from '../../services/api';
import type { LeaveRequest } from '../../types.ts';
import Button from '../common/Button.tsx';
import { useToasts } from '../../hooks/useToasts.tsx';
import LoadingSpinner from '../common/LoadingSpinner.tsx';
import EmptyState from '../common/EmptyState.tsx';
import { useAppContext } from '../../AppContext.tsx';

const StatusBadge: React.FC<{ status: LeaveRequest['status'] }> = ({ status }) => {
    const colors = {
        Pending: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 dark:bg-yellow-500/20',
        Approved: 'bg-green-500/10 text-green-700 dark:text-green-400 dark:bg-green-500/20',
        Rejected: 'bg-red-500/10 text-red-700 dark:text-red-400 dark:bg-red-500/20',
    };
    return (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>
            {status}
        </span>
    );
};

const LeaveRequests: React.FC = () => {
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const { addToast } = useToasts();
    const { currentUser } = useAppContext();

    const fetchRequests = useCallback(async () => {
        if (!currentUser?.tenantId) return;
        setLoading(true);
        const data = await getLeaveRequests(currentUser.tenantId);
        setRequests(data);
        setLoading(false);
    }, [currentUser]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleUpdateStatus = async (requestId: string, status: 'Approved' | 'Rejected') => {
        if (!currentUser?.tenantId) return;
        setUpdatingId(requestId);
        try {
            await updateLeaveRequestStatus(currentUser.tenantId, requestId, status);
            addToast(`Leave request has been ${status.toLowerCase()}.`, 'success');
            await fetchRequests(); // Refetch to get the latest data including updated balances
        } catch (error) {
            console.error("Failed to update status:", error);
            addToast('Failed to update leave request status.', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-4">
             <div className="bg-card rounded-lg shadow-md overflow-x-auto border border-border">
                {requests.length === 0 ? (
                    <EmptyState message="No Leave Requests" description="There are currently no pending or historical leave requests." />
                ) : (
                    <table className="w-full text-sm text-left text-muted-foreground">
                        <thead className="text-xs uppercase bg-secondary">
                            <tr>
                                <th scope="col" className="px-6 py-3">Employee</th>
                                <th scope="col" className="px-6 py-3">Dates</th>
                                <th scope="col" className="px-6 py-3">Type</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req) => (
                                <tr key={req.id} className="border-b border-border hover:bg-muted/50">
                                    <td className="px-6 py-4 font-semibold text-foreground">{req.employeeName}</td>
                                    <td className="px-6 py-4">{`${new Date(req.startDate).toLocaleDateString()} - ${new Date(req.endDate).toLocaleDateString()}`}</td>
                                    <td className="px-6 py-4">{req.leaveType}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={req.status} />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {req.status === 'Pending' && (
                                            <div className="flex items-center justify-center space-x-2">
                                                <Button size="sm" onClick={() => handleUpdateStatus(req.id, 'Approved')} isLoading={updatingId === req.id}>Approve</Button>
                                                <Button size="sm" variant="danger" onClick={() => handleUpdateStatus(req.id, 'Rejected')} isLoading={updatingId === req.id}>Reject</Button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default LeaveRequests;