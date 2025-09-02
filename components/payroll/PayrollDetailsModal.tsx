import React from 'react';
import type { PayrollRun } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';

interface PayrollDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  payrollRun: PayrollRun | null;
}

const InfoRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="flex justify-between items-center text-sm py-2 border-b">
        <p className="text-gray-500">{label}</p>
        <p className="font-semibold text-brand-dark">{value}</p>
    </div>
);

const PayrollDetailsModal: React.FC<PayrollDetailsModalProps> = ({ isOpen, onClose, payrollRun }) => {
  if (!payrollRun) return null;

  const footer = <Button variant="secondary" onClick={onClose}>Close</Button>;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Payroll Details: ${payrollRun.month} ${payrollRun.year}`} footer={footer}>
        <div className="space-y-3">
            <InfoRow label="Payroll Period" value={`${payrollRun.month} ${payrollRun.year}`} />
            <InfoRow label="Run Date" value={new Date(payrollRun.runDate).toLocaleDateString()} />
            <InfoRow label="Status" value={payrollRun.status} />
            <InfoRow label="Number of Employees" value={payrollRun.employeeCount} />
             <div className="border-t my-2 pt-2">
                <InfoRow label="Total Net Payroll Amount" value={`QAR ${payrollRun.totalAmount.toLocaleString()}`} />
             </div>
        </div>
        <div className="mt-4 text-xs text-gray-500">
            <p>This summary reflects the payroll run at the time of execution. For employee-specific breakdowns, please refer to the generated WPS SIF file.</p>
        </div>
    </Modal>
  );
};

export default PayrollDetailsModal;
