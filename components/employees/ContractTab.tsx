import React, { useState } from 'react';
import type { Employee, ContractDetails } from '../../types';
import { updateContractDetails } from '../../services/api';
import { useToasts } from '../../hooks/useToasts';
import Button from '../common/Button';

interface ContractTabProps {
  employee: Employee;
  onUpdate: () => void;
}

const formInputClasses = "mt-1 block w-full border border-border bg-secondary rounded-md shadow-sm p-2 text-foreground focus:ring-primary focus:border-primary";
const formLabelClasses = "block text-sm font-medium text-muted-foreground";

const ContractTab: React.FC<ContractTabProps> = ({ employee, onUpdate }) => {
  const [formData, setFormData] = useState<ContractDetails | undefined>(employee.contract);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToasts();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    // Special handling for benefits array from comma-separated string
    if (name === 'benefitsString') {
      setFormData({ ...formData, benefits: value.split(',').map(s => s.trim()).filter(Boolean) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;
    setIsSubmitting(true);
    try {
        const processedData = {
            ...formData,
            salary: parseFloat(String(formData.salary)) || 0,
        };
        await updateContractDetails(employee.tenantId, employee.id, processedData);
        addToast("Contract details updated successfully.", "success");
        onUpdate();
    } catch (error) {
        addToast("Failed to update contract.", "error");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!formData) {
    return <div className="text-center p-8 text-muted-foreground">No contract details found for this employee.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold text-foreground mb-4">Employment Contract Details</h3>
        <form onSubmit={handleSubmit} className="space-y-4 bg-secondary p-6 border border-border rounded-lg">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="jobTitle" className={formLabelClasses}>Job Title</label>
                    <input type="text" id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className={formInputClasses} />
                </div>
                <div>
                    <label htmlFor="salary" className={formLabelClasses}>Total Salary (QAR)</label>
                    <input type="number" id="salary" name="salary" value={formData.salary} onChange={handleChange} className={formInputClasses} />
                </div>
                 <div>
                    <label htmlFor="startDate" className={formLabelClasses}>Start Date</label>
                    <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} className={formInputClasses} />
                </div>
                <div>
                    <label htmlFor="endDate" className={formLabelClasses}>End Date</label>
                    <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} className={formInputClasses} />
                </div>
            </div>
            <div>
                <label htmlFor="benefitsString" className={formLabelClasses}>Benefits</label>
                <input 
                  type="text" 
                  id="benefitsString" 
                  name="benefitsString" 
                  value={(formData.benefits || []).join(', ')} 
                  onChange={handleChange} 
                  className={formInputClasses}
                  placeholder="e.g., Health Insurance, Annual Air Ticket"
                />
                <p className="text-xs text-muted-foreground mt-1">Enter benefits separated by a comma.</p>
            </div>
            <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={isSubmitting}>Save Changes</Button>
            </div>
        </form>
    </div>
  );
};

export default ContractTab;