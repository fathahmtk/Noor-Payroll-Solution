import React, { useState } from 'react';
import type { Employee, ContractDetails } from '../../types';
import { updateContractDetails } from '../../services/api';
import { useToasts } from '../../hooks/useToasts';
import Button from '../common/Button';

interface ContractTabProps {
  employee: Employee;
  onUpdate: () => void;
}

const ContractTab: React.FC<ContractTabProps> = ({ employee, onUpdate }) => {
  const [formData, setFormData] = useState<ContractDetails | undefined>(employee.contract);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToasts();
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
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
    return <div className="text-center p-8 text-gray-500">No contract details found for this employee.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold text-brand-dark mb-4">Employment Contract Details</h3>
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 border rounded-lg">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">Job Title</label>
                    <input type="text" id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label htmlFor="salary" className="block text-sm font-medium text-gray-700">Total Salary (QAR)</label>
                    <input type="number" id="salary" name="salary" value={formData.salary} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                 <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                    <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
            </div>
            <div className="flex justify-end pt-2">
                <Button type="submit" isLoading={isSubmitting}>Save Changes</Button>
            </div>
        </form>
    </div>
  );
};

export default ContractTab;
