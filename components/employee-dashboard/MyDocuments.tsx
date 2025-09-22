import React from 'react';
import { useDataFetching } from '../../hooks/useDataFetching';
import { getEmployeeDocuments } from '../../services/api';
import type { EmployeeDocument } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import DocumentIcon from '../icons/DocumentIcon';
import { useAppContext } from '../../AppContext';

interface MyDocumentsProps {
  employeeId: string;
}

const getStatus = (expiryDate: string): { text: string; color: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    if (expiry < today) {
        return { text: 'Expired', color: 'bg-red-500/10 text-red-400' };
    }
    if (expiry <= thirtyDaysFromNow) {
        return { text: 'Expiring Soon', color: 'bg-yellow-500/10 text-yellow-400' };
    }
    return { text: 'Valid', color: 'bg-muted text-muted-foreground' };
};

const MyDocuments: React.FC<MyDocumentsProps> = ({ employeeId }) => {
  const { currentUser } = useAppContext();
  const { data: documents, loading } = useDataFetching(
    currentUser ? `employeeDocs-${currentUser.tenantId}-${employeeId}` : null,
    () => getEmployeeDocuments(currentUser!.tenantId, employeeId)
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-card p-6 rounded-lg shadow-md border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4">My Documents</h3>
      {(documents || []).length > 0 ? (
        <ul className="space-y-3">
          {(documents || []).map(doc => (
            <li key={doc.id} className="flex items-center justify-between p-3 bg-secondary border border-border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center">
                 <DocumentIcon className="w-6 h-6 mr-4 text-primary" />
                 <div>
                    <p className="font-semibold text-foreground">{doc.documentType}</p>
                    <p className="text-xs text-muted-foreground">Expires on: {new Date(doc.expiryDate).toLocaleDateString()}</p>
                 </div>
              </div>
              <div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatus(doc.expiryDate).color}`}>
                    {getStatus(doc.expiryDate).text}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState message="No Documents Found" description="Your personal documents will appear here once uploaded by HR." />
      )}
    </div>
  );
};

export default MyDocuments;