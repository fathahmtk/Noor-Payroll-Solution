import React, { useState } from 'react';
import type { Candidate, JobOpening } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';

interface AddCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCandidate: (newCandidate: Omit<Candidate, 'id' | 'appliedDate' | 'avatarUrl' | 'tenantId' | 'jobTitle'>) => void;
  isSubmitting: boolean;
  jobOpening: JobOpening | null;
  onUpdate: () => void;
}

const initialState = {
    name: '',
    email: '',
    phone: '',
    resumeUrl: 'mock/resume.pdf',
};

const AddCandidateModal: React.FC<AddCandidateModalProps> = ({ isOpen, onClose, onAddCandidate, isSubmitting, jobOpening, onUpdate }) => {
  const [formData, setFormData] = useState(initialState);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobOpening) return;
    
    onAddCandidate({
        ...formData,
        jobOpeningId: jobOpening.id,
        status: 'Applied',
    });
    onUpdate();
  };
  
  const handleClose = () => {
    setFormData(initialState);
    onClose();
  }

  const modalFooter = (
    <>
      <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
      <Button type="submit" form="add-candidate-form" isLoading={isSubmitting}>Add Candidate</Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Add Candidate for ${jobOpening?.title}`} footer={modalFooter}>
      <form id="add-candidate-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
        </div>
        <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Resume/CV</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-brand-primary hover:text-blue-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-primary">
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF up to 10MB</p>
                </div>
            </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddCandidateModal;
