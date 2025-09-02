import React from 'react';
import { useDataFetching } from '../../hooks/useDataFetching';
import { getAlerts } from '../../services/api';
import { View } from '../../types';
import SparklesIcon from '../icons/SparklesIcon';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAppContext } from '../../AppContext';

interface AIInsightsProps {
  onNavigate: (view: View) => void;
}

const AIInsights: React.FC<AIInsightsProps> = ({ onNavigate }) => {
  const { currentUser } = useAppContext();
  const { data: alerts, loading } = useDataFetching(() => getAlerts(currentUser!.tenantId));

  const insights = React.useMemo(() => {
    if (!alerts) return [];
    
    const allInsights = [];
    if (alerts.pendingLeaves.length > 0) {
      allInsights.push({
        id: 'insight-leave',
        title: 'Pending Approvals',
        description: `There are ${alerts.pendingLeaves.length} leave requests that require your attention.`,
        actionText: 'Review Requests',
        targetView: View.TimeAttendance,
      });
    }
    if (alerts.expiringDocs.length > 0) {
      allInsights.push({
        id: 'insight-docs',
        title: 'Document Renewals',
        description: `${alerts.expiringDocs.length} important document(s) are expiring soon.`,
        actionText: 'View Documents',
        targetView: View.Documents,
      });
    }
    // You can add more complex, simulated insights here in the future
    return allInsights;
  }, [alerts]);

  return (
    <div className="bg-brand-light p-5 rounded-xl border border-gray-200">
      <div className="flex items-center mb-4">
        <SparklesIcon className="w-5 h-5 mr-2 text-brand-primary" />
        <div>
          <h3 className="text-base font-bold text-brand-dark">AI Insights</h3>
          <p className="text-xs text-gray-400">Proactive recommendations</p>
        </div>
      </div>
      
      {loading ? (
        <div className="py-5"><LoadingSpinner /></div>
      ) : insights.length > 0 ? (
        <div className="space-y-3">
          {insights.map(insight => (
            <div 
              key={insight.id} 
              className="bg-brand-primary-light/50 p-3 rounded-lg"
            >
              <h4 className="font-semibold text-sm text-brand-dark">{insight.title}</h4>
              <p className="text-xs text-slate-600 my-1">{insight.description}</p>
              <button
                onClick={() => onNavigate(insight.targetView)}
                className="text-xs font-bold text-brand-primary hover:underline"
              >
                {insight.actionText} &rarr;
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-6">
          <p className="text-sm font-medium">No critical insights at this time.</p>
        </div>
      )}
    </div>
  );
};

export default AIInsights;
