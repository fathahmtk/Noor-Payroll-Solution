import React, { useState, useEffect } from 'react';
import type { CompanyVehicle, Employee, VehicleLog } from '../../types';
import Modal from '../common/Modal';
import Button from '../common/Button';

interface AddVehicleLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<VehicleLog, 'id' | 'tenantId' | 'vehicleName' | 'employeeName'>) => void;
  isSubmitting: boolean;
  vehicles: CompanyVehicle[];
  employees: Employee[];
}

const formInputClasses = "mt-1 block w-full border border-border bg-secondary rounded-md shadow-sm p-2 text-foreground focus:ring-primary focus:border-primary";
const formLabelClasses = "block text-sm font-medium text-muted-foreground";
const formSelectClasses = `${formInputClasses} bg-secondary`;

const getInitialState = (vehicles: CompanyVehicle[], employees: Employee[]) => ({
    vehicleId: vehicles[0]?.id || '',
    employeeId: employees[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    startMileage: '',
    endMileage: '',
    purpose: '',
    fuelCost: '',
});

const AddVehicleLogModal: React.FC<AddVehicleLogModalProps> = ({ isOpen, onClose, onSubmit, isSubmitting, vehicles, employees }) => {
  const [formData, setFormData] = useState(getInitialState(vehicles, employees));

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialState(vehicles, employees));
    }
  }, [isOpen, vehicles, employees]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { startMileage, endMileage, fuelCost, ...rest } = formData;
    const processedData = {
        ...rest,
        startMileage: Number(startMileage) || 0,
        endMileage: Number(endMileage) || 0,
        fuelCost: fuelCost ? Number(fuelCost) : undefined,
    };
    onSubmit(processedData);
  };

  const modalFooter = (
    <>
      <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
      <Button type="submit" form="add-log-form" isLoading={isSubmitting}>
        Add Log
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Vehicle Log" footer={modalFooter}>
      <form id="add-log-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className={formLabelClasses}>Vehicle</label>
                <select name="vehicleId" value={formData.vehicleId} onChange={handleChange} required className={formSelectClasses}>
                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.make} {v.model} ({v.plateNumber})</option>)}
                </select>
            </div>
            <div>
                <label className={formLabelClasses}>Driver</label>
                <select name="employeeId" value={formData.employeeId} onChange={handleChange} required className={formSelectClasses}>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
            </div>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className={formLabelClasses}>Start Mileage</label>
                <input type="number" name="startMileage" value={formData.startMileage} onChange={handleChange} required className={formInputClasses} />
            </div>
            <div>
                <label className={formLabelClasses}>End Mileage</label>
                <input type="number" name="endMileage" value={formData.endMileage} onChange={handleChange} required className={formInputClasses} />
            </div>
        </div>
        <div>
            <label className={formLabelClasses}>Purpose of Trip</label>
            <textarea name="purpose" value={formData.purpose} onChange={handleChange} rows={2} required className={formInputClasses} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className={formLabelClasses}>Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} required className={formInputClasses} />
            </div>
            <div>
                <label className={formLabelClasses}>Fuel Cost (QAR)</label>
                <input type="number" step="0.01" name="fuelCost" value={formData.fuelCost} onChange={handleChange} className={formInputClasses} />
            </div>
        </div>
      </form>
    </Modal>
  );
};

export default AddVehicleLogModal;