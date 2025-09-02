import React, { useState, useEffect, useCallback } from 'react';
import { getLeaveRequests, updateLeaveRequestStatus } from '../../services/api';
import type { LeaveRequest } from '../../types';
import Button from '../common/Button';
import { useToasts } from '../../hooks/useToasts';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { useAppContext } from '../../AppContext';

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

    const StatusBadge: React.FC<{ status: LeaveRequest['status'] }> = ({ status }) => {
        const colors = {
            Pending: 'bg-yellow-100 text-yellow-800',
            Approved: 'bg-green-100 text-green-800',
            Rejected: 'bg-red-100 text-red-800',
        };
        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-4">
             <div className="bg-brand-light rounded-lg shadow-md overflow-x-auto">
                {requests.length === 0 ? (
                    <EmptyState message="No Leave Requests" description="There are currently no pending or historical leave requests." />
                ) : (
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
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
                                <tr key={req.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-semibold text-gray-900">{req.employeeName}</td>
                                    <td className="px-6 py-4">{`${new Date(req.startDate).toLocaleDateString()} - ${new Date(req.endDate).toLocaleDateString()}`}</td>
                                    <td className="px-6 py-4">{req.leaveType}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={req.status} />
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {req.status === 'Pending' && (
                                            <div className="flex items-center justify-center space-x-2">
                                                <Button size="sm" onClick={() => handleUpdateStatus(req.id, 'Approved')} isLoading={updatingId === req.id}>Approve</Button>
                                                <Button size="sm" variant="secondary" onClick={() => handleUpdateStatus(req.id, 'Rejected')} isLoading={updatingId === req.id}>Reject</Button>
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
