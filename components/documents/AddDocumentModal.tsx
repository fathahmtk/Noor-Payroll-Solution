import React, { useState, useEffect } from 'react';
import type { Employee, EmployeeDocument } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useToasts } from '../../hooks/useToasts';

interface AddDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDocument: (newDocument: Omit<EmployeeDocument, 'id' | 'employeeName' | 'tenantId'>) => void;
  employees: Employee[];
  isSubmitting: boolean;
}

const AddDocumentModal: React.FC<AddDocumentModalProps> = ({ isOpen, onClose, onAddDocument, employees, isSubmitting }) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    documentType: 'QID' as EmployeeDocument['documentType'],
    issueDate: '',
    expiryDate: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { addToast } = useToasts();

  useEffect(() => {
    if (isOpen && employees.length > 0) {
      setFormData(prev => ({ ...prev, employeeId: employees[0].id }));
    }
  }, [isOpen, employees]);

  useEffect(() => {
      // FIX: Use ReturnType<typeof setInterval> for browser compatibility instead of NodeJS.Timeout.
      let interval: ReturnType<typeof setInterval>;
      if (isSubmitting) {
          interval = setInterval(() => {
              setUploadProgress(prev => {
                  if (prev >= 95) {
                      clearInterval(interval);
                      return 95;
                  }
                  return prev + 10;
              });
          }, 120);
      } else {
          setUploadProgress(0);
      }
      return () => clearInterval(interval);
  }, [isSubmitting]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setFile(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
     if (!formData.employeeId || !file) {
        addToast("Please select an employee and a file to upload.", "error");
        return;
    }
    
    onAddDocument({
        ...formData,
        s3_key: `docs/${formData.employeeId}/${file.name}`,
        version: 1 // Assume new uploads are always version 1
    });
  };
  
  const handleClose = () => {
    setFormData({
      employeeId: employees[0]?.id || '',
      documentType: 'QID',
      issueDate: '',
      expiryDate: '',
    });
    setFile(null);
    setUploadProgress(0);
    onClose();
  }

  const modalFooter = (
    <>
      <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
      <Button type="submit" form="add-document-form" isLoading={isSubmitting} disabled={!file}>
        {isSubmitting ? `Uploading...` : 'Add Document'}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload New Document" footer={modalFooter}>
        <form id="add-document-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="doc-employeeId" className="block text-sm font-medium text-gray-700">Employee</label>
                    <select id="doc-employeeId" name="employeeId" value={formData.employeeId} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white">
                    {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                    </select>
                </div>
                 <div>
                    <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">Document Type</label>
                    <select id="documentType" name="documentType" value={formData.documentType} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white">
                        <option>QID</option>
                        <option>Passport</option>
                        <option>Visa</option>
                        <option>Labor Contract</option>
                        <option>Other</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="issueDate" className="block text-sm font-medium text-gray-700">Issue Date</label>
                    <input type="date" id="issueDate" name="issueDate" value={formData.issueDate} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
                <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">Expiry Date</label>
                    <input type="date" id="expiryDate" name="expiryDate" value={formData.expiryDate} required onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Document File</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brand-primary hover:text-blue-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-primary">
                                <span>Upload a file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                    </div>
                </div>
                {file && <p className="mt-2 text-sm text-gray-500">Selected file: {file.name}</p>}
            </div>

            {isSubmitting && (
                <div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-brand-primary h-2.5 rounded-full transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                </div>
            )}
        </form>
    </Modal>
  );
};

export default AddDocumentModal;