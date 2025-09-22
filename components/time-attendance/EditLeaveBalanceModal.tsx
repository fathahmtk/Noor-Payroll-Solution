import React, { useState, useEffect } from 'react';
import type { LeaveBalance } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';

interface EditLeaveBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedBalance: LeaveBalance) => void;
  balance: LeaveBalance | null;
  isSubmitting: boolean;
}

const formInputClasses = "mt-1 block w-full border border-border bg-secondary rounded-md shadow-sm p-2 text-foreground focus:ring-primary focus:border-primary";
const formLabelClasses = "block text-sm font-medium text-muted-foreground";

const EditLeaveBalanceModal: React.FC<EditLeaveBalanceModalProps> = ({ isOpen, onClose, onUpdate, balance, isSubmitting }) => {
  const [formData, setFormData] = useState<LeaveBalance | null>(null);

  useEffect(() => {
    if (balance) {
      // Deep copy to avoid mutating the prop directly
      setFormData(JSON.parse(JSON.stringify(balance)));
    } else {
        setFormData(null);
    }
  }, [balance, isOpen]); // Also reset on open/close

  const handleBalanceChange = (index: number, field: 'totalDays' | 'usedDays', value: string) => {
    if (!formData) return;

    const newBalances = [...formData.balances];
    const numValue = parseInt(value, 10);
    
    newBalances[index] = { ...newBalances[index], [field]: isNaN(numValue) ? 0 : numValue };
    setFormData({ ...formData, balances: newBalances });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    onUpdate(formData);
  };

  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
      <Button type="submit" form="edit-balance-form" isLoading={isSubmitting}>Save Changes</Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Leave Balances for ${balance?.employeeName}`} footer={modalFooter}>
      <form id="edit-balance-form" onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-muted-foreground">Update the leave balances for the current year. Values are in days.</p>
        
        {formData?.balances?.map((balanceDetail, index) => (
            <div key={balanceDetail.leaveType} className="p-4 border border-border rounded-lg bg-secondary">
                <h4 className="font-semibold text-foreground mb-3">{balanceDetail.leaveType} Leave</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor={`totalDays-${index}`} className={formLabelClasses}>Total Allotted Days</label>
                        <input
                            type="number"
                            id={`totalDays-${index}`}
                            name="totalDays"
                            value={balanceDetail.totalDays}
                            onChange={(e) => handleBalanceChange(index, 'totalDays', e.target.value)}
                            required
                            className={formInputClasses}
                        />
                    </div>
                    <div>
                        <label htmlFor={`usedDays-${index}`} className={formLabelClasses}>Days Used</label>
                        <input
                            type="number"
                            id={`usedDays-${index}`}
                            name="usedDays"
                            value={balanceDetail.usedDays}
                            onChange={(e) => handleBalanceChange(index, 'usedDays', e.target.value)}
                            required
                            className={formInputClasses}
                        />
                    </div>
                </div>
            </div>
        ))}

        {(!formData?.balances || formData.balances.length === 0) && <p>No balance details to edit.</p>}

      </form>
    </Modal>
  );
};

export default EditLeaveBalanceModal;