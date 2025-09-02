import React from 'react';
import type { EmployeeDocument } from '../../types';
import TrashIcon from '../icons/TrashIcon';
import ShareIcon from '../icons/ShareIcon';
import EmptyState from '../common/EmptyState';
import { useToasts } from '../../hooks/useToasts';

interface DocumentTableProps {
  documents: EmployeeDocument[];
  onDelete: (document: EmployeeDocument) => void;
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

const StatusBadge: React.FC<{ status: { text: string; color: string } }> = ({ status }) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
        {status.text}
    </span>
);


const DocumentTable: React.FC<DocumentTableProps> = ({ documents, onDelete }) => {
  const { addToast } = useToasts();
  
  const handleShare = (doc: EmployeeDocument) => {
    // In a real app, this would call an API to generate a secure, short-lived URL.
    addToast(`Share link for ${doc.documentType} copied to clipboard!`, 'info');
  };

  return (
    <div className="bg-brand-light p-6 rounded-lg shadow-md">
      {documents.length === 0 ? (
        <EmptyState 
            message="No Documents Found"
            description="Get started by uploading an employee's QID, passport, or other documents."
        />
      ) : (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                <th scope="col" className="px-6 py-3">Employee Name</th>
                <th scope="col" className="px-6 py-3">Document Type</th>
                <th scope="col" className="px-6 py-3">Expiry Date</th>
                <th scope="col" className="px-6 py-3">Version</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                </tr>
            </thead>
            <tbody>
                {documents.map((doc) => (
                <tr key={doc.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{doc.employeeName}</td>
                    <td className="px-6 py-4">{doc.documentType}</td>
                    <td className="px-6 py-4">{new Date(doc.expiryDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center">{doc.version}</td>
                    <td className="px-6 py-4">
                        <StatusBadge status={getStatus(doc.expiryDate)} />
                    </td>
                    <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-4">
                            <button onClick={() => handleShare(doc)} className="text-gray-500 hover:text-brand-primary" title="Share Document">
                                <ShareIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => onDelete(doc)} className="text-red-600 hover:text-red-800" title="Delete Document">
                                <TrashIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      )}
    </div>
  );
};

export default DocumentTable;
