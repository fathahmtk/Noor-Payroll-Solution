import React, { useMemo, useState } from 'react';
import type { PettyCashTransaction, Employee } from '../../types';
import EmptyState from '../common/EmptyState';
import Button from '../common/Button';
import { updatePettyCashStatus } from '../../services/api';
import { useAppContext } from '../../AppContext';
import { useToasts } from '../../hooks/useToasts';

interface PettyCashTableProps {
    transactions: PettyCashTransaction[];
    onUpdate: () => void;
}

const formSelectClasses = "border border-border bg-secondary rounded-md shadow-sm p-2 text-foreground focus:ring-primary focus:border-primary text-sm";

const StatusBadge: React.FC<{ status: PettyCashTransaction['status'] }> = ({ status }) => {
    const colors = {
        Pending: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 dark:bg-yellow-500/20',
        Approved: 'bg-green-500/10 text-green-700 dark:text-green-400 dark:bg-green-500/20',
        Rejected: 'bg-red-500/10 text-red-700 dark:text-red-400 dark:bg-red-500/20',
    };
    return <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>{status}</span>;
};

const PettyCashTable: React.FC<PettyCashTableProps> = ({ transactions, onUpdate }) => {
    const [filters, setFilters] = useState({ department: 'all', status: 'all' });
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const { currentUser } = useAppContext();
    const { addToast } = useToasts();
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleUpdateStatus = async (id: string, status: 'Approved' | 'Rejected') => {
        if (!currentUser) return;
        setUpdatingId(id);
        try {
            await updatePettyCashStatus(currentUser.tenantId, id, status);
            addToast(`Transaction ${status.toLowerCase()}.`, 'success');
            onUpdate();
        } catch(e) {
            addToast('Failed to update status.', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const deptMatch = filters.department === 'all' || t.department === filters.department;
            const statusMatch = filters.status === 'all' || t.status === filters.status;
            return deptMatch && statusMatch;
        });
    }, [transactions, filters]);
    
    return (
        <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-foreground">Transaction Log</h3>
                 <div className="flex items-center space-x-2">
                    <select name="department" value={filters.department} onChange={handleFilterChange} className={formSelectClasses}>
                        <option value="all">All Departments</option>
                        <option>Engineering</option><option>HR</option><option>Marketing</option><option>Sales</option><option>Finance</option>
                    </select>
                    <select name="status" value={filters.status} onChange={handleFilterChange} className={formSelectClasses}>
                        <option value="all">All Statuses</option>
                        <option>Pending</option><option>Approved</option><option>Rejected</option>
                    </select>
                </div>
            </div>
            {transactions.length === 0 ? (
                <EmptyState message="No Transactions Yet" description="Petty cash requests and transactions will appear here." />
            ) : filteredTransactions.length === 0 ? (
                 <EmptyState message="No Transactions Found" description="Try adjusting your filters." />
            ) : (
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-muted-foreground">
                        <thead className="text-xs uppercase bg-secondary">
                            <tr>
                                <th scope="col" className="px-6 py-3">Date</th>
                                <th scope="col" className="px-6 py-3">Submitted By</th>
                                <th scope="col" className="px-6 py-3">Department</th>
                                <th scope="col" className="px-6 py-3">Description</th>
                                <th scope="col" className="px-6 py-3">Type</th>
                                <th scope="col" className="px-6 py-3">Amount</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map(t => (
                                <tr key={t.id} className="border-b border-border hover:bg-muted/50">
                                    <td className="px-6 py-4">{new Date(t.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 font-semibold text-foreground">{t.employeeName}</td>
                                    <td className="px-6 py-4">{t.department}</td>
                                    <td className="px-6 py-4">{t.description}</td>
                                    <td className="px-6 py-4">{t.type}</td>
                                    <td className="px-6 py-4 font-bold text-foreground">QAR {t.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4"><StatusBadge status={t.status} /></td>
                                    <td className="px-6 py-4 text-center">
                                        {t.status === 'Pending' && (
                                            <div className="flex items-center justify-center space-x-2">
                                                <Button size="sm" onClick={() => handleUpdateStatus(t.id, 'Approved')} isLoading={updatingId === t.id}>Approve</Button>
                                                <Button size="sm" variant="secondary" onClick={() => handleUpdateStatus(t.id, 'Rejected')} isLoading={updatingId === t.id}>Reject</Button>
                                            </div>
                                        )}
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

export default PettyCashTable;