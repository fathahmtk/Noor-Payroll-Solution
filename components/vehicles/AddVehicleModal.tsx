import React, { useState, useEffect } from 'react';
import type { CompanyVehicle, Employee } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CompanyVehicle | Omit<CompanyVehicle, 'id' | 'tenantId'>) => void;
  isSubmitting: boolean;
  vehicleToEdit?: CompanyVehicle;
  employees: Employee[];
  onUpdate: () => void;
}

const formInputClasses = "mt-1 block w-full border border-border bg-secondary rounded-md shadow-sm p-2 text-foreground focus:ring-primary focus:border-primary";
const formLabelClasses = "block text-sm font-medium text-muted-foreground";
const formSelectClasses = `${formInputClasses} bg-secondary`;

const getInitialState = () => ({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    plateNumber: '',
    registrationExpiry: '',
    insuranceExpiry: '',
    assignedToEmployeeId: undefined,
});

const AddVehicleModal: React.FC<AddVehicleModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting, vehicleToEdit, employees }) => {
  const isEditMode = !!vehicleToEdit;
  const [formData, setFormData] = useState<Partial<CompanyVehicle>>(isEditMode ? vehicleToEdit : getInitialState());

  useEffect(() => {
    if (isOpen) {
      setFormData(isEditMode ? vehicleToEdit : getInitialState());
    }
  }, [isOpen, vehicleToEdit, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const processedData = {
        ...getInitialState(),
        ...formData,
        year: Number(formData.year),
    };

    if (isEditMode) {
        onSubmit({ ...vehicleToEdit, ...processedData } as CompanyVehicle);
    } else {
        onSubmit(processedData as Omit<CompanyVehicle, 'id' | 'tenantId'>);
    }
  };

  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
      <Button type="submit" form="add-vehicle-form" isLoading={isSubmitting}>
        {isEditMode ? 'Save Changes' : 'Add Vehicle'}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit Vehicle' : 'Add New Vehicle'} footer={modalFooter}>
      <form id="add-vehicle-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className={formLabelClasses}>Make</label>
                <input type="text" name="make" value={formData.make || ''} onChange={handleChange} required className={formInputClasses} />
            </div>
            <div>
                <label className={formLabelClasses}>Model</label>
                <input type="text" name="model" value={formData.model || ''} onChange={handleChange} required className={formInputClasses} />
            </div>
            <div>
                <label className={formLabelClasses}>Year</label>
                <input type="number" name="year" value={formData.year || ''} onChange={handleChange} required className={formInputClasses} />
            </div>
            <div>
                <label className={formLabelClasses}>Plate Number</label>
                <input type="text" name="plateNumber" value={formData.plateNumber || ''} onChange={handleChange} required className={formInputClasses} />
            </div>
            <div>
                <label className={formLabelClasses}>Registration Expiry</label>
                <input type="date" name="registrationExpiry" value={formData.registrationExpiry || ''} onChange={handleChange} required className={formInputClasses} />
            </div>
            <div>
                <label className={formLabelClasses}>Insurance Expiry</label>
                <input type="date" name="insuranceExpiry" value={formData.insuranceExpiry || ''} onChange={handleChange} required className={formInputClasses} />
            </div>
        </div>
        <div>
            <label className={formLabelClasses}>Assigned To</label>
            <select name="assignedToEmployeeId" value={formData.assignedToEmployeeId || ''} onChange={handleChange} className={formSelectClasses}>
                <option value="">-- Unassigned --</option>
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
        </div>
      </form>
    </Modal>
  );
};

export default AddVehicleModal;