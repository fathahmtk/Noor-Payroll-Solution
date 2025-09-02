import React, { useState, useEffect, useCallback } from 'react';
import type { User, Employee } from '../../types';
import { getEmployeeById, updateEmployee } from '../../services/api';
import Button from '../common/Button';

interface MyProfileViewProps {
  user: User;
}

const MyProfileView: React.FC<MyProfileViewProps> = ({ user }) => {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({});
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchEmployeeData = useCallback(async () => {
    if (!user.employeeId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const data = await getEmployeeById(user.tenantId, user.employeeId);
    setEmployee(data);
    if (data) {
        setFormData(data);
    }
    setLoading(false);
  }, [user.employeeId, user.tenantId]);

  useEffect(() => {
    fetchEmployeeData();
  }, [fetchEmployeeData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    setIsSaving(true);
    setSaveSuccess(false);

    const updatedData: Employee = {
        ...employee,
        ...formData,
        basicSalary: parseFloat(String(formData.basicSalary)) || employee.basicSalary,
        allowances: parseFloat(String(formData.allowances)) || employee.allowances,
    };
    
    await updateEmployee(user.tenantId, updatedData);
    
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000); // Reset success message after 2s
  };

  if (loading) {
    return <div className="p-6">Loading your profile...</div>;
  }

  if (!employee) {
    return <div className="p-6">Could not find your employee details.</div>;
  }

  return (
    <div className="p-6">
        <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-semibold text-brand-dark mb-6">My Profile</h2>
             <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Personal Information Card */}
                    <div className="bg-brand-light p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-brand-dark border-b pb-2 mb-4">Personal Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Qatar ID (QID)</label>
                                <input type="text" value={employee.qid} readOnly className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Position</label>
                                <input type="text" value={employee.position} readOnly className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 cursor-not-allowed" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-500">Department</label>
                                <input type="text" value={employee.department} readOnly className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 cursor-not-allowed" />
                            </div>
                        </div>
                    </div>

                    {/* Bank Details Card */}
                     <div className="bg-brand-light p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-semibold text-brand-dark border-b pb-2 mb-4">Bank Details</h3>
                         <div className="space-y-4">
                            <div>
                                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">Bank Name</label>
                                <input type="text" id="bankName" name="bankName" value={formData.bankName || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                            </div>
                             <div>
                                <label htmlFor="iban" className="block text-sm font-medium text-gray-700">IBAN</label>
                                <input type="text" id="iban" name="iban" value={formData.iban || ''} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                            </div>
                         </div>
                    </div>
                </div>
                 <div className="flex justify-end mt-6">
                    <Button type="submit" isLoading={isSaving} disabled={saveSuccess}>
                        {saveSuccess ? 'Changes Saved!' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    </div>
  );
};

export default MyProfileView;
