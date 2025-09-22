import React, { useState, useEffect } from 'react';
import type { Employee, PettyCashTransaction } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';

interface AddPettyCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<PettyCashTransaction, 'id' | 'tenantId' | 'employeeName' | 'status'>) => void;
  isSubmitting: boolean;
  employees: Employee[];
  onUpdate?: () => void;
}

const formInputClasses = "mt-1 block w-full border border-border bg-secondary rounded-md shadow-sm p-2 text-foreground focus:ring-primary focus:border-primary";
const formLabelClasses = "block text-sm font-medium text-muted-foreground";
const formSelectClasses = `${formInputClasses} bg-secondary`;
const formInputDisabledClasses = "mt-1 block w-full border border-border rounded-md shadow-sm p-2 bg-muted text-muted-foreground cursor-not-allowed";

const getInitialState = (employees: Employee[]) => ({
    employeeId: employees[0]?.id || '',
    department: employees[0]?.department || 'Engineering',
    date: new Date().toISOString().split('T')[0],
    description: '',
    type: 'Expense' as PettyCashTransaction['type'],
    amount: 0,
});

const AddPettyCashModal: React.FC<AddPettyCashModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting, employees }) => {
  const [formData, setFormData] = useState(getInitialState(employees));

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState(employees));
    }
  }, [isOpen, employees]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let updatedData = { ...formData, [name]: value };
    if (name === 'employeeId') {
        const selectedEmp = employees.find(emp => emp.id === value);
        if (selectedEmp) {
            updatedData.department = selectedEmp.department;
        }
    }
    setFormData(updatedData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const processedData = {
        ...formData,
        amount: Number(formData.amount),
    };
    onSubmit(processedData);
  };
  
  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
      <Button type="submit" form="add-petty-cash-form" isLoading={isSubmitting}>Submit Transaction</Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Petty Cash Transaction" footer={modalFooter}>
      <form id="add-petty-cash-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className={formLabelClasses}>Submitted By</label>
                <select name="employeeId" value={formData.employeeId} onChange={handleChange} required className={formSelectClasses}>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
            </div>
             <div>
                <label className={formLabelClasses}>Department</label>
                <input type="text" name="department" value={formData.department} readOnly className={formInputDisabledClasses} />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className={formLabelClasses}>Transaction Type</label>
                <select name="type" value={formData.type} onChange={handleChange} className={formSelectClasses}>
                    <option>Expense</option><option>Reimbursement</option><option>Top-up</option>
                </select>
            </div>
            <div>
                <label className={formLabelClasses}>Amount (QAR)</label>
                <input type="number" step="0.01" name="amount" value={formData.amount} onChange={handleChange} required className={formInputClasses} />
            </div>
        </div>
        <div>
            <label className={formLabelClasses}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} required className={formInputClasses} />
        </div>
        <div>
            <label className={formLabelClasses}>Transaction Date</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} required className={formInputClasses} />
        </div>
      </form>
    </Modal>
  );
};

export default AddPettyCashModal;