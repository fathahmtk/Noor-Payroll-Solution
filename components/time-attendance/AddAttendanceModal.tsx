import React, { useState } from 'react';
import type { Employee, AttendanceRecord } from '../../types.ts';
import Modal from '../common/Modal.tsx';
import Button from '../common/Button.tsx';
import { useToasts } from '../../hooks/useToasts.tsx';

interface AddAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRecord: (newRecord: Omit<AttendanceRecord, 'id' | 'hoursWorked' | 'employeeName' | 'tenantId'>) => void;
  employees: Employee[];
  isSubmitting: boolean;
}

const formInputClasses = "mt-1 block w-full border border-border bg-secondary rounded-md shadow-sm p-2 text-foreground focus:ring-primary focus:border-primary";
const formLabelClasses = "block text-sm font-medium text-muted-foreground";
const formSelectClasses = `${formInputClasses} bg-secondary`;

const AddAttendanceModal: React.FC<AddAttendanceModalProps> = ({ isOpen, onClose, onAddRecord, employees, isSubmitting }) => {
  const [formData, setFormData] = useState({
    employeeId: employees[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    checkIn: '08:00',
    checkOut: '17:00',
  });
  const { addToast } = useToasts();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId) {
        addToast("Please select an employee.", "error");
        return;
    }
    onAddRecord(formData);
  };
  
  const handleClose = () => {
    setFormData({
      employeeId: employees[0]?.id || '',
      date: new Date().toISOString().split('T')[0],
      checkIn: '08:00',
      checkOut: '17:00',
    });
    onClose();
  }

  const modalFooter = (
    <>
      <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
      <Button type="submit" form="add-attendance-form" isLoading={isSubmitting}>Add Record</Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Attendance Record" footer={modalFooter}>
      <form id="add-attendance-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="employeeId" className={formLabelClasses}>Employee</label>
                <select id="employeeId" name="employeeId" value={formData.employeeId} onChange={handleChange} className={formSelectClasses}>
                {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
                </select>
            </div>
             <div>
                <label htmlFor="date" className={formLabelClasses}>Date</label>
                <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required className={formInputClasses} />
            </div>
            <div>
                <label htmlFor="checkIn" className={formLabelClasses}>Check-in Time</label>
                <input type="time" id="checkIn" name="checkIn" value={formData.checkIn} onChange={handleChange} required className={formInputClasses} />
            </div>
            <div>
                <label htmlFor="checkOut" className={formLabelClasses}>Check-out Time</label>
                <input type="time" id="checkOut" name="checkOut" value={formData.checkOut} onChange={handleChange} required className={formInputClasses} />
            </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddAttendanceModal;