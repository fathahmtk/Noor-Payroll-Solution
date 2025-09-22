import React from 'react';
import { useDataFetching } from '../../hooks/useDataFetching';
import { getEmployeeLeaveRequests } from '../../services/api';
import type { LeaveRequest } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { useAppContext } from '../../AppContext';
import { getDaysBetween } from '../../utils/dateUtils';

interface EmployeeLeaveHistoryTabProps {
  employeeId: string;
}

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


const EmployeeLeaveHistoryTab: React.FC<EmployeeLeaveHistoryTabProps> = ({ employeeId }) => {
  const { currentUser } = useAppContext();
  const { data: requests, loading } = useDataFetching(
    currentUser ? `employeeLeave-${currentUser.tenantId}-${employeeId}` : null,
    () => getEmployeeLeaveRequests(currentUser!.tenantId, employeeId)
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h3 className="text-lg font-semibold text-foreground mb-4">Leave History</h3>
      {(requests || []).length > 0 ? (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-muted-foreground">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary">
                    <tr>
                        <th scope="col" className="px-6 py-3">Leave Type</th>
                        <th scope="col" className="px-6 py-3">Start Date</th>
                        <th scope="col" className="px-6 py-3">End Date</th>
                        <th scope="col" className="px-6 py-3 text-center">Duration</th>
                        <th scope="col" className="px-6 py-3">Status</th>
                    </tr>
                </thead>
                <tbody>
                    {requests!.map(req => (
                        <tr key={req.id} className="border-b border-border hover:bg-muted/50">
                            <td className="px-6 py-4 font-semibold text-foreground">{req.leaveType}</td>
                            <td className="px-6 py-4">{new Date(req.startDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4">{new Date(req.endDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-center">{getDaysBetween(req.startDate, req.endDate)} days</td>
                            <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      ) : (
        <EmptyState message="No Leave History" description="This employee has not requested any leave." />
      )}
    </div>
  );
};

export default EmployeeLeaveHistoryTab;
