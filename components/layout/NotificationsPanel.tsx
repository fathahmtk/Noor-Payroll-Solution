
import React from 'react';
import { View, type EmployeeDocument, type LeaveRequest } from '../../types';
import PendingIcon from '../icons/PendingIcon';
import VisaIcon from '../icons/VisaIcon';

interface NotificationsPanelProps {
  alerts: {
    expiringDocs: EmployeeDocument[];
    pendingLeaves: LeaveRequest[];
  };
  onClose: () => void;
  onNavigate: (view: View) => void;
}

const NotificationItem: React.FC<{ icon: React.ReactNode; text: string; onClick: () => void; }> = ({ icon, text, onClick }) => (
    <div onClick={onClick} className="flex items-center p-3 hover:bg-slate-100 cursor-pointer rounded-md">
        <div className="flex-shrink-0 mr-3 text-slate-500">{icon}</div>
        <p className="text-sm font-medium text-slate-700">{text}</p>
    </div>
);


const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ alerts, onClose, onNavigate }) => {
    const handleNavigate = (view: View) => {
        onNavigate(view);
        onClose();
    };

    const allAlerts = [
        ...alerts.pendingLeaves.map(leave => ({
            id: `leave-${leave.id}`,
            icon: <PendingIcon className="w-5 h-5" />,
            text: `Leave request from ${leave.employeeName} is pending.`,
            onClick: () => handleNavigate(View.TimeAttendance)
        })),
        ...alerts.expiringDocs.map(doc => ({
            id: `doc-${doc.id}`,
            icon: <VisaIcon className="w-5 h-5 text-red-500" />,
            text: `${doc.documentType} for ${doc.employeeName} expires soon.`,
            onClick: () => handleNavigate(View.Documents)
        })),
    ];
    
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50">
        <div className="p-4 border-b">
            <h3 className="font-semibold text-slate-800">Notifications</h3>
        </div>
        <div className="p-2 max-h-80 overflow-y-auto">
            {allAlerts.length > 0 ? (
                <div className="space-y-1">
                    {allAlerts.map(alert => (
                        <NotificationItem key={alert.id} {...alert} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 px-4">
                    <p className="text-sm text-slate-500">You're all caught up!</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default NotificationsPanel;