
import React from 'react';
import { useDataFetching } from '../../hooks/useDataFetching.ts';
import { getAlerts } from '../../services/api.ts';
import { View } from '../../types.ts';
import SparklesIcon from '../icons/SparklesIcon.tsx';
import SkeletonLoader from '../common/SkeletonLoader.tsx';
import { useAppContext } from '../../AppContext.tsx';
import Card from '../common/Card.tsx';

interface AIInsightsProps {
  onNavigate: (view: View) => void;
  isLoading?: boolean;
}

const AIInsights: React.FC<AIInsightsProps> = ({ onNavigate, isLoading }) => {
  const { currentUser } = useAppContext();
  const { data: alerts } = useDataFetching(currentUser ? `ai-insights-alerts-${currentUser!.tenantId}` : null, () => getAlerts(currentUser!.tenantId));

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
    <Card
        title="AI Insights"
        subtitle="Proactive recommendations"
        icon={<SparklesIcon className="w-6 h-6 text-primary" />}
    >
      {isLoading ? (
        <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
                 <div key={i} className="bg-secondary p-3 rounded-lg">
                    <SkeletonLoader className="h-4 w-1/3 mb-2" />
                    <SkeletonLoader className="h-3 w-full mb-2" />
                    <SkeletonLoader className="h-3 w-1/4" />
                </div>
            ))}
        </div>
      ) : insights.length > 0 ? (
        <div className="space-y-3">
          {insights.map(insight => (
            <div 
              key={insight.id} 
              className="bg-secondary p-3 rounded-lg"
            >
              <h4 className="font-semibold text-sm text-foreground">{insight.title}</h4>
              <p className="text-xs text-muted-foreground my-1">{insight.description}</p>
              <button
                onClick={() => onNavigate(insight.targetView)}
                className="text-xs font-bold text-primary hover:underline"
              >
                {insight.actionText} &rarr;
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-6">
          <p className="text-sm font-medium">No critical insights at this time.</p>
        </div>
      )}
    </Card>
  );
};

export default AIInsights;