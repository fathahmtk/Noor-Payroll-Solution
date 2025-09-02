import React, { useState } from 'react';
import { useDataFetching } from '../../hooks/useDataFetching';
import { getLeaveBalances, updateLeaveBalance as apiUpdateBalance } from '../../services/api';
import type { LeaveBalance, LeaveBalanceDetail } from '../../types';
import PencilIcon from '../icons/PencilIcon';
import EditLeaveBalanceModal from './EditLeaveBalanceModal';
import { useToasts } from '../../hooks/useToasts';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';
import { useAppContext } from '../../AppContext';

const LeaveBalances: React.FC = () => {
    const { currentUser } = useAppContext();
    const { data: balances, loading, refresh: fetchBalances } = useDataFetching(() => getLeaveBalances(currentUser!.tenantId));
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

    if (loading) {
        return <LoadingSpinner />;
    }

    const leaveTypes = (balances || []).length > 0 ? balances[0].balances.map(b => b.leaveType) : [];

    return (
        <div className="space-y-4">
            <div className="bg-brand-light rounded-lg shadow-md overflow-x-auto">
                {(balances || []).length > 0 ? (
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Employee Name</th>
                                {leaveTypes.map(type => (
                                    <th key={type} scope="col" className="px-6 py-3 text-center">{type} Leave (Available)</th>
                                ))}
                                <th scope="col" className="px-6 py-3 text-center">Total Leave Taken</th>
                                <th scope="col" className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(balances || []).map((balance) => {
                                return (
                                    <tr key={balance.id} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4 font-semibold text-gray-900">{balance.employeeName}</td>
                                        {balance.balances.map((detail: LeaveBalanceDetail) => {
                                            const available = detail.totalDays - detail.usedDays;
                                            return (
                                                <td key={detail.leaveType} className="px-6 py-4">
                                                    <div className="flex flex-col text-center">
                                                        <span className="font-bold text-lg text-brand-dark">{available}</span>
                                                        <span className="text-xs text-gray-500">
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
                                            <button onClick={() => handleOpenEditModal(balance)} className="text-gray-500 hover:text-brand-primary p-1" title="Edit Balances">
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
