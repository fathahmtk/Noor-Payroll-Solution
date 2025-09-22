import React, { useState } from 'react';
import type { Candidate, JobOpening, CandidateStatus } from '../../types';
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

const formInputClasses = "mt-1 block w-full border border-border bg-secondary rounded-md shadow-sm p-2 text-foreground focus:ring-primary focus:border-primary";
const formLabelClasses = "block text-sm font-medium text-muted-foreground";

const initialState = {
    name: '',
    email: '',
    phone: '',
    resumeUrl: '',
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
                <label htmlFor="name" className={formLabelClasses}>Full Name</label>
                <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className={formInputClasses} />
            </div>
            <div>
                <label htmlFor="email" className={formLabelClasses}>Email Address</label>
                <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className={formInputClasses} />
            </div>
        </div>
        <div>
            <label htmlFor="phone" className={formLabelClasses}>Phone Number</label>
            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required className={formInputClasses} />
        </div>
        <div>
            <label htmlFor="resumeUrl" className={formLabelClasses}>Resume URL</label>
            <input type="text" id="resumeUrl" name="resumeUrl" value={formData.resumeUrl} onChange={handleChange} required placeholder="e.g., https://linkedin.com/in/..." className={formInputClasses} />
            <p className="mt-1 text-xs text-muted-foreground">In this demo, please provide a link to a resume. File uploads are not supported.</p>
        </div>
      </form>
    </Modal>
  );
};

export default AddCandidateModal;