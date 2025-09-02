import React, { useState, useEffect } from 'react';
import type { Employee } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import EmployeeFormFields from './EmployeeFormFields';

interface EditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateEmployee: (updatedEmployee: Employee) => void;
  employee: Employee | null;
  isSubmitting: boolean;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({ isOpen, onClose, onUpdateEmployee, employee, isSubmitting }) => {
  const [formData, setFormData] = useState<Partial<Employee>>({});

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    }
  }, [employee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;
    
    onUpdateEmployee({
      ...employee,
      ...formData,
      basicSalary: parseFloat(String(formData.basicSalary)) || 0,
      allowances: parseFloat(String(formData.allowances)) || 0,
      deductions: parseFloat(String(formData.deductions)) || 0,
    });
  };

  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
      <Button type="submit" form="edit-employee-form" isLoading={isSubmitting}>Save Changes</Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Employee Details" footer={modalFooter}>
      <form id="edit-employee-form" onSubmit={handleSubmit} className="space-y-4">
        <EmployeeFormFields formData={formData} handleChange={handleChange} />
      </form>
    </Modal>
  );
};

export default EditEmployeeModal;