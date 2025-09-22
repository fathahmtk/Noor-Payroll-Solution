import React, { useState, useMemo } from 'react';
import { useDataFetching } from '../../hooks/useDataFetching';
import { getLeaveBalances, updateLeaveBalance as apiUpdateBalance } from '../../services/api';
import type { LeaveBalance, LeaveBalanceDetail, LeaveType } from '../../types';
import PencilIcon from '../icons/PencilIcon';
import EditLeaveBalanceModal from './EditLeaveBalanceModal';
import { useToasts } from '../../hooks/useToasts';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { useAppContext } from '../../AppContext';

const LeaveBalances: React.FC = () => {
    const { currentUser } = useAppContext();
    const { data: balances, loading, refresh: fetchBalances } = useDataFetching(
        currentUser ? `leaveBalances-${currentUser.tenantId}` : null,
        () => getLeaveBalances(currentUser!.tenantId)
    );
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBalance, setSelectedBalance] = useState<LeaveBalance | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { addToast } = useToasts();

    const handleOpenEditModal = (balance: LeaveBalance) => {
        setSelectedBalance(balance);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedBalance(null);
    };

    const handleUpdateBalance = async (updatedBalance: LeaveBalance) => {
        if (!currentUser?.tenantId) return;
        setIsSubmitting(true);
        try {
            await apiUpdateBalance(currentUser.tenantId, updatedBalance);
            addToast(`Balances for ${updatedBalance.employeeName} updated.`, 'success');
            handleCloseModal();
            await fetchBalances();
        } catch (error) {
            addToast('Failed to update balances.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const allLeaveTypes = useMemo(() => {
        if (!balances || balances.length === 0) return [];
        const types = new Set<LeaveType>();
        balances.forEach(balance => {
            balance.balances.forEach(detail => {
                types.add(detail.leaveType);
            });
        });
        return Array.from(types).sort(); // Sort for consistent order
    }, [balances]);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="space-y-4">
            <div className="bg-card rounded-lg shadow-md overflow-x-auto border border-border">
                {(balances || []).length > 0 ? (
                    <table className="w-full text-sm text-left text-muted-foreground">
                        <thead className="text-xs text-muted-foreground uppercase bg-secondary">
                            <tr>
                                <th scope="col" className="px-6 py-3">Employee Name</th>
                                {allLeaveTypes.map(type => (
                                    <th key={type} scope="col" className="px-6 py-3 text-center">{type} Leave (Available)</th>
                                ))}
                                <th scope="col" className="px-6 py-3 text-center">Total Leave Taken</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(balances || []).map((balance) => {
                                const balanceMap = new Map(balance.balances.map(b => [b.leaveType, b]));
                                return (
                                    <tr key={balance.id} className="border-b border-border hover:bg-muted/50">
                                        <td className="px-6 py-4 font-semibold text-foreground">{balance.employeeName}</td>
                                        {allLeaveTypes.map(type => {
                                            const detail = balanceMap.get(type);
                                            if (!detail) {
                                                return <td key={type} className="px-6 py-4 text-center text-muted-foreground">-</td>;
                                            }
                                            const available = detail.totalDays - detail.usedDays;
                                            return (
                                                <td key={detail.leaveType} className="px-6 py-4">
                                                    <div className="flex flex-col text-center">
                                                        <span className="font-bold text-lg text-foreground">{available}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {detail.usedDays} used of {detail.totalDays} total
                                                        </span>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                        <td className="px-6 py-4 text-center font-semibold">
                                            {balance.balances.reduce((total, b) => total + b.usedDays, 0)} days
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => handleOpenEditModal(balance)} className="text-muted-foreground hover:text-primary p-1" title="Edit Balances">
                                                <PencilIcon className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <EmptyState message="No Leave Balances Found" description="Employee leave balance data will appear here." />
                )}
            </div>

            <EditLeaveBalanceModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                balance={selectedBalance}
                onUpdate={handleUpdateBalance}
                isSubmitting={isSubmitting}
            />
        </div>
    );
};

export default LeaveBalances;