import React from 'react';
import type { Employee } from '../../types';
import { EmployeeStatus, SponsorshipType, VisaType } from '../../types';

// Define a more flexible type for form data to handle string inputs for number fields
type EmployeeFormData = Omit<Partial<Employee>, 'basicSalary' | 'allowances' | 'deductions'> & {
  basicSalary?: string | number;
  allowances?: string | number;
  deductions?: string | number;
};

interface EmployeeFormFieldsProps {
  formData: EmployeeFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const formInputClasses = "mt-1 block w-full border border-border bg-secondary rounded-md shadow-sm p-2 text-foreground focus:ring-primary focus:border-primary";
const formLabelClasses = "block text-sm font-medium text-muted-foreground";
const formSelectClasses = `${formInputClasses} bg-secondary`;


const EmployeeFormFields: React.FC<EmployeeFormFieldsProps> = ({ formData, handleChange }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className={formLabelClasses}>Full Name</label>
          <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} required className={formInputClasses} />
        </div>
        <div>
          <label htmlFor="qid" className={formLabelClasses}>Qatar ID (QID)</label>
          <input type="text" id="qid" name="qid" value={formData.qid || ''} onChange={handleChange} required className={formInputClasses} />
        </div>
        <div>
          <label htmlFor="position" className={formLabelClasses}>Position</label>
          <input type="text" id="position" name="position" value={formData.position || ''} onChange={handleChange} required className={formInputClasses} />
        </div>
        <div>
          <label htmlFor="department" className={formLabelClasses}>Department</label>
          <select id="department" name="department" value={formData.department || 'Engineering'} onChange={handleChange} className={formSelectClasses}>
            <option>Engineering</option>
            <option>HR</option>
            <option>Marketing</option>
            <option>Sales</option>
            <option>Finance</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="basicSalary" className={formLabelClasses}>Basic Salary (QAR)</label>
          <input type="number" id="basicSalary" name="basicSalary" value={formData.basicSalary || ''} onChange={handleChange} required className={formInputClasses} />
        </div>
        <div>
          <label htmlFor="allowances" className={formLabelClasses}>Allowances (QAR)</label>
          <input type="number" id="allowances" name="allowances" value={formData.allowances || ''} onChange={handleChange} required className={formInputClasses} />
        </div>
        <div>
          <label htmlFor="deductions" className={formLabelClasses}>Deductions (QAR)</label>
          <input type="number" id="deductions" name="deductions" value={formData.deductions || ''} onChange={handleChange} required className={formInputClasses} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="bankName" className={formLabelClasses}>Bank Name</label>
          <input type="text" id="bankName" name="bankName" value={formData.bankName || ''} onChange={handleChange} required className={formInputClasses} />
        </div>
        <div>
          <label htmlFor="iban" className={formLabelClasses}>IBAN</label>
          <input type="text" id="iban" name="iban" value={formData.iban || ''} onChange={handleChange} required className={formInputClasses} />
        </div>
        <div>
          <label htmlFor="joinDate" className={formLabelClasses}>Joining Date</label>
          <input type="date" id="joinDate" name="joinDate" value={formData.joinDate || ''} onChange={handleChange} required className={formInputClasses} />
        </div>
      </div>
      
      <div className="pt-4 mt-4 border-t border-border">
        <h4 className="text-md font-semibold text-foreground mb-2">Compliance Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="status" className={formLabelClasses}>Employee Status</label>
                <select id="status" name="status" value={formData.status || EmployeeStatus.Active} onChange={handleChange} className={formSelectClasses}>
                    {Object.values(EmployeeStatus).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="sponsorship" className={formLabelClasses}>Sponsorship</label>
                <select id="sponsorship" name="sponsorship" value={formData.sponsorship || SponsorshipType.Company} onChange={handleChange} className={formSelectClasses}>
                    {Object.values(SponsorshipType).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="visaType" className={formLabelClasses}>Visa Type</label>
                <select id="visaType" name="visaType" value={formData.visaType || VisaType.WorkVisa} onChange={handleChange} className={formSelectClasses}>
                    {Object.values(VisaType).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
            </div>
            <div>
                <label htmlFor="residencyStatus" className={formLabelClasses}>Residency Status</label>
                <input type="text" id="residencyStatus" name="residencyStatus" value={formData.residencyStatus || ''} onChange={handleChange} className={formInputClasses} placeholder="e.g., Valid RP, In Process" />
            </div>
        </div>
      </div>
    </>
  );
};

export default EmployeeFormFields;