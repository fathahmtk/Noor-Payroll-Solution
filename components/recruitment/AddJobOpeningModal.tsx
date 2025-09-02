import React, { useState } from 'react';
import type { JobOpening, Employee } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { generateJobDescription } from '../../services/geminiService';

interface AddJobOpeningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddJob: (newJob: Omit<JobOpening, 'id' | 'datePosted' | 'tenantId'>) => void;
  isSubmitting: boolean;
  onUpdate: () => void;
}

const initialState = {
    title: '',
    department: 'Engineering' as Employee['department'],
    location: 'Doha, Qatar',
    status: 'Open' as 'Open' | 'Closed',
    description: '',
};

const AddJobOpeningModal: React.FC<AddJobOpeningModalProps> = ({ isOpen, onClose, onAddJob, isSubmitting, onUpdate }) => {
  const [formData, setFormData] = useState(initialState);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleGenerateDescription = async () => {
    if (!formData.title) return;
    setIsGenerating(true);
    const desc = await generateJobDescription(formData.title);
    setFormData(prev => ({...prev, description: desc}));
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddJob(formData);
    onUpdate();
  };
  
  const handleClose = () => {
    setFormData(initialState);
    onClose();
  }

  const modalFooter = (
    <>
      <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
      <Button type="submit" form="add-job-form" isLoading={isSubmitting}>Post Job</Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Post New Job Opening" footer={modalFooter}>
      <form id="add-job-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Job Title</label>
                <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700">Department</label>
                <select id="department" name="department" value={formData.department} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white">
                    <option>Engineering</option><option>HR</option><option>Marketing</option><option>Sales</option><option>Finance</option>
                </select>
            </div>
        </div>
        <div>
            <div className="flex justify-between items-center mb-1">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Job Description</label>
                <Button variant="secondary" size="sm" onClick={handleGenerateDescription} isLoading={isGenerating}>Generate with Gemini</Button>
            </div>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={6} required className="block w-full border border-gray-300 rounded-md shadow-sm p-2" />
        </div>
      </form>
    </Modal>
  );
};

export default AddJobOpeningModal;
