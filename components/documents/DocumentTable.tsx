import React, { useMemo, useState } from 'react';
import type { EmployeeDocument, Employee } from '../../types';
import TrashIcon from '../icons/TrashIcon';
import ShareIcon from '../icons/ShareIcon';
import EmptyState from '../common/EmptyState.tsx';
import { useToasts } from '../../hooks/useToasts.tsx';
import DocumentIcon from '../icons/DocumentIcon.tsx';

interface DocumentTableProps {
  documents: EmployeeDocument[];
  employees: Employee[];
  onDelete: (document: EmployeeDocument) => void;
  onAdd: () => void;
}

const getStatus = (expiryDate: string): { text: string; color: string } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    if (expiry < today) {
        return { text: 'Expired', color: 'bg-red-500/10 text-red-700 dark:text-red-400 dark:bg-red-500/20' };
    }
    if (expiry <= thirtyDaysFromNow) {
        return { text: 'Expiring Soon', color: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 dark:bg-yellow-500/20' };
    }
    return { text: 'Valid', color: 'bg-slate-500/10 text-slate-700 dark:text-slate-400 dark:bg-slate-500/20' };
};

const StatusBadge: React.FC<{ status: { text: string; color: string } }> = ({ status }) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
        {status.text}
    </span>
);

const formSelectClasses = "border border-border bg-secondary rounded-md shadow-sm p-2 text-foreground focus:ring-primary focus:border-primary text-sm";

const DocumentTable: React.FC<DocumentTableProps> = ({ documents, employees, onDelete, onAdd }) => {
  const { addToast } = useToasts();
  const [filters, setFilters] = useState({ employeeId: 'all', type: 'all' });
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
        const employeeMatch = filters.employeeId === 'all' || doc.employeeId === filters.employeeId;
        const typeMatch = filters.type === 'all' || doc.documentType === filters.type;
        return employeeMatch && typeMatch;
    });
  }, [documents, filters]);
  
  const handleShare = (doc: EmployeeDocument) => {
    // In a real app, this would call an API to generate a secure, short-lived URL.
    addToast(`Share link for ${doc.documentType} copied to clipboard!`, 'info');
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-md border border-border">
       <div className="flex justify-end items-center space-x-2 mb-4">
          <select name="employeeId" value={filters.employeeId} onChange={handleFilterChange} className={formSelectClasses}>
            <option value="all">All Employees</option>
            {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
          </select>
          <select name="type" value={filters.type} onChange={handleFilterChange} className={formSelectClasses}>
            <option value="all">All Types</option>
            <option>QID</option><option>Passport</option><option>Visa</option><option>Labor Contract</option><option>Other</option>
          </select>
      </div>
      {filteredDocuments.length === 0 ? (
        <EmptyState 
            icon={<DocumentIcon className="w-12 h-12" />}
            message={documents.length === 0 ? "No Documents Uploaded" : "No Documents Found"}
            description={documents.length === 0 ? "Get started by uploading an employee's QID, passport, or other documents." : "Try adjusting your filters."}
            action={documents.length === 0 ? { label: "Add Document", onClick: onAdd } : undefined}
        />
      ) : (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-muted-foreground">
            <thead className="text-xs uppercase bg-secondary text-secondary-foreground">
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
                {filteredDocuments.map((doc) => (
                <tr key={doc.id} className="border-b border-border hover:bg-muted/50">
                    <td className="px-6 py-4 font-medium text-foreground">{doc.employeeName}</td>
                    <td className="px-6 py-4">{doc.documentType}</td>
                    <td className="px-6 py-4">{new Date(doc.expiryDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center">{doc.version}</td>
                    <td className="px-6 py-4">
                        <StatusBadge status={getStatus(doc.expiryDate)} />
                    </td>
                    <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center space-x-4">
                            <button onClick={() => handleShare(doc)} className="text-muted-foreground hover:text-primary" title="Share Document">
                                <ShareIcon className="w-4 h-4" />
                            </button>
                            <button onClick={() => onDelete(doc)} className="text-destructive hover:text-destructive/80" title="Delete Document">
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