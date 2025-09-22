import React from 'react';
import { useDataFetching } from '../../hooks/useDataFetching';
import { getManagerDashboardData, updateLeaveRequestStatus } from '../../services/api';
import { useAppContext } from '../../AppContext';
import LoadingSpinner from '../common/LoadingSpinner';
import StatCard from '../dashboard/StatCard';
import EmployeesIcon from '../icons/EmployeesIcon';
import PendingIcon from '../icons/PendingIcon';
import Button from '../common/Button';
import { useToasts } from '../../hooks/useToasts';
import EmptyState from '../common/EmptyState';

const ManagerDashboardView: React.FC = () => {
    const { currentUser } = useAppContext();
    const { addToast } = useToasts();
    
    const { data, loading, refresh } = useDataFetching(
        currentUser?.employeeId ? `managerDashboard-${currentUser.employeeId}` : null,
        () => getManagerDashboardData(currentUser!.tenantId, currentUser!.employeeId!)
    );

    const [updatingId, setUpdatingId] = React.useState<string | null>(null);

    const handleUpdateLeaveStatus = async (requestId: string, status: 'Approved' | 'Rejected') => {
        if (!currentUser) return;
        setUpdatingId(requestId);
        try {
            await updateLeaveRequestStatus(currentUser.tenantId, requestId, status);
            addToast(`Leave request has been ${status.toLowerCase()}.`, 'success');
            await refresh();
        } catch (error) {
            addToast('Failed to update leave status.', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const { directReports = [], pendingLeaveRequests = [] } = data || {};

    return (
        <div className="p-8 space-y-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Direct Reports" 
                  value={directReports.length} 
                  subtitle="team members" 
                  icon={<EmployeesIcon className="w-6 h-6"/>} 
                  iconBgColor="#60a5fa" 
                />
                <StatCard 
                  title="Pending Approvals" 
                  value={pendingLeaveRequests.length} 
                  subtitle="leave requests" 
                  icon={<PendingIcon className="w-6 h-6"/>} 
                  iconBgColor="#f59e0b" 
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pending Approvals Card */}
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Pending Leave Requests</h3>
                    {pendingLeaveRequests.length > 0 ? (
                        <div className="space-y-3">
                            {pendingLeaveRequests.map(req => (
                                <div key={req.id} className="p-3 bg-secondary rounded-lg flex justify-between items-center">
                                    <div>
                                        <p className="font-semibold text-foreground">{req.employeeName}</p>
                                        <p className="text-sm text-muted-foreground">{req.leaveType} Leave: {new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button size="sm" onClick={() => handleUpdateLeaveStatus(req.id, 'Approved')} isLoading={updatingId === req.id}>Approve</Button>
                                        <Button size="sm" variant="secondary" onClick={() => handleUpdateLeaveStatus(req.id, 'Rejected')} isLoading={updatingId === req.id}>Reject</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState message="No pending requests" description="You're all caught up!"/>
                    )}
                </div>

                {/* Team Members Card */}
                <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
                    <h3 className="text-lg font-semibold text-foreground mb-4">My Team</h3>
                     {directReports.length > 0 ? (
                        <div className="space-y-3">
                            {directReports.map(emp => (
                                <div key={emp.id} className="p-3 bg-secondary rounded-lg flex items-center space-x-4">
                                    <img src={emp.avatarUrl} alt={emp.name} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <p className="font-semibold text-foreground">{emp.name}</p>
                                        <p className="text-sm text-muted-foreground">{emp.position}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState message="No direct reports" description="Team members assigned to you will appear here."/>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManagerDashboardView;