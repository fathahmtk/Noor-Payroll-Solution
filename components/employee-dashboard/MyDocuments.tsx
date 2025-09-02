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
        return { text: 'Expired', color: 'bg-red-100 text-red-800' };
    }
    if (expiry <= thirtyDaysFromNow) {
        return { text: 'Expiring Soon', color: 'bg-gray-200 text-gray-800' };
    }
    return { text: 'Valid', color: 'bg-gray-100 text-gray-700' };
};

const MyDocuments: React.FC<MyDocumentsProps> = ({ employeeId }) => {
  const { currentUser } = useAppContext();
  const { data: documents, loading } = useDataFetching(() => getEmployeeDocuments(currentUser!.tenantId, employeeId));

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-brand-light p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-brand-dark mb-4">My Documents</h3>
      {(documents || []).length > 0 ? (
        <ul className="space-y-3">
          {(documents || []).map(doc => (
            <li key={doc.id} className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-slate-50 transition-colors">
              <div className="flex items-center">
                 <DocumentIcon className="w-6 h-6 mr-4 text-brand-primary" />
                 <div>
                    <p className="font-semibold text-brand-dark">{doc.documentType}</p>
                    <p className="text-xs text-slate-500">Expires on: {new Date(doc.expiryDate).toLocaleDateString()}</p>
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
