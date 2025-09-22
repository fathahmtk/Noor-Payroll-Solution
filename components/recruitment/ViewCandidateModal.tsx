import React from 'react';
import type { Candidate } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';

interface ViewCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: { candidate: Candidate, onUpdate: () => void } | null;
  onConvertToEmployee: (candidate: Candidate) => void;
}

const ViewCandidateModal: React.FC<ViewCandidateModalProps> = ({ isOpen, onClose, candidate: candidateData, onConvertToEmployee }) => {
  if (!candidateData) return null;
  
  const { candidate } = candidateData;

  const handleConvertToEmployee = () => {
      onClose(); // Close the current modal
      onConvertToEmployee(candidate);
  };

  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>Close</Button>
      {candidate.status === 'Hired' && (
        <Button onClick={handleConvertToEmployee}>Convert to Employee</Button>
      )}
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Candidate: ${candidate.name}`} footer={footer}>
      <div className="flex items-start space-x-4">
        <img src={candidate.avatarUrl} alt={candidate.name} className="w-20 h-20 rounded-full" />
        <div className="space-y-2 text-muted-foreground">
          <p><span className="font-semibold text-muted-foreground">Applying for:</span> <span className="text-foreground">{candidate.jobTitle}</span></p>
          <p><span className="font-semibold text-muted-foreground">Email:</span> <a href={`mailto:${candidate.email}`} className="text-primary hover:underline">{candidate.email}</a></p>
          <p><span className="font-semibold text-muted-foreground">Phone:</span> <span className="text-foreground">{candidate.phone}</span></p>
          <p><span className="font-semibold text-muted-foreground">Status:</span> <span className="text-foreground">{candidate.status}</span></p>
          <p><span className="font-semibold text-muted-foreground">Applied on:</span> <span className="text-foreground">{new Date(candidate.appliedDate).toLocaleDateString()}</span></p>
          <a href={candidate.resumeUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm" className="mt-2">View Resume</Button>
          </a>
        </div>
      </div>
    </Modal>
  );
};

export default ViewCandidateModal;