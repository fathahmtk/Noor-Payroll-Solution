import React, { useState, useEffect } from 'react';
import type { Employee } from '../../types.ts';
import { EmployeeStatus, SponsorshipType, VisaType } from '../../types.ts';
import { generateJobDescription } from '../../services/geminiService.ts';
import Modal from '../common/Modal.tsx';
import Button from '../common/Button.tsx';
import EmployeeFormFields from './EmployeeFormFields.tsx';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (newEmployee: Omit<Employee, 'id' | 'avatarUrl' | 'tenantId'>) => void;
  isSubmitting: boolean;
  initialData?: Partial<Omit<Employee, 'id' | 'avatarUrl' | 'tenantId'>>;
}

const initialState: Omit<Employee, 'id' | 'avatarUrl' | 'tenantId' | 'basicSalary' | 'allowances' | 'deductions'> & { basicSalary: string; allowances: string; deductions: string } = {
    name: '',
    qid: '',
    position: '',
    department: 'Engineering',
    basicSalary: '',
    allowances: '',
    deductions: '',
    bankName: '',
    iban: '',
    joinDate: '',
    status: EmployeeStatus.Active,
    sponsorship: SponsorshipType.Company,
    visaType: VisaType.WorkVisa,
    residencyStatus: 'Valid RP',
};

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onAddEmployee, isSubmitting, initialData }) => {
  const [formData, setFormData] = useState(initialState);
  const [isGenerating, setIsGenerating] = useState(false);
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            // When opening with initial data (e.g., from candidate conversion),
            // populate the form, ensuring number fields are converted to strings for the input elements.
            setFormData({
                ...initialState,
                ...initialData,
                name: initialData.name || '',
                position: initialData.position || '',
                basicSalary: initialData.basicSalary?.toString() ?? '',
                allowances: initialData.allowances?.toString() ?? '',
                deductions: initialData.deductions?.toString() ?? '',
            });
        } else {
            setFormData(initialState);
        }
    }
  }, [isOpen, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateDescription = async () => {
    if (!formData.position) return;
    setIsGenerating(true);
    const desc = await generateJobDescription(formData.position);
    setDescription(desc);
    setIsGenerating(false);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddEmployee({
      ...formData,
      basicSalary: parseFloat(formData.basicSalary) || 0,
      allowances: parseFloat(formData.allowances) || 0,
      deductions: parseFloat(formData.deductions) || 0,
      _candidateId: initialData?._candidateId,
    });
  };
  
  const handleClose = () => {
    setFormData(initialState);
    setDescription('');
    onClose();
  }

  const modalFooter = (
    <>
      <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
      <Button type="submit" form="add-employee-form" isLoading={isSubmitting}>Add Employee</Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Employee" footer={modalFooter}>
      <form id="add-employee-form" onSubmit={handleSubmit} className="space-y-4">
        <EmployeeFormFields formData={formData} handleChange={handleChange} />
        
        {formData.position && (
          <div className="p-3 bg-secondary rounded-md border border-border">
            <div className="flex justify-between items-center">
                <p className="text-sm font-medium text-card-foreground">Job Description Preview</p>
                <Button variant="secondary" size="sm" onClick={handleGenerateDescription} isLoading={isGenerating}>
                 Generate with Gemini
                </Button>
            </div>
            {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
          </div>
        )}
      </form>
    </Modal>
  );
};

export default AddEmployeeModal;