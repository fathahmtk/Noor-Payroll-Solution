import React, { useState } from 'react';
import type { LeaveRequest, LeaveType } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useToasts } from '../../hooks/useToasts';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newRequest: Omit<LeaveRequest, 'id' | 'status' | 'employeeName' | 'tenantId'>) => void;
  employeeId: string;
  isSubmitting: boolean;
}

const leaveTypes: LeaveType[] = ['Annual', 'Sick', 'Unpaid', 'Maternity'];

const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({ isOpen, onClose, onSubmit, employeeId, isSubmitting }) => {
  const [formData, setFormData] = useState({
    leaveType: 'Annual' as LeaveType,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    reason: '',
  });
  const { addToast } = useToasts();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.startDate || !formData.endDate) {
        addToast("Please select a start and end date.", "error");
        return;
    }
     if (new Date(formData.endDate) < new Date(formData.startDate)) {
        addToast("End date cannot be before the start date.", "error");
        return;
    }
    onSubmit({
        employeeId,
        ...formData
    });
  };
  
  const handleClose = () => {
    setFormData({
      leaveType: 'Annual',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      reason: '',
    });
    onClose();
  }

  const modalFooter = (
    <>
      <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>Cancel</Button>
      <Button type="submit" form="leave-request-form" isLoading={isSubmitting}>Submit Request</Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Submit Leave Request" footer={modalFooter}>
      <form id="leave-request-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
            <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700">Leave Type</label>
            <select id="leaveType" name="leaveType" value={formData.leaveType} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-white">
                {leaveTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
            </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
        </div>
        <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason (Optional)</label>
            <textarea id="reason" name="reason" value={formData.reason} onChange={handleChange} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"></textarea>
        </div>
      </form>
    </Modal>
  );
};

export default LeaveRequestModal;
