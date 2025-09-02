import React from 'react';
import type { Employee } from '../../types';

interface EmployeeFormFieldsProps {
  formData: Partial<Employee>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const EmployeeFormFields: React.FC<EmployeeFormFieldsProps> = ({ formData, handleChange }) => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
          <input type="text" id="name" name="name" value={formData.name || ''} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label htmlFor="qid" className="block text-sm font-medium text-gray-700">Qatar ID (QID)</label>
          <input type="text" id="qid" name="qid" value={formData.qid || ''} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
          <input type="text" id="position" name="position" value={formData.position || ''} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
          <select id="department" name="department" value={formData.department || 'Engineering'} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white">
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
          <label htmlFor="basicSalary" className="block text-sm font-medium text-gray-700">Basic Salary (QAR)</label>
          <input type="number" id="basicSalary" name="basicSalary" value={formData.basicSalary || ''} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label htmlFor="allowances" className="block text-sm font-medium text-gray-700">Allowances (QAR)</label>
          <input type="number" id="allowances" name="allowances" value={formData.allowances || ''} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label htmlFor="deductions" className="block text-sm font-medium text-gray-700">Deductions (QAR)</label>
          <input type="number" id="deductions" name="deductions" value={formData.deductions || ''} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">Bank Name</label>
          <input type="text" id="bankName" name="bankName" value={formData.bankName || ''} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label htmlFor="iban" className="block text-sm font-medium text-gray-700">IBAN</label>
          <input type="text" id="iban" name="iban" value={formData.iban || ''} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
          <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700">Joining Date</label>
          <input type="date" id="joinDate" name="joinDate" value={formData.joinDate || ''} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
      </div>
    </>
  );
};

export default EmployeeFormFields;
