import React, { useState, useEffect, useCallback } from 'react';
import type { User, Employee } from '../../types';
import { getEmployeeById, updateEmployee } from '../../services/api';
import Button from '../common/Button.tsx';

interface MyProfileViewProps {
  user: User;
}

const formInputClasses = "mt-1 block w-full border border-border bg-secondary rounded-md shadow-sm p-2 text-foreground focus:ring-primary focus:border-primary";
const formLabelClasses = "block text-sm font-medium text-muted-foreground";
const formInputDisabledClasses = "mt-1 block w-full border border-border rounded-md shadow-sm p-2 bg-muted text-muted-foreground cursor-not-allowed";

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
            <h2 className="text-xl font-semibold text-foreground mb-6">My Profile</h2>
             <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Personal Information Card */}
                    <div className="bg-card p-6 rounded-lg shadow-md border border-border">
                        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 mb-4">Personal Information</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className={formLabelClasses}>Full Name</label>
                                <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} className={formInputClasses} />
                            </div>
                            <div>
                                <label className={formLabelClasses}>Qatar ID (QID)</label>
                                <input type="text" value={employee.qid} readOnly className={formInputDisabledClasses} />
                            </div>
                            <div>
                                <label className={formLabelClasses}>Position</label>
                                <input type="text" value={employee.position} readOnly className={formInputDisabledClasses} />
                            </div>
                            <div>
                                <label className={formLabelClasses}>Department</label>
                                <input type="text" value={employee.department} readOnly className={formInputDisabledClasses} />
                            </div>
                        </div>
                    </div>

                    {/* Bank Details Card */}
                     <div className="bg-card p-6 rounded-lg shadow-md border border-border">
                        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 mb-4">Bank Details</h3>
                         <div className="space-y-4">
                            <div>
                                <label htmlFor="bankName" className={formLabelClasses}>Bank Name</label>
                                <input type="text" id="bankName" name="bankName" value={formData.bankName || ''} onChange={handleChange} className={formInputClasses} />
                            </div>
                             <div>
                                <label htmlFor="iban" className={formLabelClasses}>IBAN</label>
                                <input type="text" id="iban" name="iban" value={formData.iban || ''} onChange={handleChange} className={formInputClasses} />
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