

import React from 'react';
import { useDataFetching } from '../../hooks/useDataFetching';
import { getLeaveRequests, getDocuments } from '../../services/api';
import type { LeaveRequest, EmployeeDocument } from '../../types';
import { View } from '../../types';
import VisaIcon from '../icons/VisaIcon';
import PendingIcon from '../icons/PendingIcon';
import ComplianceIcon from '../icons/ComplianceIcon.tsx';
import { useAppContext } from '../../AppContext';

interface Alert {
  id: string;
  message: string;
  type: 'warning' | 'danger';
  icon: React.ReactNode;
  targetView: View;
}

interface AlertsProps {
  onNavigate: (view: View) => void;
}

const Alerts: React.FC<AlertsProps> = ({ onNavigate }) => {
  const { currentUser } = useAppContext();
  const { data: leaveRequests, loading: loadingLeave } = useDataFetching(currentUser ? `leaveRequests-${currentUser!.tenantId}` : null, () => getLeaveRequests(currentUser!.tenantId));
  const { data: documents, loading: loadingDocs } = useDataFetching(currentUser ? `documents-${currentUser!.tenantId}` : null, () => getDocuments(currentUser!.tenantId));

  const alerts = React.useMemo(() => {
    const allAlerts: Alert[] = [];

    const pendingLeaves = (leaveRequests || []).filter(req => req.status === 'Pending');
    if (pendingLeaves.length > 0) {
      allAlerts.push({
        id: 'pending-leaves',
        message: `${pendingLeaves.length} leave request(s) waiting for approval.`,
        type: 'warning',
        icon: <PendingIcon className="w-5 h-5" />,
        targetView: View.TimeAttendance,
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    const expiringDocs = (documents || []).filter(doc => {
        if (!doc.expiryDate) return false;
        const expiry = new Date(doc.expiryDate);
        return expiry < thirtyDaysFromNow;
    });

    expiringDocs.forEach(doc => {
        const expiry = new Date(doc.expiryDate);
        const isExpired = expiry < today;
        allAlerts.push({
            id: doc.id,
            message: `${doc.documentType} for ${doc.employeeName} ${isExpired ? 'has expired' : 'expires soon'}.`,
            type: isExpired ? 'danger' : 'warning',
            icon: <VisaIcon className="w-5 h-5" />,
            targetView: View.Documents,
        });
    });

    return allAlerts;
  }, [leaveRequests, documents]);

  const loading = loadingLeave || loadingDocs;

  return (
    <div className="bg-brand-light p-5 rounded-xl border border-slate-700">
      <div className="flex items-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-nav-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <div>
          <h3 className="text-base font-bold text-brand-dark">Alerts & Notifications</h3>
          <p className="text-xs text-nav-icon">Important items requiring attention</p>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center py-10 text-nav-text">Loading alerts...</div>
      ) : alerts.length > 0 ? (
        <div className="space-y-2">
          {alerts.map(alert => (
            <div 
              key={alert.id} 
              onClick={() => onNavigate(alert.targetView)}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                alert.type === 'danger' ? 'bg-red-900/50 hover:bg-red-800/50 text-red-300' : 'bg-brand-secondary hover:bg-slate-700 text-nav-text'
              }`}
            >
              <div className="flex-shrink-0 mr-3">{alert.icon}</div>
              <p className="text-sm font-medium">{alert.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center text-nav-text py-10">
          <div className="p-3 rounded-full bg-brand-secondary mb-3">
             <ComplianceIcon className="h-6 w-6 text-nav-icon" />
          </div>
          <p className="text-sm font-medium">No urgent alerts at this time</p>
        </div>
      )}
    </div>
  );
};

export default Alerts;